import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useNotify } from '../hooks/NotifyContext'
import useWindowSize from '../hooks/WindowSizeHook'
import { Button } from './common'

const consoleShow = keyframes`
  0% {bottom: -100px;}
  45% {bottom: 0;}
  100% {bottom: 0;}
`
const historyShow = keyframes`
  0% {transform: scaleY(0);}
  55% {transform: scaleY(0);}
  100% {transform: scaleY(1);}
`
const StyledTextChat = styled.section`
  display: ${p => (p.active ? 'flex' : 'none')};
  justify-content: center;
  height: 200px;
  position: absolute;
  overflow: hidden;
  bottom: 6rem;
  left: 0;
  right: 0;
`
const TextHistory = styled.div`
  position: absolute;
  bottom: 38px;
  font-size: 1.6rem;
  background-image: linear-gradient(#00000000, #000000ff);
  filter: opacity(0.4);
  max-height: 15rem;
  overflow-y: auto;
  width: 92%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  transform: scaleY(0);
  transform-origin: bottom;
  animation-fill-mode: forwards;
  animation-name: ${historyShow};
  animation-duration: 0.8s;
`
const TextComment = styled.p`
  padding: 2px;

  &.text-local {
    text-align: right;
    align-self: flex-end;
    max-width: 85%;
  }

  &.text-remote {
    text-align: left;
    align-self: flex-start;
    max-width: 85%;
    color: #e7b6ff;
    text-shadow: 0 0 1px #000;
  }
`
const TextConsole = styled.form`
  display: flex;
  position: absolute;
  bottom: 0;
  left: 2%;
  right: 2%;
  opacity: 0.7;
  transform-origin: left bottom;
  animation-fill-mode: forwards;
  animation-name: ${consoleShow};
  animation-duration: 0.8s;
`
const ConsoleInput = styled.input`
  background-color: #313131;
  border: 0;
  border-bottom: 3px solid ${p => (p.value ? p.theme.colorPrimary : p.theme.colorPrimaryLight)};
  border-radius: 10px 0 0 10px;
  padding: 4px;
  flex: 1;
  font-size: 16px;
  outline: none;
  color: inherit;
  font-family: inherit;
  transition: 0.4s all;
`
const ConsoleButton = styled(Button)`
  border-radius: 0 10px 10px 0;
  padding: 8px 14px;
`

export default function TextChat(props) {
  const { user, socketHelper, room } = props

  const [comment, setComment] = React.useState('')
  const [textChat, setTextChat] = React.useState([])
  const [lastReadMsg, setLastReadMsg] = React.useState(-1)

  const messagesEnd = React.useRef()

  const { setTextNotify } = useNotify()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const { isPC } = useWindowSize()

  const onComment = e => {
    setTextChat(prev => [...prev, { comment: e.text, userId: e.userId }])
  }

  React.useEffect(() => {
    socketHelper.socket.on('comment', onComment)
    return () => {
      socketHelper.socket.off('comment', onComment)
    }
  }, [socketHelper.socket])

  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    if (enabledWidgets.text) {
      scrollToBottom()
      if (lastReadMsg < textChat.length - 1) {
        setLastReadMsg(textChat.length - 1)
        setTextNotify(0)
      }
    } else {
      setTextNotify(textChat.length - 1 - lastReadMsg)
    }
    console.log(lastReadMsg)
  }, [enabledWidgets.text, textChat, lastReadMsg, setTextNotify])

  const handleSubmit = e => {
    if (e) e.preventDefault()
    if (!socketHelper || !comment) {
      console.log(`No sockethelper! ${socketHelper} ${comment}`)
      return
    }
    socketHelper.emit('send', {
      userId: user.id,
      text: comment,
      roomId: room,
    })

    setComment('')
  }

  const handleConsoleFocus = isFocus => {
    if (isPC) return
    setEnabledWidgets({ ...enabledWidgets, localVideo: !isFocus })
  }

  return (
    <StyledTextChat active={enabledWidgets.text}>
      <TextHistory>
        {textChat.map((sentComment, index) => (
          <TextComment key={index} className={`text-${sentComment.userId === user.id ? 'local' : 'remote'}`}>
            {sentComment.comment}
          </TextComment>
        ))}
        <div ref={messagesEnd} />
      </TextHistory>
      <TextConsole onSubmit={handleSubmit}>
        <ConsoleInput
          data-cy="commentInput"
          type="text"
          value={comment}
          onFocus={() => handleConsoleFocus(true)}
          onBlur={() => handleConsoleFocus(false)}
          onChange={e => setComment(e.target.value)}
        />
        <ConsoleButton data-cy="commentSubmitButton" disabled={!comment} onClick={handleSubmit}>
          <i className="fas fa-paper-plane" />
        </ConsoleButton>
      </TextConsole>
    </StyledTextChat>
  )
}

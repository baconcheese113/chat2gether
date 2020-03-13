import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useNotify } from '../hooks/NotifyContext'
import { Button } from './common'

// const consoleCollapse = keyframes`
//   0%{transform: translateY(0)}
//   50%{transform: translateY(0)}
//   60% {transform: translateY(-5px);}
//   70%{transform: translateY(0)}
//   100% {transform: translateY(80px);}
// `
const consoleShow = keyframes`
  0% {transform: translateY(120px);}
  30%{transform: translateY(0)}
  40% {transform: translateY(-5px);}
  50%{transform: translateY(0)}
  100%{transform: translateY(0)}
`
// const historyCollapse = keyframes`
//   0%{transform: translateY(0)}
//   10% {transform: translateY(-10px);}
//   40%{transform: translateY(0)}
//   100% {transform: translateY(250px);}
// `
const historyShow = keyframes`
  0% {transform: translateY(250px) scaleY(0);}
  50% {transform: translateY(250px) scaleY(0);}
  60%{transform: translateY(0) scaleY(1);}
  90% {transform: translateY(-10px);}
  100%{transform: translateY(0);}
`

const StyledTextChat = styled.section`
  border-radius: 20px;
  padding: 5px;

  display: ${p => (p.active ? 'block' : 'none')};
  position: absolute;
  overflow: hidden;
  background-color: transparent;
  bottom: 6rem;
  left: 0;
  width: 100%;
  margin: 0;
  padding: 0;
`

const TextHistory = styled.div`
  font-size: 1.8rem;
  background-image: linear-gradient(#00000000, #000000ff);
  filter: opacity(0.4);
  margin: 0 auto 4rem;
  max-height: 15rem;
  overflow-y: scroll;
  width: 80%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  animation-fill-mode: forwards;
  animation-name: ${historyShow};
  animation-duration: 0.6s;
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
  width: 100%;
  background-color: #9932cc;
  padding: 3px 5px;
  border-radius: 20px 20px 0 0;
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  animation-fill-mode: forwards;
  animation-name: ${consoleShow};
  animation-duration: 0.6s;
`

const ConsoleInput = styled.input`
  outline: none;
  margin: 2px;
  cursor: pointer;

  width: calc(100% - 35px);
  background-color: #c38fdd;
  border: 3px solid #c38fdd;
  border-radius: 10px 0 0 10px;
  padding: 2px;
  font-size: 16px;
  font-family: inherit;
`
const ConsoleButton = styled(Button)`
  border-radius: 0 10px 10px 0;
  font-size: 1.7rem;
  text-align: left;
  margin-left: -2px;
  padding: 0.5rem 2rem 0.5rem 0.5rem;
`

export default function TextChat(props) {
  const { user, socketHelper, room } = props

  const [comment, setComment] = React.useState('')
  const [textChat, setTextChat] = React.useState([])
  const [lastReadMsg, setLastReadMsg] = React.useState(-1)

  const messagesEnd = React.useRef()

  const { setTextNotify } = useNotify()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()

  const onComment = e => {
    console.log(...textChat)
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
  }, [enabledWidgets.text, textChat, lastReadMsg])

  const renderTextChat = React.useCallback(() => {
    return textChat.map((sentComment, index) => {
      return (
        <TextComment key={index} className={`text-${sentComment.userId === user.id ? 'local' : 'remote'}`}>
          {sentComment.comment}
        </TextComment>
      )
    })
  }, [textChat])

  const handleSubmit = e => {
    e && e.preventDefault()
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
    if (window.innerWidth > 600) return
    setEnabledWidgets({ ...enabledWidgets, localVideo: !isFocus })
  }

  return (
    <StyledTextChat active={enabledWidgets.text}>
      <TextHistory>
        {renderTextChat()}
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
        <ConsoleButton data-cy="commentSubmitButton" onClick={handleSubmit} label="Send" />
      </TextConsole>
    </StyledTextChat>
  )
}

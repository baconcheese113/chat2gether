import React from 'react'
import styled, { keyframes } from 'styled-components'

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
  position: absolute;
  overflow: hidden;
  background-color: transparent;
  bottom: 6rem;
  left: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  z-index: 5;
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
  z-index: -1;
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
  z-index: 5;
  animation-fill-mode: forwards;
  animation-name: ${consoleShow};
  animation-duration: 0.6s;
`

const ConsoleInput = styled.input`
  width: calc(100% - 35px);
  background-color: #c38fdd;
  border: 3px solid #c38fdd;
  border-radius: 10px 0 0 10px;
  padding: 2px;
  font-size: 1.4rem;
  font-family: inherit;
`
const ConsoleButton = styled.button`
  border-radius: 0 10px 10px 0;
  font-size: 1.7rem;
  text-align: left;
  margin-left: -2px;
  padding: 0.5rem 2rem 0.5rem 0.5rem;
`

/** ******************** Component start */
class TextChat extends React.Component {
  messagesEnd = React.createRef()

  state = {
    comment: '',
  }

  componentDidMount() {
    const {lastReadMsg, setLastReadMsg, textChat } = this.props
    if(lastReadMsg < textChat.length - 1)
      setLastReadMsg(textChat.length - 1)
  }

  componentDidUpdate() {
    this.scrollToBottom()
    const {lastReadMsg, setLastReadMsg, textChat } = this.props
    if(lastReadMsg < textChat.length - 1)
      setLastReadMsg(textChat.length - 1)
  }

  scrollToBottom = () => {
    this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }

  renderTextChat = () => {
    // return (
    //   <div>
    //     <p className="text-comment text-remote" key={1}>Lorem ipsum dolor</p>
    //     <p className="text-comment text-local" key={2}>Oin, foawiienn, falw fiejf wfoien fwoie eifowf ifweni.</p>
    //     <p className="text-comment text-local" key={3}>owief. ofienwfni, fiwn fiwnfoi.</p>
    //     <p className="text-comment text-remote" key={4}>Login ifo ifen aofien aofh fghei aofei</p>
    //     <p className="text-comment text-local" key={5}>Goins ifnwo non fnife fif i fiw.</p>
    //     <p className="text-comment text-remote" key={6}>Lorem ipsum dolor</p>
    //     <p className="text-comment text-local" key={7}>owief. ofienwfni, fiwn fiwnfoi.</p>
    //     <p className="text-comment text-local" key={8}>Lorem ipsum dolor</p>
    //     <p className="text-comment text-remote" key={9}>Oin, foawiienn, falw fiejf wfoien fwoie eifowf ifweni.</p>
    //     <p className="text-comment text-local" key={10}>Login ifo ifen aofien aofh fghei aofei</p>
    //   </div>
    // )
    // console.log(this.props.textChat);
    const { user, textChat } = this.props
    return textChat.map((comment, index) => {
      console.log(comment, index)
      return (
        <TextComment key={index} className={`text-${comment.userId === user.id ? 'local' : 'remote'}`}>
          {comment.comment}
        </TextComment>
      )
    })
  }

  handleSubmit = e => {
    const { socketHelper, user, room } = this.props
    const { comment } = this.state
    e.preventDefault()
    // this.props.onSubmit(e, this.state.comment);
    if (!socketHelper || !comment) {
      console.log(`No sockethelper! ${socketHelper} ${comment}`)
      return
    }
    socketHelper.emit('send', {
      userId: user.id,
      text: comment,
      roomId: room,
    })

    this.setState({ comment: '' })
  }

  render() {
    const { comment } = this.state
    return (
      <StyledTextChat>
        <TextHistory>
          {this.renderTextChat()}
          <div ref={this.messagesEnd} />
        </TextHistory>
        <TextConsole onSubmit={this.handleSubmit}>
          <ConsoleInput
            type="text"
            value={comment}
            onChange={e => {
              this.setState({ comment: e.target.value })
            }}
          />
          <ConsoleButton type="submit">Send</ConsoleButton>
        </TextConsole>
      </StyledTextChat>
    )
  }
}

export default TextChat

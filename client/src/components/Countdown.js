import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useNotify } from '../hooks/NotifyContext'
import { Button } from './common'

/*
  Button absolutely positioned on screen "Countdown"
  User 1 presses button, emits "requestedCountdown" and button style changes to "Cancel Countdown"
  User 2 sees "Accept Countdown", and presses.
  Emits "acceptedCountdown" and both user's start counting down.
    -- if either user cancels, emits "cancelledCountdown" and immediately stops local timers and resets
    -- if User 2 doesn't press accept, it hangs. User 1 can tap to cancel
*/

const scan = keyframes`
  0% {bottom: 100%;}
  100% {bottom: 0;}
`
const absorb = keyframes`
  40%{box-shadow: 0 -5px 4px transparent;  text-shadow: 0 0 8px transparent;}
  50%{box-shadow: 0 -5px 4px #9932cc;  text-shadow: 0 0 4px #9932cc;}
  100%{box-shadow: 0 -5px 4px transparent;}
`
const bounce = keyframes`
  0% {transform: scale(0); opacity: .5;}
  10%{transform: scale(1.05); opacity: 1; text-shadow: 0 0 4px #fff;}
  88%{transform: scale(.9); opacity: 1;}
  90%{transform: scale(1.05); text-shadow: 0 0 4px transparent;}
  100%{transform: scale(0); opacity: .5;}
`

const StyledCountdown = styled.div`
  display: ${props => (props.active ? 'flex' : 'none')};
  color: #aaa;
  background-color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  position: absolute;
  bottom: 20%;
  left: 1rem;
  border-radius: 2rem 2rem 0 0;
  flex-direction: column;
  /* max-width: 20%; */
`
const TextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  width: 15rem;
  height: 5rem;
  text-align: center;
  background-color: #1e1e23;
`
const CountdownText = styled.h3`
  font-size: ${props => props.fontSize};
  text-shadow: 0 0 4px transparent;
  &.animated {
    animation: ${bounce} ${props => `${props.spacing}s`} infinite;
  }
`
const ButtonsContainer = styled.div`
  display: flex;
  z-index: 2;
  flex: 1;
  border: 0;
  border-top: 1px solid ${props => props.theme.colorPrimary};
  &.animated {
    animation: ${absorb} ${props => `${props.spacing}s`} infinite;
  }
`
const ActionButton = styled(Button)`
  color: inherit;
  flex: 1;
  font-size: 1.4rem;
  border-radius: 0;
  padding: 4px;
  transition: all 0.4s;
  animation: ${absorb} ${props => `${props.animated && props.spacing}s infinite`};

  &:hover {
    color: ${props => props.theme.colorPrimary};
    text-shadow: 0 0 4px transparent;
  }
`
const ScanLine = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: 5px;
  background-color: #9932cc;
  animation: ${scan} ${props => `${props.animated && props.spacing}s`} infinite;
  /* &.animated {
    animation: ${scan} ${props => `${props.spacing}s`} infinite;
  } */
`

export default function Countdown(props) {
  const { userId, socketHelper, roomId } = props
  const [isRequester, setIsRequester] = React.useState(false)
  const [status, setStatus] = React.useState('none')
  const [countdownText, setCountdownText] = React.useState('Countdown')

  const timer = React.useRef()

  const { setCountdownNotify } = useNotify()
  const { enabledWidgets } = useEnabledWidgets()
  const active = enabledWidgets.countdown

  const spacing = 1.6 // parsedText ? (4 / countdownText) * 0.2 + 1 : 1

  const resetTimer = () => {
    setStatus('none')
    setIsRequester(false)
    setCountdownText('Countdown')
    if (timer.current) clearTimeout(timer.current)
  }

  const tickTimer = oldTime => {
    const time = oldTime - 1
    timer.current = undefined
    if (time < 1) {
      console.log(`${time} is the time but cleared`)
      setCountdownText('Go!')
      timer.current = setTimeout(() => resetTimer(), 3000)
    } else {
      console.log(`${time} is the time`)
      setCountdownText(time)
      timer.current = setTimeout(() => {
        tickTimer(time)
      }, spacing * 1000) // (4 / time) * 200 + 1000)
    }
  }
  const startCountdown = () => {
    // Taking advantage of closure
    const time = 10
    console.log('timer started')
    // Start countdown in 1 second
    timer.current = setTimeout(() => {
      tickTimer(time)
    }, 1000)
  }

  // Cancel on button instead of title (Cancel, Request)
  // Timing has only one slight delay for "Started Countdown" message
  // clearTimeout Timer.currentis not a function
  // Show "Cancelled Countdown" for both users

  React.useEffect(() => {
    if (active) setCountdownNotify(false)
  })

  React.useEffect(() => {
    if (!socketHelper) return

    socketHelper.socket.on('requestedCountdown', senderUserId => {
      console.log('requested countdown', senderUserId)
      if (!active) {
        setCountdownNotify(true)
      }
      if (userId !== senderUserId) {
        setStatus('requested')
        setCountdownText('Ready to Countdown?')
      }
    })
    socketHelper.socket.on('startedCountdown', senderUserId => {
      console.log('started countdown', senderUserId)
      if (!active) {
        setCountdownNotify(true)
      }
      if (userId !== senderUserId) {
        setStatus('started')
        setCountdownText('10')
        startCountdown()
      }
    })
    socketHelper.socket.on('cancelledCountdown', senderUserId => {
      console.log('cancelled countdown', senderUserId)
      setCountdownNotify(false)
      if (timer && timer.current) {
        clearTimeout(timer.current)
      }
      setStatus('cancelled')
      setCountdownText('Countdown Cancelled')
      timer.current = setTimeout(() => resetTimer(), 3000)
    })
    return () => {
      if (timer && timer.current) clearTimeout(timer.current)
      socketHelper.socket.off('requestedCountdown')
      socketHelper.socket.off('startedCountdown')
      socketHelper.socket.off('cancelledCountdown')
    }
  }, [socketHelper])

  const msg = {
    roomId,
    userId,
  }

  const handleRequest = () => {
    msg.type = 'requestedCountdown'
    socketHelper.emit('countdown', msg)
    setStatus('requested')
    setCountdownText('Requesting Countdown')
    setIsRequester(true)
  }
  const handleStart = () => {
    msg.type = 'startedCountdown'
    socketHelper.emit('countdown', msg)
    setStatus('started')
    setCountdownText('10')
    startCountdown()
  }
  const handleCancel = () => {
    msg.type = 'cancelledCountdown'
    if (timer && timer.current) {
      clearTimeout(timer.current)
    }
    socketHelper.emit('countdown', msg)
    setStatus('cancelled')
    setCountdownText('Countdown Cancelled')
    timer.current = setTimeout(() => resetTimer(), 3000)
  }

  return (
    <StyledCountdown active={active}>
      <TextContainer>
        <CountdownText
          data-cy="countdownText"
          fontSize={status === 'started' ? '4.5rem' : '1.4rem'}
          className={status === 'started' && 'animated'}
          spacing={spacing}
        >
          {countdownText}
        </CountdownText>
      </TextContainer>
      <ScanLine animated={status === 'started'} spacing={spacing} />
      <ButtonsContainer>
        {status === 'none' && <ActionButton onClick={handleRequest} label="Request" />}
        {status === 'requested' && !isRequester && (
          <ActionButton data-cy="countdownStartButton" onClick={handleStart} label="Start" />
        )}
        {(status === 'started' || status === 'requested') && (
          <ActionButton
            data-cy="countdownCancelButton"
            animated={status === 'started'}
            spacing={spacing}
            onClick={handleCancel}
            label="Cancel"
          />
        )}
      </ButtonsContainer>
    </StyledCountdown>
  )
}

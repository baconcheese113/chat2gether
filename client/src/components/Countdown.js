import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

/*
  Button absolutely positioned on screen "Countdown"
  User 1 presses button, emits "requestedCountdown" and button style changes to "Cancel Countdown"
  User 2 sees "Accept Countdown", and presses.
  Emits "acceptedCountdown" and both user's start counting down.
    -- if either user cancels, emits "cancelledCountdown" and immediately stops local timers and resets
    -- if User 2 doesn't press accept, it hangs. User 1 can tap to cancel
*/

const StyledCountdown = styled.div`
  overflow: hidden;
  position: absolute;
  bottom: 20%;
  left: 1rem;
  border-radius: 500rem;
  padding: 0.5rem 0 0 0;
  background-color: ${props => props.theme.colorPrimary};
  display: flex;
  flex-direction: column;
  max-width: 20%;
`
const CountdownText = styled.h3`
  font-size: ${props => props.fontSize};
`
const ActionButton = styled.button`
  flex-grow: 1;
  font-size: 1.6rem;
`

const Countdown = props => {
  const { myUserId, socketHelper, roomId } = props
  const [inCountdown, setInCountdown] = useState(false)
  const [isRequester, setIsRequester] = useState(false)
  // const [socketHelper, setSocketHelper] = useState()
  const [status, setStatus] = useState('none')
  const [countdownText, setCountdownText] = useState('Countdown')
  const timer = useRef()

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
      }, (4 / time) * 200 + 1000)
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

  useEffect(() => {
    if (!socketHelper) return

    socketHelper.socket.on('requestedCountdown', userId => {
      console.log('requested countdown', userId)
      if (myUserId !== userId) {
        setStatus('requested')
        setCountdownText('Ready to Countdown?')
      }
    })
    socketHelper.socket.on('startedCountdown', userId => {
      console.log('started countdown', userId)
      if (myUserId !== userId) {
        setStatus('started')
        setCountdownText('Countdown Started!')
        startCountdown()
      }
    })
    socketHelper.socket.on('cancelledCountdown', userId => {
      console.log('cancelled countdown', userId)
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
    userId: myUserId,
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
    setCountdownText('Countdown Started!')
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
    <StyledCountdown>
      <CountdownText fontSize={inCountdown ? '3rem' : '1.4rem'}>{countdownText}</CountdownText>
      {status === 'none' && <ActionButton onClick={handleRequest}>Request</ActionButton>}
      {status === 'requested' && !isRequester && <ActionButton onClick={handleStart}>Start</ActionButton>}
      {(status === 'started' || (status === 'requested' && isRequester)) && (
        <ActionButton onClick={handleCancel}>Cancel</ActionButton>
      )}
    </StyledCountdown>
  )
}

export default Countdown

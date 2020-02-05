import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import VideoWindow from './VideoWindow'
import TextChat from './TextChat'
import Settings from './Settings'
import InCallNavBar from './InCallNavBar'
import VideoPlayer from './VideoPlayer'
import UserUpdateForm from './UserUpdateForm'
import Countdown from './Countdown'
import ProfileCard from './ProfileCard'
import MatchHistory from './MatchHistory'
// import Stats from './Stats'
import LineGraph from './stats/LineGraph'
// import AirPlaneDing from '../assets/air-plane-ding.mp3'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useSocket } from '../hooks/SocketContext'
import { useMyUser } from '../hooks/MyUserContext'
// import StatsWindow from './stats/StatsWindow'

const StyledChatHub = styled.div`
  height: 100vh; /* shitty, but temp fix for firefox */
  /* height: -webkit-fill-available; */
  display: flex;
  flex-direction: ${props => props.flowDirection};
  justify-content: center;
  overflow: hidden;
`
const NextMatchButton = styled.button`
  color: ${props => (props.disabled ? '#aaa' : '#fff')};
`
const NextMatchSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  transform: scale(1.01, 1.1);
`
const NextMatchRect = styled.rect`
  stroke-width: 4px;
  stroke-opacity: 1;
  stroke-dashoffset: ${props => (props.disabled ? 0 : 349)}px;
  stroke-dasharray: 349px;
  stroke: ${props => props.theme.colorPrimary};
  transition: all ${props => (props.disabled ? 1.8 : 0.2)}s;
`
const ConnectingText = styled.p`
  padding: 0 1rem;
`

// When user presses Share Video, request camera
// When user presses Next Match, Initialize socket and Find Room
// When connection is established, alert user to countdown
// Start Call
// On connection end or Find Next -> Find Room()

export default function ChatHub() {
  const [flowDirection, setFlowDirection] = useState(window.innerWidth > window.innerHeight ? 'row' : 'column')

  const { user, updateUser } = useMyUser()
  const { localStream, requestCamera } = useLocalStream()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const {
    socketHelper,
    connectionMsg,
    remoteStream,
    nextMatch,
    canNextMatch,
    roomId,
    resetSocket,
    otherUser,
    matchCountdown,
  } = useSocket()

  const handleNextMatch = e => {
    e.stopPropagation()
    if (localStream && canNextMatch) nextMatch(localStream)
  }

  const getChatNav = () => {
    return (
      <div className="chat-nav">
        <NextMatchButton className="next-match" type="button" onClick={handleNextMatch} disabled={!canNextMatch}>
          Next Match
          <NextMatchSVG width="100%" height="100%" fill="transparent">
            <NextMatchRect disabled={!canNextMatch} height="100%" width="100%" rx="15px" />
          </NextMatchSVG>
        </NextMatchButton>
        <button
          type="button"
          className="settings-button"
          onClick={() => setEnabledWidgets({ ...enabledWidgets, menu: true })}
        >
          <i className="fas fa-ellipsis-v" />
        </button>
      </div>
    )
  }

  const updateFlowDirection = React.useCallback(() => {
    const direction = window.innerWidth > window.innerHeight ? 'row' : 'column'
    setFlowDirection(direction)
  }, [window.innerHeight, window.innerHeight])

  const logWindowError = e => console.log(e)
  useEffect(() => {
    window.addEventListener('resize', updateFlowDirection)
    window.addEventListener('error', logWindowError)
    return () => {
      window.removeEventListener('resize', updateFlowDirection)
      window.removeEventListener('error', logWindowError)
    }
  }, [])

  const onUnload = React.useCallback(
    e => {
      if (!otherUser) return null
      e.returnValue = 'Are you sure you want to end your call?'
      return 'Are you sure you want to end your call?'
    },
    [otherUser],
  )

  useEffect(() => {
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [onUnload])

  const renderBackground = () => {
    if (remoteStream) {
      return (
        <React.Fragment>
          <VideoPlayer socketHelper={socketHelper} userId={user.id} roomId={roomId} />
          <VideoWindow videoType="remoteVideo" stream={remoteStream} />
          <VideoWindow videoType="localVideo" stream={localStream} />
          {getChatNav()}
          <TextChat user={user} socketHelper={socketHelper} room={roomId} />
          <ProfileCard user={otherUser} />
          <Countdown socketHelper={socketHelper} myUserId={user.id} roomId={roomId} />
          <InCallNavBar
            resetState={resetSocket}
            buttons={{ stop: true, mic: true, speaker: true, profile: true, countdown: true, chat: true, video: true }}
          />
        </React.Fragment>
      )
    }
    if (!localStream) {
      return (
        <div className="video-connecting">
          <button type="button" onClick={() => requestCamera()}>
            Share Video to Begin
          </button>
        </div>
      )
    }
    return (
      <React.Fragment>
        <div className="video-connecting">
          {getChatNav()}
          <ConnectingText>{connectionMsg}</ConnectingText>
          <VideoWindow videoType="localVideo" stream={localStream} />
          {matchCountdown > 0 && <div className="countdown">{matchCountdown}</div>}
          {enabledWidgets.updatePref && (
            <UserUpdateForm
              user={user}
              setUser={newUser => {
                updateUser(newUser)
                if (roomId) nextMatch()
              }}
            />
          )}
          {enabledWidgets.stats && <LineGraph />}
          {enabledWidgets.matches && <MatchHistory users={user.visited} />}
          <InCallNavBar
            resetState={resetSocket}
            buttons={{ stop: true, mic: true, speaker: true, matches: true, stats: true, updatePref: true }}
          />
        </div>
      </React.Fragment>
    )
  }

  return (
    <StyledChatHub flowDirection={flowDirection}>
      {renderBackground()}
      {enabledWidgets.menu && <Settings />}
    </StyledChatHub>
  )
}

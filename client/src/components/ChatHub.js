import React from 'react'
import styled from 'styled-components'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useSocket } from '../hooks/SocketContext'
import { useMyUser } from '../hooks/MyUserContext'
import useWindowSize from '../hooks/WindowSizeHook'
import { VideoPlayerProvider } from '../hooks/VideoPlayerContext'
import VideoWindow from './VideoWindow'
import TextChat from './TextChat'
import Settings from './Settings'
import InCallNavBar from './InCallNavBar'
import VideoPlayer from './VideoPlayer'
import UserUpdateForm from './UserUpdateForm'
import Countdown from './Countdown'
import ProfileCard from './ProfileCard'
import MatchHistory from './MatchHistory'
import LineGraph from './stats/LineGraph'
import ChatNav from './ChatNav'
import { Button } from './common'

const StyledChatHub = styled.div`
  display: flex;
  flex: 1;
  flex-direction: ${p => p.flowDirection};
  justify-content: center;
  overflow: hidden;
`
const ConnectingText = styled.div`
  padding: 0 1rem;
  white-space: pre-wrap;
  height: ${p => p.height};
  display: flex;
  align-items: center;
`
const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  font-size: 2rem;
  height: 100%;
`
const CountdownSpan = styled.span`
  width: 100%;
`
// When user presses Share Video, request camera
// When user presses Next Match, Initialize socket and Find Room
// When connection is established, alert user to countdown
// Start Call
// On connection end or Find Next -> Find Room()

export default function ChatHub() {
  const { user } = useMyUser()
  const { localStream, requestCamera } = useLocalStream()
  const { enabledWidgets } = useEnabledWidgets()
  const { socketHelper, connectionMsg, remoteStream, roomId, otherUser, matchCountdown, endCall } = useSocket()
  const { flowDirection } = useWindowSize()

  const logWindowError = e => console.error(e)
  React.useEffect(() => {
    window.addEventListener('error', logWindowError)
    return () => {
      window.removeEventListener('error', logWindowError)
    }
  }, [])

  const onBeforeUnload = React.useCallback(
    e => {
      if (!otherUser) return null
      e.returnValue = 'Are you sure you want to end your call?'
      return 'Are you sure you want to end your call?'
    },
    [otherUser],
  )

  const onUnload = React.useCallback(() => {
    console.log('unloading with ', endCall)
    endCall('REFRESH')
  }, [endCall])

  React.useEffect(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('unload', onUnload)
    window.addEventListener('pagehide', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('unload', onUnload)
      window.removeEventListener('pagehide', onUnload)
    }
  }, [onBeforeUnload, onUnload])

  const renderBackground = () => {
    if (remoteStream) {
      return (
        <>
          <VideoPlayer roomId={roomId} socketHelper={socketHelper} userId={user.id} />
          <VideoWindow flowDirection={flowDirection} stream={remoteStream} videoType="remoteVideo" />
          <ProfileCard user={otherUser} />
          <TextChat room={roomId} socketHelper={socketHelper} user={user} />
          <Countdown myUserId={user.id} roomId={roomId} socketHelper={socketHelper} />
          <ChatNav />
          <InCallNavBar
            buttons={{ stop: true, mic: true, speaker: true, profile: true, countdown: true, chat: true, video: true }}
          />
          <VideoWindow flowDirection={flowDirection} stream={localStream} videoType="localVideo" />
        </>
      )
    }
    if (!localStream) {
      return (
        <PageContainer>
          <Button data-cy="shareVideoButton" label="Share Video to Begin" onClick={() => requestCamera()} />
        </PageContainer>
      )
    }
    return (
      <PageContainer>
        <VideoPlayer roomId={roomId} userId={user.id} />
        <ConnectingText height={enabledWidgets.video ? '100%' : undefined}>{connectionMsg}</ConnectingText>
        {matchCountdown > 0 && <CountdownSpan>{matchCountdown}</CountdownSpan>}
        {enabledWidgets.updatePref && <UserUpdateForm />}
        {enabledWidgets.stats && <LineGraph />}
        {enabledWidgets.matches && <MatchHistory />}
        <ChatNav />
        <VideoWindow flowDirection={flowDirection} stream={localStream} videoType="localVideo" />
        <InCallNavBar
          buttons={{ stop: true, mic: true, speaker: true, matches: true, stats: true, updatePref: true, video: true }}
        />
      </PageContainer>
    )
  }

  return (
    <StyledChatHub flowDirection={flowDirection}>
      <VideoPlayerProvider>
        {renderBackground()}
        {enabledWidgets.menu && <Settings />}
      </VideoPlayerProvider>
    </StyledChatHub>
  )
}

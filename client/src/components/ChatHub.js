import React from 'react'
import styled from 'styled-components'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useSocket } from '../hooks/SocketContext'
import { useMyUser } from '../hooks/MyUserContext'
import useWindowSize from '../hooks/WindowSizeHook'
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
`
const PageContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  font-size: 2rem;
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
  const { socketHelper, connectionMsg, remoteStream, roomId, otherUser, matchCountdown } = useSocket()
  const { flowDirection } = useWindowSize()

  const logWindowError = e => console.log(e)
  React.useEffect(() => {
    window.addEventListener('error', logWindowError)
    return () => {
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

  React.useEffect(() => {
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [onUnload])

  const renderBackground = () => {
    if (remoteStream) {
      return (
        <>
          <VideoPlayer socketHelper={socketHelper} userId={user.id} roomId={roomId} />
          <VideoWindow videoType="remoteVideo" stream={remoteStream} flowDirection={flowDirection} />
          <ProfileCard user={otherUser} />
          <TextChat user={user} socketHelper={socketHelper} room={roomId} />
          <Countdown socketHelper={socketHelper} myUserId={user.id} roomId={roomId} />
          <ChatNav />
          <InCallNavBar
            buttons={{ stop: true, mic: true, speaker: true, profile: true, countdown: true, chat: true, video: true }}
          />
          <VideoWindow videoType="localVideo" stream={localStream} flowDirection={flowDirection} />
        </>
      )
    }
    if (!localStream) {
      return (
        <PageContainer>
          <Button data-cy="shareVideoButton" onClick={() => requestCamera()} label="Share Video to Begin" />
        </PageContainer>
      )
    }
    return (
      <PageContainer>
        <ConnectingText>{connectionMsg}</ConnectingText>
        {matchCountdown > 0 && <CountdownSpan>{matchCountdown}</CountdownSpan>}
        {enabledWidgets.updatePref && <UserUpdateForm />}
        {enabledWidgets.stats && <LineGraph />}
        {enabledWidgets.matches && <MatchHistory />}
        <ChatNav />
        <VideoWindow videoType="localVideo" stream={localStream} flowDirection={flowDirection} />
        <InCallNavBar
          buttons={{ stop: true, mic: true, speaker: true, matches: true, stats: true, updatePref: true }}
        />
      </PageContainer>
    )
  }

  return (
    <StyledChatHub flowDirection={flowDirection}>
      {renderBackground()}
      {enabledWidgets.menu && <Settings />}
    </StyledChatHub>
  )
}

import React from 'react'
import styled from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useNotify } from '../hooks/NotifyContext'
import useWindowSize from '../hooks/WindowSizeHook'
import { useSocket } from '../hooks/SocketContext'
import ToggleButtonWithMeter from './ToggleButtonWithMeter'
import ToggleButton from './ToggleButton'

const StyledNavBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  font-size: 1.6rem;
  padding: 0.5rem;
  overflow: hidden;
`
const LeftAligned = styled.div`
  display: flex;
  flex: 1;
`
const RightAligned = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 0.5rem;
`

export default function InCallNavBar(props) {
  const { buttons } = props

  const [showLeft, setShowLeft] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  const { localStream, requestCamera } = useLocalStream()
  const { videoNotify, countdownNotify, textNotify } = useNotify()
  const { enabledWidgets, featureToggle, chatSettings, setChatSettings } = useEnabledWidgets()
  const { endCall, remoteStream } = useSocket()
  const { isPC, innerWidth } = useWindowSize()

  React.useEffect(() => {
    ;(async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        // Both of these being true means we're on mobile
        const rear = allDevices.some(d => d.kind === 'videoinput' && d.label.match(/back/i))
        const front = allDevices.some(d => d.kind === 'videoinput' && d.label.match(/front/i))
        setIsMobile(rear && front)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const flipCamera = async e => {
    e.stopPropagation()
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const rear = allDevices.find(d => d.kind === 'videoinput' && d.label.match(/back/i))
      const front = allDevices.find(d => d.kind === 'videoinput' && d.label.match(/front/i))
      const currentId = localStream.getVideoTracks()[0].getSettings().deviceId
      console.log(currentId, rear.deviceId, front.deviceId)
      if (rear && front) {
        const newDeviceId = currentId === rear.deviceId ? front.deviceId : rear.deviceId
        requestCamera(newDeviceId)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // type should be speakerMute or micMute
  const handleMutePress = () => {
    if (localStream) {
      const audio = localStream.getAudioTracks()
      if (audio.length > 0) {
        // enabled is the inverse of mute, but we're inverting that onClick
        audio[0].enabled = chatSettings.micMute
      }
    }
    setChatSettings({ ...chatSettings, micMute: !chatSettings.micMute })
  }

  const hiddenNotifications = (countdownNotify | 0) + (videoNotify | 0) + (textNotify || 0)

  if (!enabledWidgets) return ''

  return (
    <StyledNavBar>
      <LeftAligned>
        {showLeft || isPC ? (
          <>
            {buttons.stop && (
              <ToggleButton
                data-cy="navStopButton"
                iconClass="fas fa-stop"
                innerWidth={innerWidth}
                title="Stop"
                onClick={() => endCall('STOP')}
              />
            )}
            {buttons.mic && (
              <ToggleButtonWithMeter
                active={chatSettings.micMute ? 0 : 1}
                data-cy="navMicButton"
                iconClass={`fas fa-microphone${chatSettings.micMute ? '-slash' : ''}`}
                innerWidth={innerWidth}
                stream={localStream}
                onClick={handleMutePress}
              />
            )}
            {buttons.speaker && (
              <ToggleButtonWithMeter
                active={chatSettings.speakerMute ? 0 : 1}
                data-cy="navSpeakerButton"
                iconClass={`fas fa-volume${chatSettings.speakerMute ? '-mute' : '-up'}`}
                innerWidth={innerWidth}
                stream={remoteStream}
                onClick={() => setChatSettings({ ...chatSettings, speakerMute: !chatSettings.speakerMute })}
              />
            )}
            {isMobile && <ToggleButton data-cy="navCameraFlipButton" iconClass="fas fa-camera" onClick={flipCamera} />}
          </>
        ) : (
          <ToggleButton
            active
            importantTitle
            iconClass="fas fa-chevron-right"
            innerWidth={innerWidth}
            title="Controls"
            onClick={() => setShowLeft(true)}
          />
        )}
      </LeftAligned>
      <RightAligned>
        {!showLeft || isPC ? (
          <>
            {buttons.profile && (
              <ToggleButton
                active={enabledWidgets.profile ? 1 : 0}
                data-cy="navProfileButton"
                iconClass="fas fa-user-alt"
                innerWidth={innerWidth}
                title="Profile"
                onClick={() => featureToggle('profile', !remoteStream)}
              />
            )}
            {buttons.countdown && (
              <ToggleButton
                active={enabledWidgets.countdown ? 1 : 0}
                data-cy="navCountdownButton"
                iconClass="fas fa-stopwatch"
                innerWidth={innerWidth}
                notification={countdownNotify ? 1 : 0}
                title="Countdown"
                onClick={() => featureToggle('countdown', !remoteStream)}
              />
            )}
            {buttons.chat && (
              <ToggleButton
                active={enabledWidgets.text ? 1 : 0}
                data-cy="navCommentButton"
                iconClass="fas fa-comment"
                innerWidth={innerWidth}
                notification={textNotify}
                title="Chat"
                onClick={() => featureToggle('text', !remoteStream)}
              />
            )}
            {buttons.updatePref && (
              <ToggleButton
                active={enabledWidgets.updatePref ? 1 : 0}
                data-cy="navUpdateUserButton"
                iconClass="fas fa-user-edit"
                innerWidth={innerWidth}
                title="Edit"
                onClick={() => featureToggle('updatePref', !remoteStream)}
              />
            )}
            {buttons.stats && (
              <ToggleButton
                active={enabledWidgets.stats ? 1 : 0}
                data-cy="navStatsButton"
                iconClass="fas fa-chart-area"
                innerWidth={innerWidth}
                title="Stats"
                onClick={() => featureToggle('stats', !remoteStream)}
              />
            )}
            {buttons.matches && (
              <ToggleButton
                active={enabledWidgets.matches ? 1 : 0}
                data-cy="navMatchesButton"
                iconClass="fas fa-users"
                innerWidth={innerWidth}
                title="Matches"
                onClick={() => featureToggle('matches', !remoteStream)}
              />
            )}
            {buttons.video && (
              <ToggleButton
                active={enabledWidgets.video ? 1 : 0}
                data-cy="navPlayerButton"
                iconClass="fab fa-youtube"
                innerWidth={innerWidth}
                notification={videoNotify ? 1 : 0}
                title="Video"
                onClick={() => featureToggle('video', !remoteStream)}
              />
            )}
          </>
        ) : (
          <ToggleButton
            active
            importantTitle
            iconClass="fas fa-chevron-left"
            innerWidth={innerWidth}
            notification={hiddenNotifications}
            title="Widgets"
            onClick={() => setShowLeft(false)}
          />
        )}
      </RightAligned>
    </StyledNavBar>
  )
}

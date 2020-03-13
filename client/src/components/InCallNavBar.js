import React from 'react'
import styled from 'styled-components'
import ToggleButton from './ToggleButton'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useNotify } from '../hooks/NotifyContext'

const StyledNavBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  font-size: 1.6rem;
  padding: 0.5rem;
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
  const { resetState, buttons } = props

  const [isMobile, setIsMobile] = React.useState(false)

  const { localStream, requestCamera } = useLocalStream()
  const { videoNotify, countdownNotify, textNotify } = useNotify()
  const { enabledWidgets, featureToggle, chatSettings, setChatSettings } = useEnabledWidgets()

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
  }, [navigator.mediaDevices])

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

  if (!enabledWidgets) return ''

  return (
    <StyledNavBar>
      <LeftAligned>
        {buttons.stop && <ToggleButton iconClass="fas fa-stop" dataCy="navStopButton" onClick={resetState} />}
        {buttons.mic && (
          <ToggleButton
            dataCy="navMicButton"
            iconClass={`fas fa-microphone${chatSettings.micMute ? '-slash' : ''}`}
            onClick={() => {
              if (localStream) {
                const audio = localStream.getAudioTracks()
                if (audio.length > 0) {
                  // enabled is the inverse of mute, but we're inverting that onClick
                  audio[0].enabled = chatSettings.micMute
                  console.log(`nav bar mic.enabled is now ${audio[0].enabled}`)
                }
              }
              setChatSettings({ ...chatSettings, micMute: !chatSettings.micMute })
            }}
            active={chatSettings.micMute ? 0 : 1}
          />
        )}
        {buttons.speaker && (
          <ToggleButton
            dataCy="navSpeakerButton"
            iconClass={`fas fa-volume${chatSettings.speakerMute ? '-mute' : '-up'}`}
            onClick={() => setChatSettings({ ...chatSettings, speakerMute: !chatSettings.speakerMute })}
            active={chatSettings.speakerMute ? 0 : 1}
          />
        )}
        {isMobile && <ToggleButton dataCy="navCameraFlipButton" iconClass="fas fa-camera" onClick={flipCamera} />}
      </LeftAligned>
      <RightAligned>
        {buttons.profile && (
          <ToggleButton
            dataCy="navProfileButton"
            iconClass="fas fa-user-alt"
            onClick={() => featureToggle('profile')}
            active={enabledWidgets.profile ? 1 : 0}
          />
        )}
        {buttons.countdown && (
          <ToggleButton
            dataCy="navCountdownButton"
            iconClass="fas fa-stopwatch"
            onClick={() => featureToggle('countdown')}
            active={enabledWidgets.countdown ? 1 : 0}
            notification={countdownNotify ? 1 : 0}
          />
        )}
        {buttons.chat && (
          <ToggleButton
            dataCy="navCommentButton"
            iconClass="fas fa-comment"
            onClick={() => featureToggle('text')}
            active={enabledWidgets.text ? 1 : 0}
            notification={textNotify}
          />
        )}
        {buttons.video && (
          <ToggleButton
            dataCy="navPlayerButton"
            iconClass="fab fa-youtube"
            onClick={() => featureToggle('video')}
            active={enabledWidgets.video ? 1 : 0}
            notification={videoNotify ? 1 : 0}
          />
        )}
        {buttons.updatePref && (
          <ToggleButton
            dataCy="navUpdateUserButton"
            iconClass="fas fa-user-edit"
            onClick={() => featureToggle('updatePref')}
            active={enabledWidgets.updatePref ? 1 : 0}
          />
        )}
        {buttons.stats && (
          <ToggleButton
            dataCy="navStatsButton"
            iconClass="fas fa-chart-area"
            onClick={() => featureToggle('stats')}
            active={enabledWidgets.stats ? 1 : 0}
          />
        )}
        {buttons.matches && (
          <ToggleButton
            dataCy="navMatchesButton"
            iconClass="fas fa-users"
            onClick={() => featureToggle('matches')}
            active={enabledWidgets.matches ? 1 : 0}
          />
        )}
      </RightAligned>
    </StyledNavBar>
  )
}

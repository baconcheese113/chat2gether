import React from 'react'
import styled from 'styled-components'
import ToggleButton from './ToggleButton'

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

const InCallNavBar = props => {
  const {
    widgetsActive,
    setWidgetsActive,
    resetState,
    textNotify,
    countdownNotify,
    videoNotify,
    chatSettings,
    setChatSettings,
    localStream,
    buttons,
    requestCamera,
  } = props

  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        // Both of these being true means we're on mobile
        const rear = allDevices.some(d => d.kind === 'videoinput' && d.label.includes('back'))
        const front = allDevices.some(d => d.kind === 'videoinput' && d.label.includes('front'))
        setIsMobile(rear && front)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [navigator.mediaDevices])

  const featureToggle = elem => {
    setWidgetsActive({ [elem]: !widgetsActive[elem] })
  }

  const flipCamera = async e => {
    e.stopPropagation()
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const rear = allDevices.find(d => d.kind === 'videoinput' && d.label.includes('back'))
      const front = allDevices.find(d => d.kind === 'videoinput' && d.label.includes('front'))
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

  if (!widgetsActive) return ''

  return (
    <StyledNavBar>
      <LeftAligned>
        {buttons.stop && <ToggleButton iconClass="fas fa-stop" onClick={resetState} />}
        {buttons.mic && (
          <ToggleButton
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
            iconClass={`fas fa-volume${chatSettings.speakerMute ? '-mute' : '-up'}`}
            onClick={() => setChatSettings({ ...chatSettings, speakerMute: !chatSettings.speakerMute })}
            active={chatSettings.speakerMute ? 0 : 1}
          />
        )}
        {isMobile && <ToggleButton iconClass="fas fa-camera" onClick={flipCamera} />}
      </LeftAligned>
      <RightAligned>
        {buttons.profile && (
          <ToggleButton
            iconClass="fas fa-user-alt"
            onClick={() => featureToggle('profile')}
            active={widgetsActive.profile ? 1 : 0}
          />
        )}
        {buttons.countdown && (
          <ToggleButton
            iconClass="fas fa-stopwatch"
            onClick={() => featureToggle('countdown')}
            active={widgetsActive.countdown ? 1 : 0}
            notification={countdownNotify ? 1 : 0}
          />
        )}
        {buttons.chat && (
          <ToggleButton
            iconClass="fas fa-comment"
            onClick={() => featureToggle('text')}
            active={widgetsActive.text ? 1 : 0}
            notification={textNotify}
          />
        )}
        {buttons.video && (
          <ToggleButton
            iconClass="fab fa-youtube"
            onClick={() => featureToggle('video')}
            active={widgetsActive.video ? 1 : 0}
            notification={videoNotify ? 1 : 0}
          />
        )}
        {buttons.updatePref && (
          <ToggleButton
            iconClass="fas fa-user-edit"
            onClick={() => featureToggle('updatePref')}
            active={widgetsActive.updatePref ? 1 : 0}
          />
        )}
        {buttons.stats && (
          <ToggleButton
            iconClass="fas fa-chart-area"
            onClick={() => featureToggle('stats')}
            active={widgetsActive.stats ? 1 : 0}
          />
        )}
        {buttons.matches && (
          <ToggleButton
            iconClass="fas fa-users"
            onClick={() => featureToggle('matches')}
            active={widgetsActive.matches ? 1 : 0}
          />
        )}
      </RightAligned>
    </StyledNavBar>
  )
}

export default InCallNavBar

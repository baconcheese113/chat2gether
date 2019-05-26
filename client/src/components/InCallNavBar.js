import React from 'react'
import styled from 'styled-components'
import ToggleButton from './ToggleButton'

const StyledNavBar = styled.div`
  /* background-color: ${props => props.theme.colorPrimaryLight}; */
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 1.6rem;
  padding: .5rem;
`

const InCallNavBar = props => {
  const {
    widgetsActive,
    setWidgetsActive,
    resetState,
    nextMatch,
    textNotify,
    chatSettings,
    setChatSettings,
    localStream,
  } = props
  if (!widgetsActive) return ''

  const featureToggle = elem => {
    setWidgetsActive({ ...widgetsActive, [elem]: !widgetsActive[elem] })
  }

  return (
    <StyledNavBar>
      <ToggleButton iconClass="fas fa-stop" onClick={resetState} />
      <ToggleButton iconClass="fas fa-fast-forward" onClick={nextMatch} />

      <ToggleButton
        iconClass={`fas fa-microphone${chatSettings.micMute ? '-slash' : ''}`}
        onClick={() => {
          const audio = localStream.getAudioTracks()
          if (audio.length > 0) audio[0].enabled = chatSettings.micMute // enabled is the inverse of mute, but we're inverting that onClick
          setChatSettings({ ...chatSettings, micMute: !chatSettings.micMute })
        }}
        active={chatSettings.micMute ? 0 : 1}
      />
      <ToggleButton
        iconClass={`fas fa-volume${chatSettings.speakerMute ? '-mute' : '-up'}`}
        onClick={() => setChatSettings({ ...chatSettings, speakerMute: !chatSettings.speakerMute })}
        active={chatSettings.speakerMute ? 0 : 1}
      />
      <ToggleButton
        iconClass="fas fa-comment"
        onClick={() => featureToggle('text')}
        active={widgetsActive.text ? 1 : 0}
        notification={textNotify}
      />
      <ToggleButton
        iconClass="fab fa-youtube"
        onClick={() => featureToggle('video')}
        active={widgetsActive.video ? 1 : 0}
      />
      <ToggleButton
        iconClass="fas fa-bars"
        onClick={() => featureToggle('menu')}
        active={widgetsActive.menu ? 1 : 0}
        right
      />
    </StyledNavBar>
  )
}

export default InCallNavBar

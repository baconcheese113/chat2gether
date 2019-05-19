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
  const { widgetsActive, setWidgetsActive, resetState, nextMatch } = props
  if (!widgetsActive) return ''

  const featureToggle = elem => {
    setWidgetsActive({ ...widgetsActive, [elem]: !widgetsActive[elem] })
  }

  return (
    <StyledNavBar>
      <ToggleButton iconClass="fas fa-stop" onClick={resetState} />
      <ToggleButton iconClass="fas fa-fast-forward" onClick={nextMatch} />
      <ToggleButton
        iconClass="fas fa-comment"
        onClick={() => featureToggle('text')}
        active={widgetsActive.text ? 1 : 0}
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

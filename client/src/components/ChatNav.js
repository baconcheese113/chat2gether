import React from 'react'
import styled from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useSocket } from '../hooks/SocketContext'
import Button from './common/Button'

const StyledChatNav = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
`
const NextMatchButton = styled(Button)`
  border-radius: 10px 0 0 10px;
  color: ${p => (p.disabled ? '#aaa' : '#fff')};
`
const NextMatchSVG = styled.svg`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(1.01, 1.1);
`
const NextMatchRect = styled.rect`
  stroke-width: 4px;
  stroke-opacity: 1;
  stroke-dashoffset: ${p => (p.disabled ? 0 : 349)}px;
  stroke-dasharray: 349px;
  stroke: ${p => p.theme.colorPrimary};
  transition: all ${p => (p.disabled ? 1.8 : 0.2)}s;
`
const SettingsButton = styled(Button)`
  border-radius: 0 10px 10px 0;
  border-left: 1px solid #444;
  padding-left: 15px;
`

export default function ChatNav() {
  const { localStream } = useLocalStream()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const { nextMatch, canNextMatch } = useSocket()

  const handleNextMatch = e => {
    e.stopPropagation()
    if (localStream && canNextMatch) nextMatch(localStream)
  }

  return (
    <StyledChatNav>
      <NextMatchButton data-cy="nextMatchButton" onClick={handleNextMatch} disabled={!canNextMatch}>
        Next Match
        <NextMatchSVG width="100%" height="100%" fill="transparent">
          <NextMatchRect disabled={!canNextMatch} height="100%" width="100%" rx="15px" />
        </NextMatchSVG>
      </NextMatchButton>
      <SettingsButton onClick={() => setEnabledWidgets({ ...enabledWidgets, menu: true })}>
        <i className="fas fa-ellipsis-v" />
      </SettingsButton>
    </StyledChatNav>
  )
}

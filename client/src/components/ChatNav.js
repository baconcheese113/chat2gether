import React from 'react'
import styled from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { useSocket } from '../hooks/SocketContext'
import useWindowSize from '../hooks/WindowSizeHook'
import Button from './common/Button'
import ReportUserDialog from './ReportUserDialog'

const StyledChatNav = styled.div`
  position: absolute;
  right: 0;
  top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  overflow: hidden;
  padding: 2px;
`
const Slide = styled.div`
  display: flex;
  left: ${p => (p.isExpanded ? 0 : p.slideWidth)}px;
  position: relative;
  transition: all 0.6s;
`
const Container = styled.div`
  position: relative;
  padding: 2px 0 2px 8px;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.6s;
`
const ExpansionButton = styled(Button)`
  border-radius: 50% 0 0 50%;
  background-color: rgba(0, 0, 0, 0.1);
`
const ExpansionIcon = styled.i`
  transform: scaleX(${p => (p.isExpanded ? 1 : -1)});
  transition: all 0.8s;
`
const Row = styled.div`
  position: relative;
  display: flex;
`
const NextMatchButton = styled(Button)`
  border-radius: 10px 0 0 10px;
  color: ${p => (p.disabled ? '#aaa' : '#fff')};
`

const ReportButton = styled(Button)`
  margin-top: 10px;
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
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { localStream } = useLocalStream()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const { nextMatch, canNextMatch, endCall, remoteStream, otherUser } = useSocket()
  const { isPC } = useWindowSize()

  const handleNextMatch = e => {
    e.stopPropagation()
    if (localStream && canNextMatch) nextMatch(localStream)
  }

  const slideWidth = isPC ? 151 : 118

  const getNextMatchButtonLabel = () => {
    if (remoteStream) return 'Next Match'
    if (!canNextMatch) return 'I gotchu...'
    return 'Find Match'
  }

  const handleDialogClose = async madeReport => {
    setDialogOpen(false)
    if (madeReport) {
      await endCall()
    }
  }

  return (
    <>
      <StyledChatNav isPC={isPC}>
        <Slide isExpanded={isExpanded} slideWidth={slideWidth}>
          <ExpansionButton onClick={() => setIsExpanded(!isExpanded)}>
            <ExpansionIcon isExpanded={isExpanded} className="fas fa-chevron-right" />
          </ExpansionButton>
          <Container isExpanded={isExpanded}>
            <Row>
              <NextMatchButton
                data-cy="nextMatchButton"
                onClick={handleNextMatch}
                disabled={!canNextMatch}
                label={getNextMatchButtonLabel()}
              >
                <NextMatchSVG width="100%" height="100%" fill="transparent">
                  <NextMatchRect disabled={!canNextMatch} height="100%" width="100%" rx="15px" />
                </NextMatchSVG>
              </NextMatchButton>
              {isPC && (
                <SettingsButton onClick={() => setEnabledWidgets({ ...enabledWidgets, menu: true })}>
                  <i className="fas fa-ellipsis-v" />
                </SettingsButton>
              )}
            </Row>
            <ReportButton label="Report" disabled={!remoteStream} onClick={() => setDialogOpen(true)} />
          </Container>
        </Slide>
      </StyledChatNav>

      {otherUser && <ReportUserDialog open={dialogOpen} offenderId={otherUser.id} onClose={handleDialogClose} />}
    </>
  )
}

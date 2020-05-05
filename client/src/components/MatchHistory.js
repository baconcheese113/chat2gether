import React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { useMyUser } from '../hooks/MyUserContext'
import useWindowSize from '../hooks/WindowSizeHook'
import { Button } from './common'
import ReportUserDialog from './ReportUserDialog'

const StyledMatchHistory = styled.section`
  margin: 10px;
  padding: 5px;
  width: 100%;
  max-width: 50rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: ${p => p.height / 2}px;
`
const ListContainer = styled.div`
  overflow-y: auto;
  width: 100%;
`
const MatchList = styled.div`
  display: grid;
  gap: 16px;
`
const MatchItem = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.6rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 2rem;
`
const MatchIconContainer = styled.div`
  position: relative;
`
const HumanIcon = styled.i`
  margin-left: 5px;
  font-size: 120px;
  color: ${p => (p.red ? '#c23636b5' : 'rgba(256, 256, 256, 0.4)')};
`
const GenderIcon = styled.i`
  position: absolute;
  bottom: 5%;
  left: 15%;
  font-size: 24px;
  color: rgba(256, 256, 256, 0.8);
`
const MatchDetails = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`
const MatchText = styled.p`
  font-size: 16px;
  color: #ffffffcc;
  margin-bottom: 16px;
`
const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`
const Pill = styled.div`
  color: ${p => p.theme.colorPrimaryLight};
  background-color: ${p => p.theme.colorGreyDark1};
  border-radius: 500rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 1rem;
  font-size: 20px;
  position: relative;
  margin-left: 8px;
`
const UserIdPill = styled(Pill)`
  position: absolute;
  bottom: 0;
  right: -15%;
`
const PillLabel = styled.span`
  position: absolute;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  top: -20%;
  right: 10%;
`
const RefreshButton = styled(Button)`
  margin-bottom: 8px;
  margin-right: 8px;
`
const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-right: 8px;
`
const ReportTypePill = styled(Pill)`
  position: absolute;
  font-size: 10px;
  bottom: 35%;
  left: 0;
  max-width: 100px;
  transform: rotateZ(-18deg);
`
const EmptyText = styled.p`
  color: #fff;
`

export default function MatchHistory() {
  const { user, getMe } = useMyUser()
  const { innerHeight } = useWindowSize()

  const [offenderId, setOffenderId] = React.useState()
  const [canRefresh, setCanRefresh] = React.useState(true)

  const getHumanIcon = gender => {
    if (gender === 'MALE') return 'fas fa-user-secret'
    if (gender === 'FEMALE') return 'fas fa-user-nurse'
    if (gender === 'M2F') return 'fas fa-user-ninja'
    return 'fas fa-user-astronaut'
  }

  const getGenderIcon = gender => {
    if (gender === 'MALE') return 'fas fa-mars'
    if (gender === 'FEMALE') return 'fas fa-venus'
    if (gender === 'M2F') return 'fas fa-transgender'
    return 'fas fa-transgender-alt'
  }

  const getDisconnectReason = type => {
    if (type === 'STOP') return `User clicked STOP`
    if (type === 'REFRESH') return `User refreshed page, you can match again`
    return `User clicked NEXT MATCH`
  }
  const handleRefresh = async () => {
    setCanRefresh(false)
    await getMe()
    setCanRefresh(true)
  }

  const handleReportClose = async didReport => {
    setOffenderId()
    if (didReport) {
      await handleRefresh()
    }
  }

  const hasMatches = !!user.matches.length

  if (!hasMatches) return <EmptyText>No matches yet</EmptyText>

  return (
    <>
      <StyledMatchHistory height={innerHeight}>
        <RefreshButton disabled={!canRefresh} label="Refresh" onClick={handleRefresh} />
        <ListContainer>
          <MatchList>
            {hasMatches &&
              user.matches.map(m => {
                const otherUser = m.users.find(u => u.id !== user.id)
                const reportMade = user.reportsMade.find(r => r.offender.id === otherUser.id)
                // Moment stuff
                const lengthDiff = Math.abs(moment(m.endedAt).diff(m.createdAt))
                const duration = moment.duration(lengthDiff)
                const matchLength = `${duration.asMinutes().toFixed()}m ${duration.seconds().toFixed()}s`
                const matchEnded = moment(m.endedAt).fromNow()

                return (
                  <MatchItem key={m.id}>
                    <MatchIconContainer>
                      <HumanIcon className={getHumanIcon(otherUser.gender)} red={!!reportMade} />
                      <GenderIcon className={getGenderIcon(otherUser.gender)} />
                      <UserIdPill>
                        <PillLabel>ID</PillLabel>
                        {otherUser.id.substr(-5)}
                      </UserIdPill>
                    </MatchIconContainer>
                    <MatchDetails>
                      <MatchText>{`${matchLength} call ended ${matchEnded}`}</MatchText>
                      <MatchText>{`${getDisconnectReason(m.disconnectType)}`}</MatchText>
                      <PillContainer>
                        <Pill>
                          <PillLabel>Sex</PillLabel>
                          {otherUser.gender}
                        </Pill>
                        <Pill>
                          <PillLabel>Age</PillLabel>
                          {otherUser.age}
                        </Pill>
                      </PillContainer>
                      <ActionButtons>
                        {/* <Button label="Message" /> */}
                        <Button
                          disabled={!!reportMade}
                          label={reportMade ? 'Reported' : 'Report'}
                          onClick={() => setOffenderId(otherUser.id)}
                        >
                          {!!reportMade && <ReportTypePill>{reportMade.type}</ReportTypePill>}
                        </Button>
                      </ActionButtons>
                    </MatchDetails>
                  </MatchItem>
                )
              })}
          </MatchList>
        </ListContainer>
      </StyledMatchHistory>

      <ReportUserDialog offenderId={offenderId} open={!!offenderId} onClose={handleReportClose} />
    </>
  )
}

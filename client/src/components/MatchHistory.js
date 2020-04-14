import React from 'react'
import styled from 'styled-components'
import { useMyUser } from '../hooks/MyUserContext'
import { Button } from './common'
import ReportUserDialog from './ReportUserDialog'

const StyledMatchHistory = styled.section`
  background-color: #3f3f3f;
  border-radius: 20px;
  margin: 10px;
  padding: 5px;

  width: 100%;
  max-height: 30rem;
  max-width: 50rem;
  overflow-y: auto;
`
const MatchList = styled.div`
  display: grid;
  gap: 1rem;
`
const MatchItem = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: max-content 1fr minmax(50px, max-content);
  align-items: center;
  justify-content: center;
  padding: 1rem 0.6rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 2rem;

  & > i {
    margin-left: 5px;
    font-size: 8rem;
    color: rgba(256, 256, 256, 0.4);
  }
`
const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`
const Pill = styled.div`
  color: ${p => p.theme.colorPrimary};
  background-color: ${p => p.theme.colorGreyDark1};
  border-radius: 500rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 1rem;
  font-size: 1.8rem;
`
const ActionButtons = styled.div``
const EmptyText = styled.p`
  color: #fff;
`

export default function MatchHistory() {
  const { user } = useMyUser()

  const [offenderId, setOffenderId] = React.useState()

  const getIcon = gender => {
    if (gender === 'MALE') return 'fas fa-user-secret'
    if (gender === 'FEMALE') return 'fas fa-user-nurse'
    if (gender === 'M2F') return 'fas fa-user-ninja'
    return 'fas fa-user-astronaut'
  }

  return (
    <>
      <StyledMatchHistory>
        <MatchList>
          {user.visited.length > 0 ? (
            user.visited.map(u => {
              const alreadyReported = user.reportsMade.some(r => r.offender.id === u.id)
              return (
                <MatchItem key={u.id}>
                  <i className={getIcon(u.gender)} />
                  <PillContainer>
                    <Pill>
                      <i className="fas fa-angle-right" />
                      {u.gender}
                    </Pill>
                    <Pill>
                      <i className="fas fa-angle-right" />
                      {u.age}
                    </Pill>
                  </PillContainer>
                  <ActionButtons>
                    {/* <Button label="Message" /> */}
                    <Button
                      disabled={alreadyReported}
                      label={alreadyReported ? 'Reported' : 'Report'}
                      onClick={() => setOffenderId(u.id)}
                    />
                  </ActionButtons>
                </MatchItem>
              )
            })
          ) : (
            <EmptyText>No matches yet</EmptyText>
          )}
        </MatchList>
      </StyledMatchHistory>

      <ReportUserDialog offenderId={offenderId} open={!!offenderId} onClose={() => setOffenderId()} />
    </>
  )
}

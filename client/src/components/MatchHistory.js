import React from 'react'
import styled from 'styled-components'

const StyledMatchHistory = styled.section`
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
  color: ${props => props.theme.colorPrimary};
  background-color: ${props => props.theme.colorGreyDark1};
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

const MatchHistory = props => {
  const { users } = props

  const getIcon = gender => {
    if (gender === 'MALE') return 'fas fa-user-secret'
    if (gender === 'FEMALE') return 'fas fa-user-nurse'
    if (gender === 'M2F') return 'fas fa-user-ninja'
    return 'fas fa-user-astronaut'
  }

  return (
    <StyledMatchHistory>
      <MatchList>
        {users.length > 0 ? (
          users.map(u => (
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
                <button type="button">Message</button>
                <button type="button">Report</button>
              </ActionButtons>
            </MatchItem>
          ))
        ) : (
          <EmptyText>No matches yet</EmptyText>
        )}
      </MatchList>
    </StyledMatchHistory>
  )
}

MatchHistory.defaultProps = {
  users: [
    {
      gender: 'M2F',
      age: 25,
    },
    {
      gender: 'MALE',
      age: 32,
    },
    {
      gender: 'F2M',
      age: 29,
    },
    {
      gender: 'FEMALE',
      age: 42,
    },
    {
      gender: 'MALE',
      age: 19,
    },
    {
      gender: 'F2M',
      age: 34,
    },
  ],
}

export default MatchHistory

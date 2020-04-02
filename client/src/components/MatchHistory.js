import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { Button } from './common'
import { CREATE_REPORT } from '../queries/mutations'

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

export default function MatchHistory(props) {
  const { users } = props

  const client = useApolloClient()

  const getIcon = gender => {
    if (gender === 'MALE') return 'fas fa-user-secret'
    if (gender === 'FEMALE') return 'fas fa-user-nurse'
    if (gender === 'M2F') return 'fas fa-user-ninja'
    return 'fas fa-user-astronaut'
  }

  const handleReport = async u => {
    if (!u) return
    try {
      const { error } = await client.mutate({
        mutation: CREATE_REPORT,
        variables: { data: { type: 'NO_VIDEO', offenderId: u.id } },
      })
      if (error) console.log('Error reporting', error)
    } catch (err) {
      console.log('now we swallowed', err)
    }
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
                <Button label="Message" />
                <Button label="Report" onClick={() => handleReport(u)} />
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

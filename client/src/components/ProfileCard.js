import React from 'react'
import styled from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useSocket } from '../hooks/SocketContext'

const StyledProfileCard = styled.article`
  position: absolute;
  top: 50%;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  pointer-events: none;
`

const Card = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  width: 95%;
  max-width: 60rem;
  margin: 0 auto;
  border-radius: 5rem;
  border: 1px solid ${p => p.theme.colorPrimary};
  display: flex;
  justify-content: center;
  position: relative;
  left: ${p => (p.active ? '0%' : '100%')};
  transition: all 0.4s ease-out;
`
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2rem;
`
const CardTitle = styled.h3`
  font-size: 2.4rem;
  margin: 0 auto;

  & > i {
    margin: 0 1rem;
  }
`
const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
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

export default function ProfileCard() {
  const { otherUser } = useSocket()

  const { enabledWidgets } = useEnabledWidgets()
  const active = enabledWidgets.profile

  if (!otherUser) return ''
  return (
    <StyledProfileCard>
      <Card active={active}>
        <CardContent>
          <CardTitle>
            <i className="fas fa-robot" />
            They Are
            <i className="fas fa-user-astronaut" />
          </CardTitle>
          <PillContainer>
            <Pill data-cy="profileGender">
              <i className="fas fa-angle-right" />
              {otherUser.gender}
            </Pill>
            <Pill>
              <i className="fas fa-angle-right" />
              {otherUser.age}
            </Pill>
            <Pill>
              <i className="fas fa-angle-right" />
              {otherUser.audioPref}
            </Pill>
          </PillContainer>
          <CardTitle>
            <i className="fas fa-thumbs-up" />
            They Like
            <i className="fas fa-grin-tongue" />
          </CardTitle>
          <PillContainer>
            <Pill>
              <i className="fas fa-angle-right" />
              {otherUser.lookingFor.map(x => x.name).join(', ')}
            </Pill>
            <Pill>
              <i className="fas fa-angle-right" />
              {`${otherUser.minAge}-${otherUser.maxAge}`}
            </Pill>
            <Pill>
              <i className="fas fa-angle-right" />
              {otherUser.accAudioPrefs.map(x => x.name).join(', ')}
            </Pill>
          </PillContainer>
        </CardContent>
      </Card>
    </StyledProfileCard>
  )
}

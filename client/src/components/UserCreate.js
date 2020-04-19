import React from 'react'
import { useApolloClient } from '@apollo/client'
import styled from 'styled-components'
import { CREATE_USER } from '../queries/mutations'
import UserCreateForm from './UserCreateForm'

const Main = styled.main`
  margin: 0 auto;
  max-width: 60rem;
`

const BackdropImage = styled.img`
  position: fixed;
  background: url('https://images.unsplash.com/photo-1541980162-4d2fd81f420d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80');
  filter: blur(3px) grayscale(0.9) brightness(50%);
  transform: translate(-50%, -50%) scale(3);
  object-position: center;
  transform-origin: center center;
  z-index: -1;
`

const IntroSection = styled.section`
  background-color: #3f3f3f;
  border-radius: 20px;
  margin: 10px;
  padding: 5px;

  display: flex;
  flex-direction: column;
`
const IntroText = styled.h2`
  margin: 20px 0;
  padding-top: 20px;
`
const TitleFeature = styled.h3`
  font-size: 2rem;
  margin: 2rem auto;
  text-align: left;
  width: 70%;
  color: ${p => p.theme.colorPrimary};
`

const UserCreateStats = styled.div`
  display: inline-block;
  width: 40%;
  margin: 2rem auto;
`

const UserCreateNumbers = styled.div`
  padding: 10px;
  display: flex;
  min-width: 150px;
  justify-content: space-between;
  background-color: #555;
  border: 3px dashed #9932cc;
  border-radius: 20px 0;
`

export default function UserCreate(props) {
  const { setUser } = props
  const [errorMsg, setErrorMsg] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const client = useApolloClient()

  const handleUserCreate = async ({ gender, lookingFor, age, minAge, maxAge, audioPref, accAudioPrefs }) => {
    console.log(gender, lookingFor, age, minAge, maxAge, audioPref, accAudioPrefs)
    if (age && minAge && maxAge) {
      setIsSubmitting(true)
      const { data, loading, error } = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          data: {
            gender,
            lookingFor: { connect: lookingFor },
            age,
            minAge,
            maxAge,
            audioPref,
            accAudioPrefs: { connect: accAudioPrefs },
          },
        },
      })
      if (error) {
        setErrorMsg(error)
      } else if (loading) setErrorMsg(loading)
      else {
        const user = data.createUser
        user.lookingFor = lookingFor.map(x => {
          return { name: x }
        })
        user.accAudioPrefs = accAudioPrefs.map(x => {
          return { name: x }
        })
        console.log(user)
        setUser(user)

        const fs = window.FS
        if (fs) {
          fs.setUserVars({
            displayName: `${user.gender} ${user.age} ${user.audioPref}`,
            age_int: user.age,
            gender_str: user.gender,
            lookingFor_str: user.lookingFor,
            audioPref_str: user.audioPref,
            accAudioPrefs_str: user.accAudioPrefs,
          })
        }
      }
    } else {
      setErrorMsg('Please fill out all fields')
    }
  }

  return (
    <Main>
      <BackdropImage
        alt="background stock photo"
        src="https://images.unsplash.com/photo-1541980162-4d2fd81f420d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
      />
      <IntroSection>
        <IntroText>
          Share video, audio or text*
          <br />
          Chat together
        </IntroText>
        <TitleFeature>
          <i className="far fa-check-square" /> 100% free
        </TitleFeature>
        <TitleFeature>
          <i className="far fa-check-square" /> No account required
        </TitleFeature>
        <UserCreateStats>
          <UserCreateNumbers>
            <i className="fas fa-users" />
            <h5>58</h5>
          </UserCreateNumbers>
          <p>Active users today</p>
        </UserCreateStats>
      </IntroSection>

      <UserCreateForm error={errorMsg} isSubmitting={isSubmitting} onSubmit={handleUserCreate} />

      <p>*You are paired strictly on your preferences and type of sharing (video, audio, text)</p>
    </Main>
  )
}

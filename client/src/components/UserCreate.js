import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { graphql, compose, withApollo } from 'react-apollo'
import { GET_ME } from '../queries/queries'
import { CREATE_USER } from '../queries/mutations'
import UserCreateForm from './UserCreateForm'

const Main = styled.main`
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
  display: flex;
  flex-direction: column;
`
const TitleFeature = styled.h3`
  font-size: 2rem;
  margin: 2rem auto;
  text-align: left;
  width: 70%;
  color: ${props => props.theme.colorPrimary};
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

const MoreFeatures = styled.button`
  display: inline-block;
  font: inherit;
  font-size: 2rem;
  color: inherit;
`

const UserCreate = props => {
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (document.cookie.split(';').filter(item => item.trim().startsWith('token=')).length === 0) {
      return
    }
    console.log('Cookie found, proceeding')
    const fetchData = async () => {
      const { data, error } = await props.client.query({ query: GET_ME })
      if (data.me) {
        props.storeUser(data.me)
      }
      console.log(data, error)
      return data.me
    }
    fetchData()
  }, [])

  const handleSubmit = async (e, { gender, lookingFor, age, minAge, maxAge }) => {
    e.preventDefault()
    console.log(gender, lookingFor, age, minAge, maxAge)
    if (age && minAge && maxAge) {
      const lookingForConnect = {
        connect: lookingFor.map(x => {
          return { name: x }
        }),
      }
      setIsSubmitting(true)
      const { data, loading, error } = await props.CREATE_USER({
        variables: { data: { gender, lookingFor: lookingForConnect, age, minAge, maxAge } },
      })
      if (error) {
        setErrorMsg(error)
      } else if (loading) setErrorMsg(loading)
      else {
        const { user } = data.createUser
        console.log(user)
        props.storeUser(user)
      }
    } else {
      setErrorMsg('Please fill out all fields')
    }
  }

  return (
    <Main>
      <BackdropImage
        src="https://images.unsplash.com/photo-1541980162-4d2fd81f420d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
        alt="background stock photo"
      />
      <IntroSection>
        <h2>
          Share video, audio or text*
          <br />
          Chat together
        </h2>
        <TitleFeature {...props}>
          <i className="far fa-check-square" /> 100% free
        </TitleFeature>
        <TitleFeature {...props}>
          <i className="far fa-check-square" /> No account required
        </TitleFeature>
        <UserCreateStats>
          <UserCreateNumbers>
            <i className="fas fa-users" />
            <h5>2</h5>
          </UserCreateNumbers>
          <p>Active users today</p>
        </UserCreateStats>
      </IntroSection>

      <UserCreateForm isSubmitting={isSubmitting} error={errorMsg} handleSubmit={handleSubmit} />

      <p>*You are paired strictly on your preferences and type of sharing (video, audio, text)</p>
    </Main>
  )
}

export default compose(graphql(CREATE_USER, { name: 'CREATE_USER' }))(withApollo(UserCreate))

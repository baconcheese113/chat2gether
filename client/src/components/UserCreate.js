import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { graphql, compose, withApollo } from 'react-apollo'
import { GET_ME } from '../queries/queries'
import { CREATE_USER } from '../queries/mutations'
import UserCreateForm from './UserCreateForm'

const Main = styled.main`
  /* height: 90vh;
  overflow: hidden; */
`

function UserCreate(props) {
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
      setIsSubmitting(true)
      const { data, loading, error } = await props.CREATE_USER({ variables: { data: { gender, lookingFor } } })
      if (error) setErrorMsg(error)
      else if (loading) setErrorMsg(loading)
      else {
        const { user } = data.createUser
        props.storeUser(user)
      }
    } else {
      setErrorMsg('Please fill out all fields')
    }
  }

  return (
    <Main>
      <section>
        <h2>
          Share video, audio or text*
          <br />
          Chat together
        </h2>
        <h1>
          <i className="far fa-check-square" /> 100% free
        </h1>
        <h1>
          <i className="far fa-check-square" /> No account required
        </h1>
        <div className="user-create-stats">
          <div className="user-create-numbers">
            <i className="fas fa-users" />
            <h5>2</h5>
          </div>
          <p>Active users today</p>
        </div>
      </section>

      <UserCreateForm isSubmitting={isSubmitting} error={errorMsg} handleSubmit={handleSubmit} />

      <p>*You are paired strictly on your preferences and type of sharing (video, audio, text)</p>
    </Main>
  )
}

export default compose(graphql(CREATE_USER, { name: 'CREATE_USER' }))(withApollo(UserCreate))

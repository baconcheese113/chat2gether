import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { graphql, compose, withApollo } from 'react-apollo'
import NumberSlider from './NumberSlider'
import ChoiceSlider from './ChoiceSlider'
import { UPDATE_USER } from '../queries/mutations'

const StyledForm = styled.form`
  width: 80%;
  max-width: 600px;
  background-color: ${props => props.theme.colorGreyDark1};
  padding: 1rem;
  margin: 2rem 1rem;
`
const Row = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const InputLabel = styled.label`
  display: inline-block;
  font-size: ${({ fontSize }) => fontSize || '1.5rem'};
  margin-right: 1rem;
  text-transform: uppercase;
  color: ${props => props.theme.colorPrimaryLight};
`
const SubmitButton = styled.button`
  background-image: linear-gradient(
    to bottom right,
    ${props => props.theme.colorPrimary},
    ${props => props.theme.colorGreyDark1}
  );
  box-shadow: 0 0 1rem ${props => props.theme.colorPrimaryLight};
  border-radius: 1rem;
  color: #fff;
  padding: 0.5rem 1rem;
  font-size: 2rem;
  letter-spacing: 1.5px;
  margin-top: 1rem;
  filter: grayscale(${props => (props.hasChanges ? 0 : 1)});
`

const UserUpdateForm = props => {
  const { user, setUser } = props
  const GENDERS = ['MALE', 'FEMALE', 'F2M', 'M2F']
  const [lookingFor, setLookingFor] = useState(GENDERS.indexOf(user.lookingFor) || 1)
  const [age, setAge] = useState(user.age || 30)
  const [minAge, setMinAge] = useState(user.minAge || 18)
  const [maxAge, setMaxAge] = useState(user.maxAge || 90)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const changeNumbers = newArr => {
    if (newArr.length < 1) {
      return
    }
    if (newArr.length === 1) {
      setAge(newArr[0])
    } else if (newArr.length === 2) {
      setMinAge(newArr[0])
      setMaxAge(newArr[1])
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const changes = {}
    if (lookingFor !== GENDERS.indexOf(user.lookingFor)) changes.lookingFor = GENDERS[lookingFor]

    setUser({ ...user, ...changes })
    const { data, newError } = await props.UPDATE_USER({ variables: { data: changes } })
    if (newError) {
      setError(newError)
      return
    }
    console.log(data)
  }

  useEffect(() => {
    if (lookingFor !== GENDERS.indexOf(user.lookingFor)) {
      if (!hasChanges) setHasChanges(true)
    } else if (hasChanges) setHasChanges(false)
  }, [lookingFor, user])

  return (
    <StyledForm
      onSubmit={e => {
        handleSubmit(e)
      }}
    >
      <Row>
        <InputLabel>I want to chat with</InputLabel>
        <ChoiceSlider cur={lookingFor} change={setLookingFor} choices={GENDERS} height="1.5rem" width="100%" />
      </Row>
      <Row>
        <InputLabel>Their Age</InputLabel>
        <NumberSlider numbers={[minAge, maxAge]} change={changeNumbers} showFill />
      </Row>
      {error}
      <SubmitButton hasChanges={hasChanges}>Update</SubmitButton>
    </StyledForm>
  )
}

export default compose(graphql(UPDATE_USER, { name: 'UPDATE_USER' }))(withApollo(UserUpdateForm))

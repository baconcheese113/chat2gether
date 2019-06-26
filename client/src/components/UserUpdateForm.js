import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { graphql, compose, withApollo } from 'react-apollo'
import NumberSlider from './NumberSlider'
import { UPDATE_USER } from '../queries/mutations'
import ChoicePicker from './ChoicePicker'

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

const stripLF = arr => {
  return arr.map(x => {
    return { name: x.name }
  })
}

const UserUpdateForm = props => {
  const { user, setUser } = props
  const GENDERS = ['MALE', 'FEMALE', 'F2M', 'M2F']
  const [lookingFor, setLookingFor] = useState(
    stripLF(user.lookingFor) ||
      GENDERS.map(x => {
        return { name: x }
      }),
  )
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

  const areEqualArr = (arr1, arr2) => {
    const temp1 = arr1.map(x => x.name)
    const temp2 = arr2.map(x => x.name)

    const inTemp2 = temp1.every(x => temp2.includes(x))
    const inTemp1 = temp2.every(x => temp1.includes(x))

    return inTemp1 && inTemp2
  }

  const handleSubmit = async e => {
    e.preventDefault()
    console.log(user.lookingFor, lookingFor)
    const changes = {}

    // If lookingFor is different, changes should include it
    if (!areEqualArr(user.lookingFor, lookingFor)) {
      changes.lookingFor = lookingFor
    }
    // If minAge is different, changes should include it
    if (user.minAge !== minAge) {
      changes.minAge = minAge
    }
    // If maxAge is different, changes should include it
    if (user.maxAge !== maxAge) {
      changes.maxAge = maxAge
    }

    console.log(changes)
    // If changes is empty return
    if (Object.entries(changes).length === 0) return

    // setUser based off changes
    setUser({ ...user, ...changes })

    // Now change shape to fit update (if lookingFor was changed)
    if (user.lookingFor != lookingFor) {
      changes.lookingFor = {
        set: stripLF(lookingFor),
      }
    }

    // Send request
    const { data, newError } = await props.UPDATE_USER({ variables: { data: changes } })
    if (newError) {
      setError(newError)
    }
    console.log(data)
  }

  useEffect(() => {
    if (!areEqualArr(user.lookingFor, lookingFor) || minAge != user.minAge || maxAge != user.maxAge) {
      if (!hasChanges) setHasChanges(true)
    } else if (hasChanges) setHasChanges(false)
  }, [lookingFor, user, maxAge, minAge])

  return (
    <StyledForm
      onSubmit={e => {
        handleSubmit(e)
      }}
    >
      <Row>
        <InputLabel>I want to chat with</InputLabel>
        <ChoicePicker selected={lookingFor} change={setLookingFor} choices={GENDERS} height="1.5rem" width="100%" />
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
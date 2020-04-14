import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { UPDATE_USER } from '../queries/mutations'
import { GENDERS, AUDIO_PREFS } from '../helpers/constants'
import { useSocket } from '../hooks/SocketContext'
import { useMyUser } from '../hooks/MyUserContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import ChoiceSlider from './ChoiceSlider'
import ChoicePicker from './ChoicePicker'
import NumberSlider from './NumberSlider'
import { Button } from './common'

const StyledForm = styled.div`
  border: #555 solid 2px;
  padding: 10px;
  border-radius: 5px;

  width: 98%;
  max-height: 60%;
  max-width: 600px;
  background-color: ${p => p.theme.colorGreyDark1};
  display: flex;
  flex-direction: column;
`
const Row = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ScrollContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`
const InputLabel = styled.label`
  display: inline-block;
  font-size: ${p => p.fontSize || '1.5rem'};
  margin-right: 1rem;
  text-transform: uppercase;
  color: ${p => p.theme.colorPrimaryLight};
`
const SubmitButton = styled(Button)`
  margin-top: 10px;
`

const stripArr = arr => {
  return arr.map(x => {
    return { name: x.name }
  })
}

export default function UserUpdateForm() {
  const client = useApolloClient()
  const { user, getMe } = useMyUser()
  const { localStream } = useLocalStream()
  const { nextMatch, roomId } = useSocket()

  const [lookingFor, setLookingFor] = React.useState(
    stripArr(user.lookingFor) ||
      GENDERS.map(x => {
        return { name: x }
      }),
  )
  const [minAge, setMinAge] = React.useState(user.minAge || 18)
  const [maxAge, setMaxAge] = React.useState(user.maxAge || 90)
  const [audioPref, setAudioPref] = React.useState(AUDIO_PREFS.indexOf(user.audioPref) || 0)
  const [accAudioPrefs, setAccAudioPrefs] = React.useState(
    stripArr(user.accAudioPrefs) ||
      AUDIO_PREFS.map(x => {
        return { name: x }
      }),
  )
  const [loading, setLoading] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  const changeNumbers = newArr => {
    if (newArr.length === 2) {
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

  const handleSubmit = async () => {
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
    // If audioPref is different, changes should include it
    if (AUDIO_PREFS.indexOf(user.audioPref) !== audioPref) {
      changes.audioPref = AUDIO_PREFS[audioPref]
    }
    // If accAudioPrefs is different, changes should include it
    if (!areEqualArr(user.accAudioPrefs, accAudioPrefs)) {
      changes.accAudioPrefs = accAudioPrefs
    }

    console.log(changes)
    // If changes is empty return
    if (Object.entries(changes).length === 0) return

    const updatedUser = await getMe()

    // Now change shape to fit update (if lookingFor was changed)
    if (updatedUser.lookingFor !== lookingFor) {
      changes.lookingFor = {
        set: stripArr(lookingFor),
      }
    }
    // Now change shape to fit update (if accAudioPrefs was changed)
    if (updatedUser.accAudioPrefs !== accAudioPrefs) {
      changes.accAudioPrefs = {
        set: stripArr(accAudioPrefs),
      }
    }

    setLoading(true)
    // Send request
    const { data } = await client.mutate({ mutation: UPDATE_USER, variables: { data: changes } })
    console.log(data)

    // setUser based off changes
    await getMe()
    setLoading(false)
    if (roomId && localStream) nextMatch(localStream)
  }

  React.useEffect(() => {
    if (
      !areEqualArr(user.lookingFor, lookingFor) ||
      minAge !== user.minAge ||
      maxAge !== user.maxAge ||
      !areEqualArr(user.accAudioPrefs, accAudioPrefs) ||
      audioPref !== AUDIO_PREFS.indexOf(user.audioPref)
    ) {
      if (!hasChanges) setHasChanges(true)
    } else if (hasChanges) setHasChanges(false)
  }, [lookingFor, user, maxAge, minAge, audioPref, accAudioPrefs, hasChanges])

  return (
    <StyledForm>
      <ScrollContent>
        <Row>
          <InputLabel>I want to chat with</InputLabel>
          <ChoicePicker
            choices={GENDERS}
            data-cy="theirGenderPicker"
            height="1.5rem"
            selected={lookingFor}
            width="100%"
            onChange={setLookingFor}
          />
        </Row>
        <Row>
          <InputLabel>Their Age</InputLabel>
          <NumberSlider showFill data-cy="theirAgeSlider" numbers={[minAge, maxAge]} onChange={changeNumbers} />
        </Row>
        <Row>
          <InputLabel>My Audio Preference</InputLabel>
          <ChoiceSlider
            choices={AUDIO_PREFS}
            cur={audioPref}
            data-cy="myAudioSlider"
            fontSize="1.2rem"
            height="1.5rem"
            width="100%"
            onChange={setAudioPref}
          />
        </Row>
        <Row>
          <InputLabel>Preferences I&apos;ll do</InputLabel>
          <ChoicePicker
            choices={AUDIO_PREFS}
            data-cy="theirAudioPicker"
            fontSize="1.1rem"
            height="1.5rem"
            selected={accAudioPrefs}
            width="100%"
            onChange={setAccAudioPrefs}
          />
        </Row>
      </ScrollContent>
      <SubmitButton
        primary
        data-cy="applyChangesButton"
        disabled={!hasChanges || loading}
        label="Apply"
        onClick={handleSubmit}
      />
    </StyledForm>
  )
}

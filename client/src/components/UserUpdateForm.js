import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import NumberSlider from './NumberSlider'
import { UPDATE_USER } from '../queries/mutations'
import ChoicePicker from './ChoicePicker'
import ChoiceSlider from './ChoiceSlider'
import { GENDERS, AUDIO_PREFS } from '../helpers/constants'
import { useSocket } from '../hooks/SocketContext'
import { useMyUser } from '../hooks/MyUserContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
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
            data-cy="theirGenderPicker"
            selected={lookingFor}
            onChange={setLookingFor}
            choices={GENDERS}
            height="1.5rem"
            width="100%"
          />
        </Row>
        <Row>
          <InputLabel>Their Age</InputLabel>
          <NumberSlider data-cy="theirAgeSlider" numbers={[minAge, maxAge]} onChange={changeNumbers} showFill />
        </Row>
        <Row>
          <InputLabel>My Audio Preference</InputLabel>
          <ChoiceSlider
            data-cy="myAudioSlider"
            cur={audioPref}
            onChange={setAudioPref}
            choices={AUDIO_PREFS}
            height="1.5rem"
            width="100%"
            fontSize="1.2rem"
          />
        </Row>
        <Row>
          <InputLabel>Preferences I&apos;ll do</InputLabel>
          <ChoicePicker
            data-cy="theirAudioPicker"
            selected={accAudioPrefs}
            onChange={setAccAudioPrefs}
            choices={AUDIO_PREFS}
            height="1.5rem"
            width="100%"
            fontSize="1.1rem"
          />
        </Row>
      </ScrollContent>
      <SubmitButton
        data-cy="applyChangesButton"
        primary
        onClick={handleSubmit}
        disabled={!hasChanges || loading}
        label="Apply"
      />
    </StyledForm>
  )
}

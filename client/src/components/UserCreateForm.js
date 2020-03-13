import React from 'react'
import styled from 'styled-components'
import ChoiceSlider from './ChoiceSlider'
import NumberSlider from './NumberSlider'
import SVGTester from './SVGTester'
import ChoicePicker from './ChoicePicker'
import { GENDERS, AUDIO_PREFS } from '../helpers/constants'
import { Button } from './common'

const StyledForm = styled.div`
  border: #555 solid 2px;
  border-radius: 5px;

  background-color: ${p => p.theme.colorGreyDark1};
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
  font-size: ${p => p.fontSize || '1.5rem'};
  margin-bottom: 4px;
  margin-top: 2rem;
  text-transform: uppercase;
  color: ${p => p.theme.colorPrimaryLight};
`
const Summary = styled.p`
  font-size: 10px;
  font-style: italic;
`
const SubmitButton = styled(Button)`
  box-shadow: 0 0 5px #ffffff33;
  letter-spacing: 1.5px;
  margin-top: 1rem;
  filter: brightness(0.9);
  transition: 0.6s all;

  &:hover {
    filter: brightness(1);
    box-shadow: 0 0 5px #ffffffaa;
  }
`
const Modal = styled.div`
  position: fixed;
  top: 0;
  bottom: 0%;
  left: 0%;
  right: 0%;
  background-color: #111;
  opacity: 0.9;

  & > * {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0%;
    transform: translateY(-50%);
  }
`

export default function UserCreateForm(props) {
  const { error, onSubmit } = props
  const [gender, setGender] = React.useState(0)
  const [lookingFor, setLookingFor] = React.useState(
    GENDERS.map(x => {
      return { name: x }
    }),
  )
  const [age, setAge] = React.useState(30)
  const [minAge, setMinAge] = React.useState(18)
  const [maxAge, setMaxAge] = React.useState(90)
  const [audioPref, setAudioPref] = React.useState(0)
  const [accAudioPrefs, setAccAudioPrefs] = React.useState(
    AUDIO_PREFS.map(x => {
      return { name: x }
    }),
  )
  const [isLoading, setIsLoading] = React.useState(false)

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

  const handleSubmit = () => {
    setIsLoading(true)
    onSubmit({
      gender: GENDERS[gender],
      lookingFor,
      age,
      minAge,
      maxAge,
      audioPref: AUDIO_PREFS[audioPref],
      accAudioPrefs,
    })
  }

  return (
    <StyledForm>
      {isLoading && (
        <Modal>
          <SVGTester height="50vh" width="50vh" />
        </Modal>
      )}
      <Row>
        <InputLabel>I&apos;m</InputLabel>
        <Summary>{GENDERS[gender]}</Summary>
        <ChoiceSlider
          data-cy="myGenderSlider"
          cur={gender}
          change={setGender}
          choices={GENDERS}
          height="1.5rem"
          width="100%"
        />
      </Row>
      <Row>
        <InputLabel>I want to chat with</InputLabel>
        <Summary>{lookingFor && lookingFor.map(g => g.name).join(', ')}</Summary>
        <ChoicePicker
          data-cy="theirGenderPicker"
          selected={lookingFor}
          change={setLookingFor}
          choices={GENDERS}
          height="1.5rem"
          width="100%"
        />
      </Row>
      <Row>
        <InputLabel>My Age</InputLabel>
        <NumberSlider dataCy="myAgeSlider" numbers={[age]} change={changeNumbers} />
      </Row>
      <Row>
        <InputLabel>Their age</InputLabel>
        <NumberSlider dataCy="theirAgeSlider" numbers={[minAge, maxAge]} change={changeNumbers} showFill />
      </Row>
      <Row>
        <InputLabel>My Audio Preference</InputLabel>
        <Summary>{AUDIO_PREFS[audioPref]}</Summary>
        <ChoiceSlider
          data-cy="myAudioSlider"
          cur={audioPref}
          change={setAudioPref}
          choices={AUDIO_PREFS}
          height="1.5rem"
          width="100%"
        />
      </Row>
      <Row>
        <InputLabel>Preferences I&apos;ll do</InputLabel>
        <Summary>{accAudioPrefs && accAudioPrefs.map(ap => ap.name).join(', ')}</Summary>
        <ChoicePicker
          data-cy="theirAudioPicker"
          selected={accAudioPrefs}
          change={setAccAudioPrefs}
          choices={AUDIO_PREFS}
          height="1.5rem"
          width="100%"
          fontSize="1.1rem"
        />
      </Row>
      {error}
      <SubmitButton onClick={handleSubmit} h2 primary data-cy="startButton" label="Start" />
    </StyledForm>
  )
}

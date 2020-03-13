import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { CREATE_FEEDBACK } from '../queries/mutations'
import SVGTester from './SVGTester'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import { Button } from './common'

const StyledSettings = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`
const Blur = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  filter: blur(5px) saturate(20%);
  background-color: #000000aa;
`

const Container = styled.div`
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 40rem;
  width: 30rem;
  max-width: 90%;
  max-height: 90%;
  background-color: #313131;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem #000;
  display: flex;
  flex-direction: column;
`
const Title = styled.h3`
  margin: 1rem 2rem;
  font-size: 2rem;
  padding: 1rem;
  border-bottom: 2px solid #222;
`
const SettingsList = styled.div`
  padding: 1.5rem;
  flex-grow: 1;

  label {
    font-size: 1.4rem;
    padding: 0;
  }
`
const DeviceSelect = styled.select`
  border-radius: 10px 10px 2px 2px;
  outline: none;
  border: 2px solid #3f3f3f;
  margin: 2px;

  font: inherit;
  padding: 0;
  max-width: 100%;
  cursor: pointer;
`
const DeviceOption = styled.option`
  border-radius: 10px 10px 2px 2px;
  outline: none;
  border: 2px solid #3f3f3f;
  margin: 2px;

  font: inherit;
  padding: 0;
  max-width: 100%;
  cursor: pointer;
`

const Actions = styled.div`
  display: flex;
  /* for Edge */
  /* justify-content: space-around; */
  justify-content: space-evenly;
  justify-self: flex-end;
  font-size: 1.2rem;
`
const LeftAction = styled(Button)``

const FeedbackForm = styled.div`
  background-color: #313131;
  border: #555 solid 2px;
  padding: 10px;
  border-radius: 5px;

  p {
    font-size: 1.4rem;
  }
`
const FeedbackInput = styled.input`
  border-radius: 10px 10px 2px 2px;
  outline: none;
  border: 2px solid #3f3f3f;
  margin: 2px;
  cursor: pointer;

  font-size: 1.2rem;
  border-radius: 1rem;
  padding: 0.5rem;
  min-height: 4rem;
  width: 100%;
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

export default function Settings() {
  const [devices, setDevices] = React.useState([])
  const [selectedVideo, setSelectedVideo] = React.useState(null)
  const [feedbackText, setFeedbackText] = React.useState('')
  const [feedbackMsg, setFeedbackMsg] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const { localStream, requestCamera } = useLocalStream()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const client = useApolloClient()

  const getDevices = async () => {
    try {
      console.log(selectedVideo)
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const vids = allDevices.map((cur, idx) => {
        if (cur.kind === 'videoinput') {
          // console.log(cur.getCapabilities())
          return (
            <DeviceOption key={idx} value={cur.deviceId}>
              {cur.label}
            </DeviceOption>
          )
        }
        return undefined
      })
      setDevices(vids)
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  React.useEffect(() => {
    if (!localStream) return
    const videoId = localStream.getVideoTracks()[0].getSettings().deviceId
    setSelectedVideo(videoId)
    getDevices()
  }, [])

  const handleClose = (shouldApply = true) => {
    if (shouldApply) {
      requestCamera(selectedVideo)
    }
    setEnabledWidgets({ ...enabledWidgets, menu: false })
  }

  const handleFeedback = async () => {
    if (feedbackText.length < 1) return 0
    setIsLoading(true)
    const { loading, error } = await client.mutate({
      mutation: CREATE_FEEDBACK,
      variables: { data: { text: feedbackText } },
    })
    setIsLoading(false)
    if (loading || error) console.log(loading, error)
    else {
      setFeedbackText('')
      setFeedbackMsg('Thanks for your feedback!')
    }
    return null
  }

  console.log(feedbackText)

  return (
    <StyledSettings>
      {isLoading && (
        <Modal>
          <SVGTester height="50vh" width="50vh" />
        </Modal>
      )}
      <Blur role="button" tabIndex={0} onClick={handleClose} onKeyUp={handleClose} />
      <Container>
        <Title>Settings</Title>
        <SettingsList>
          <label htmlFor="video-source">
            Video Source
            <DeviceSelect
              id="video-source"
              value={selectedVideo || ''}
              onChange={e => setSelectedVideo(e.target.value)}
            >
              {devices}
            </DeviceSelect>
          </label>

          <FeedbackForm>
            <p>SendFeedback</p>
            <FeedbackInput value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            {feedbackMsg}
            <Button light small disabled={!feedbackText} onClick={handleFeedback} label="Submit" />
          </FeedbackForm>
        </SettingsList>
        <Actions>
          <LeftAction square flex onClick={() => handleClose(false)} label="Cancel" />
          <Button primary square flex onClick={handleClose} label="Apply" />
        </Actions>
      </Container>
    </StyledSettings>
  )
}

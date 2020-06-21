import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { CREATE_FEEDBACK } from '../queries/mutations'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { useLocalStream } from '../hooks/LocalStreamContext'
import SVGTester from './SVGTester'
import { Button, Dialog } from './common'

const StyledSettings = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`
const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 1.5rem;
  flex-grow: 1;
  font-size: 14px;
`
const DeviceLabel = styled.label`
  justify-self: center;
`
const DeviceSelect = styled.select`
  border-radius: 10px 10px 2px 2px;
  outline: none;
  border: 2px solid #3f3f3f;
  margin: 2px;
  margin-bottom: 16px;

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

const FeedbackForm = styled.div`
  background-color: #313131;
  border: #555 solid 2px;
  padding: 10px;
  border-radius: 5px;
  margin-top: 16px;

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
  const [videoDevices, setVideoDevices] = React.useState([])
  const [audioDevices, setAudioDevices] = React.useState([])
  const [selectedVideo, setSelectedVideo] = React.useState(null)
  const [selectedAudio, setSelectedAudio] = React.useState(null)
  const [feedbackText, setFeedbackText] = React.useState('')
  const [feedbackMsg, setFeedbackMsg] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const { localStream, requestDevices } = useLocalStream()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const client = useApolloClient()

  const getDevices = React.useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const { videoArr, audioArr } = allDevices.reduce(
        (prev, cur, idx) => {
          const option = (
            <DeviceOption key={idx} value={cur.deviceId}>
              {cur.label}
            </DeviceOption>
          )
          if (cur.kind === 'videoinput') {
            // console.log(cur.getCapabilities())
            return { ...prev, videoArr: [...prev.videoArr, option] }
          }
          if (cur.kind === 'audioinput') {
            return { ...prev, audioArr: [...prev.audioArr, option] }
          }
          return prev
        },
        { videoArr: [], audioArr: [] },
      )
      setVideoDevices(videoArr)
      setAudioDevices(audioArr)
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }, [])

  React.useEffect(() => {
    if (!localStream) return
    const videoId = localStream.getVideoTracks()[0].getSettings().deviceId
    setSelectedVideo(videoId)
    const audioTracks = localStream.getAudioTracks()
    if (audioTracks.length) setSelectedAudio(audioTracks[0].getSettings().deviceId)
    getDevices()
  }, [getDevices, localStream])

  const handleClose = (shouldApply = true) => {
    if (shouldApply) {
      requestDevices(selectedVideo, selectedAudio)
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

  const handleChangeVideo = e => {
    console.log('device change id', e.target.value)
    setSelectedVideo(e.target.value)
  }

  const handleChangeAudio = e => {
    console.log('device change id', e.target.value)
    setSelectedAudio(e.target.value)
  }

  return (
    <StyledSettings>
      {isLoading && (
        <Modal>
          <SVGTester height="50vh" width="50vh" />
        </Modal>
      )}
      <Dialog open isLoading={isLoading} title="Settings" onCancel={() => handleClose(false)} onConfirm={handleClose}>
        <SettingsList>
          <DeviceLabel htmlFor="video-source">Video Source</DeviceLabel>
          <DeviceSelect id="video-source" value={selectedVideo || ''} onChange={handleChangeVideo}>
            {videoDevices}
          </DeviceSelect>

          <DeviceLabel htmlFor="audio-source">Audio Source</DeviceLabel>
          <DeviceSelect id="audio-source" value={selectedAudio || ''} onChange={handleChangeAudio}>
            {audioDevices}
          </DeviceSelect>

          <FeedbackForm>
            <p>Send Feedback</p>
            <FeedbackInput value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            {feedbackMsg}
            <Button light small disabled={!feedbackText} label="Submit" onClick={handleFeedback} />
          </FeedbackForm>
        </SettingsList>
      </Dialog>
    </StyledSettings>
  )
}

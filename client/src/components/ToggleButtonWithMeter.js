import React from 'react'
import styled from 'styled-components'
import ToggleButton from './ToggleButton'

const IconContainer = styled.div`
  height: 18px;
  width: 100%;
  position: absolute;
  display: flex;
  align-items: flex-end;
`
const Expander = styled.div.attrs(p => ({
  style: {
    height: `${p.percent || 0}%`,
    // height: `${p.vol.current}%`,
  },
}))`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  width: 100%;
  overflow: hidden;
`
const DynamicIcon = styled.i`
  position: absolute;
  bottom: 0;
  color: black;
`

function clamp(number, min, max) {
  return Math.max(0, Math.min(number || 0, max))
}

const bufferSize = 512

export default function ToggleButtonWithMeter(props) {
  const { stream, iconClass, onClick, notification, active, innerWidth, 'data-cy': dataCy } = props

  const [volume, setVolume] = React.useState(0)
  const vol = React.useRef(0) // Use to prevent crazy amounts of re-renders

  const processor = React.useRef()
  const mediaStreamSource = React.useRef()

  const processAudioVolume = React.useCallback(event => {
    const inputBuffer = event.inputBuffer.getChannelData(0)
    // Do a root-mean-square on the samples: sum up the squares...
    const sampleSum = inputBuffer.reduce((sum, sample) => sum + sample * sample, 0)
    // ... then take the square root of the sum.
    const rms = Math.sqrt(sampleSum / inputBuffer.length)
    // Now smooth this out with the averaging factor applied to the previous sample
    vol.current = Math.max(rms, vol.current * 0.97)
  }, [])

  const endProcessor = React.useCallback(() => {
    if (processor.current) {
      processor.current.disconnect()
      processor.current = null
    }
    if (mediaStreamSource.current) {
      mediaStreamSource.current.disconnect()
      mediaStreamSource.current = null
    }
  }, [processor])

  const connectProcessor = React.useCallback(async () => {
    if (processor.current) {
      return
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext // dammit apple
      const audioContext = new AudioContext()
      mediaStreamSource.current = audioContext.createMediaStreamSource(stream)

      const newProcessor = audioContext.createScriptProcessor(bufferSize)
      newProcessor.onaudioprocess = processAudioVolume

      newProcessor.connect(audioContext.destination)
      mediaStreamSource.current.connect(newProcessor)
      processor.current = newProcessor
    } catch (err) {
      console.error('audio meter error', err)
    }
  }, [processAudioVolume, stream])

  React.useEffect(() => {
    if (stream && !processor.current) {
      connectProcessor()
    }
    const refresh = setInterval(() => {
      if (!processor.current) return
      setVolume(vol.current)
    }, 100) // 10fps
    return () => {
      endProcessor()
      clearInterval(refresh)
    }
  }, [connectProcessor, endProcessor, processor, stream])

  return (
    <ToggleButton
      active={active}
      data-cy={dataCy}
      innerWidth={innerWidth}
      notification={notification}
      onClick={onClick}
    >
      <i className={iconClass} />
      <IconContainer>
        <Expander percent={clamp(volume * 4, 0, 1) * 100} vol={vol}>
          <DynamicIcon className={iconClass} />
        </Expander>
      </IconContainer>
    </ToggleButton>
  )
}

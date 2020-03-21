import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'

const circlingDashes = keyframes`
  from { box-shadow: 0 0 0 10px #5e5e5e; }
  to { box-shadow: 0 0 0 5px #fff; }
`
const LocalVideoContainer = styled.div`
  position: absolute;
  overflow: hidden;
  display: ${p => !p.isShown && 'none'};

  top: ${p => p.top}px;
  left: ${p => p.left}px;
  touch-action: none;
  box-shadow: 0 0 2px #949494;
  opacity: 0.9;
  max-width: 35%;
  width: 180px;
  border-radius: 20px;
  border: 2px solid #555;
  transition: border-style 1s, box-shadow 1.2s, filter 0.6s, animation 3s;

  &:hover {
    box-shadow: 0 0 3px #fff;
  }
  &:active {
    border: 4px dotted;
    box-shadow: 0 0 0 5px #fff;
    filter: opacity(0.6);
    animation-name: ${circlingDashes};
    animation-duration: 0.6s;
    animation-delay: 0.8s;
    animation-iteration-count: infinite;
  }
`
const RemoteVideoContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`
const LocalVideo = styled.video`
  width: 100%;
`
const RemoteVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  height: ${p => !p.alignTop && '100%'};
  width: 100%;
  max-height: 100%;
`

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max))
}

export default function VideoWindow(props) {
  const { stream, videoType, flowDirection } = props

  const [top, setTop] = React.useState(50)
  const [left, setLeft] = React.useState(50)

  const videoRef = React.useRef(null)
  const containerRef = React.useRef(null)

  const { chatSettings, enabledWidgets } = useEnabledWidgets()

  const handleDrag = e => {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none'
    }
    setTop(clamp(e.clientY - 75, 20, 640 - 300))
    setLeft(clamp(e.clientX - 50, 20, 360 - 150))
  }

  const onTouchMove = e => {
    handleDrag(e.touches[0])
  }

  React.useEffect(() => {
    const container = containerRef.current
    container.addEventListener('mousedown', e => {
      handleDrag(e)
      container.parentElement.addEventListener('mousemove', handleDrag)
    })
    container.parentElement.addEventListener('mouseup', () => {
      if (!container) return
      container.parentElement.removeEventListener('mousemove', handleDrag)
    })
    return () => {
      container.parentElement.removeEventListener('mousemove', handleDrag)
    }
  }, [])

  React.useEffect(() => {
    if (stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
    }
  })

  const getVideo = VideoComponent => {
    if (stream) {
      return (
        <VideoComponent
          ref={videoRef}
          alignTop={flowDirection === 'column' && enabledWidgets.video}
          id={videoType}
          muted={videoType === 'localVideo' || chatSettings.speakerMute}
          autoPlay
          playsInline
          controls={false}
        />
      )
    }
    return ''
  }

  if (videoType === 'localVideo') {
    return (
      <LocalVideoContainer
        data-cy="localVideo"
        top={top}
        left={left}
        onTouchMove={onTouchMove}
        ref={containerRef}
        isShown={enabledWidgets.localVideo}
      >
        {getVideo(LocalVideo)}
      </LocalVideoContainer>
    )
  }
  return (
    <RemoteVideoContainer data-cy="remoteVideo" ref={containerRef}>
      {getVideo(RemoteVideo)}
    </RemoteVideoContainer>
  )
}

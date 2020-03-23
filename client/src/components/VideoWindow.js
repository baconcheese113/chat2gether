import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'

const circlingDashes = keyframes`
  from { box-shadow: 0 0 0 10px #5e5e5e; }
  to { box-shadow: 0 0 0 5px #fff; }
`
const LocalVideoContainer = styled.div.attrs(p => ({
  style: {
    top: `${p.top}px`,
    left: `${p.left}px`,
  },
}))`
  position: absolute;
  overflow: hidden;
  display: ${p => !p.isShown && 'none'};
  touch-action: none;
  box-shadow: 0 0 2px #949494;
  opacity: 0.9;
  width: ${p => (p.isExpanded ? p.dimensions.width * 1.5 : p.dimensions.width)}px;
  height: ${p => (p.isExpanded ? p.dimensions.height * 1.5 : p.dimensions.height)}px;
  border-radius: 20px;
  border: 2px solid #555;
  transition: border-style 1s, box-shadow 1.2s, filter 0.6s, animation 3s, width 0.6s, height 0.6s;

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
const ExpandIcon = styled.i`
  position: absolute;
  bottom: 5%;
  right: 5%;
  opacity: 0.5;
`
const RemoteVideoContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`
const LocalVideo = styled.video`
  width: 100%;
  transition: width 0.6s, height 0.6s;
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

function getMultiplier(videoWidth, videoHeight) {
  const minWidthMult = 100 / videoWidth
  const minHeightMult = 100 / videoHeight

  const maxWidthMult = 250 / videoWidth
  const maxHeightMult = 250 / videoHeight

  const scaledWidthMult = (window.innerWidth * 0.2) / videoWidth
  const scaledHeightMult = (window.innerHeight * 0.3) / videoHeight

  const widthMult = Math.max(minWidthMult, Math.min(scaledWidthMult, maxWidthMult))
  const heightMult = Math.max(minHeightMult, Math.min(scaledHeightMult, maxHeightMult))
  return Math.min(widthMult, heightMult)
}

export default function VideoWindow(props) {
  const { stream, videoType, flowDirection } = props

  const [top, setTop] = React.useState(50)
  const [left, setLeft] = React.useState(50)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [videoDimensions, setVideoDimensions] = React.useState({ width: 100, height: 100 })
  const [originalDimensions, setOriginalDimensions] = React.useState({ width: 100, height: 100 })

  const videoRef = React.useRef(null)
  const containerRef = React.useRef(null)
  const expansionTimerRef = React.useRef()

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
      clearTimeout(expansionTimerRef.current)
      setIsExpanded(true)
      handleDrag(e)
      container.parentElement.addEventListener('mousemove', handleDrag)
    })
    container.parentElement.addEventListener('mouseup', () => {
      if (!container || !container.parentElement) return
      container.parentElement.removeEventListener('mousemove', handleDrag)
      expansionTimerRef.current = setTimeout(() => {
        setIsExpanded(false)
      }, 5000)
    })
    return () => {
      clearTimeout(expansionTimerRef.current)
      container.parentElement.removeEventListener('mousemove', handleDrag)
    }
  }, [])

  React.useEffect(() => {
    if (stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
    }
  })

  const handleResize = e => {
    const { videoWidth, videoHeight } = e.target
    if (!videoWidth || !videoHeight) return
    setOriginalDimensions({ width: videoWidth, height: videoHeight })
    const multiplier = getMultiplier(videoWidth, videoHeight)
    setVideoDimensions({ width: videoWidth * multiplier, height: videoHeight * multiplier })
  }

  const handleWindowResize = React.useCallback(() => {
    const { width, height } = originalDimensions
    const multiplier = getMultiplier(width, height)
    setVideoDimensions({ width: width * multiplier, height: height * multiplier })
  }, [originalDimensions])

  React.useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('resize', handleResize)
    }
    window.addEventListener('resize', handleWindowResize)
    return () => {
      video.removeEventListener('resize', handleResize)
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [handleWindowResize])

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
        isExpanded={isExpanded}
        dimensions={videoDimensions}
      >
        {!isExpanded && <ExpandIcon className="fas fa-expand" />}
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

import React from 'react'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max))
}

function VideoWindow(props) {
  const { stream, videoType } = props

  const [top, setTop] = React.useState(50)
  const [left, setLeft] = React.useState(50)

  const videoRef = React.useRef(null)
  const containerRef = React.useRef(null)

  const { chatSettings } = useEnabledWidgets()

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
    containerRef.current.addEventListener('mousedown', e => {
      handleDrag(e)
      containerRef.current.parentElement.addEventListener('mousemove', handleDrag)
    })
    containerRef.current.parentElement.addEventListener('mouseup', () => {
      if (!containerRef.current) return
      containerRef.current.parentElement.removeEventListener('mousemove', handleDrag)
    })
    // trySetMediaStream()
    return () => {
      containerRef.current.parentElement.removeEventListener('mousemove', handleDrag)
    }
  }, [])

  React.useEffect(() => {
    if (stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
    }
  })

  const getVideo = () => {
    const remoteWidth = videoType === 'remoteVideo' ? '100%' : undefined
    if (stream) {
      return (
        <video
          ref={videoRef}
          id={videoType}
          style={{ width: remoteWidth }}
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
      <div
        onTouchMove={onTouchMove}
        style={{ top: `${top}px`, left: `${left}px` }}
        ref={containerRef}
        className="video-container video-local"
      >
        {getVideo()}
      </div>
    )
  }
  return (
    <div ref={containerRef} className="video-container video-remote">
      {getVideo()}
    </div>
  )
}

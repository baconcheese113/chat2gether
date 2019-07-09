import React from 'react'
import styled from 'styled-components'
import ToggleButton from './ToggleButton'

const SettingsBar = styled.div`
  position: absolute;
  bottom: 0;
  transform: scale(0.8);
  opacity: 0.7;
`

class VideoWindow extends React.Component {
  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
    this.containerRef = React.createRef()
    this.state = {
      top: 50,
      left: 50,
    }
  }

  componentDidMount() {
    this.containerRef.current.addEventListener('mousedown', e => {
      this.handleDrag(e)
      this.containerRef.current.parentElement.addEventListener('mousemove', this.handleMouseMove)
    })
    this.containerRef.current.parentElement.addEventListener('mouseup', () => {
      if (!this.containerRef.current) return
      this.containerRef.current.parentElement.removeEventListener('mousemove', this.handleMouseMove)
    })
    this.trySetMediaStream()
  }

  componentDidUpdate() {
    this.trySetMediaStream()
  }

  componentWillUnmount() {
    this.containerRef.current.parentElement.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseMove = e => {
    this.handleDrag(e)
  }

  trySetMediaStream = () => {
    const { stream } = this.props
    if (stream && this.videoRef.current.srcObject !== stream) {
      this.videoRef.current.srcObject = stream
    }
  }

  getVideo = () => {
    const { stream, videoType, chatSettings } = this.props
    if (stream) {
      return (
        <video
          ref={this.videoRef}
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

  clamp = (number, min, max) => {
    return Math.max(min, Math.min(number, max))
  }

  handleDrag = e => {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none'
    }
    // this.containerRef.current.style={top:'250px'};
    const top = this.clamp(e.clientY - 75, 20, 640 - 300)
    const left = this.clamp(e.clientX - 50, 20, 360 - 150)
    this.setState({ top, left })
  }

  onTouchMove = e => {
    this.handleDrag(e.touches[0])
  }

  render() {
    const { videoType, chatSettings, setChatSettings } = this.props
    const { top, left } = this.state

    if (videoType === 'localVideo') {
      return (
        <div
          onTouchMove={this.onTouchMove}
          style={{ top: `${top}px`, left: `${left}px` }}
          ref={this.containerRef}
          className="video-container video-local"
        >
          {this.getVideo()}
          <SettingsBar>
            <ToggleButton
              iconClass={`fas fa-microphone${chatSettings.micMute ? '-slash' : ''}`}
              onClick={() => setChatSettings({ ...chatSettings, micMute: !chatSettings.micMute })}
              active={chatSettings.micMute ? 0 : 1}
            />
          </SettingsBar>
        </div>
      )
    }
    return (
      <div ref={this.containerRef} className="video-container video-remote">
        {this.getVideo()}
      </div>
    )
  }
}

export default VideoWindow

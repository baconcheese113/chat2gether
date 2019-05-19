import React from 'react'

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
    const { stream, videoType } = this.props
    if (stream) {
      return <video ref={this.videoRef} id={videoType} muted autoPlay />
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
    const { videoType } = this.props
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

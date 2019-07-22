import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import HtmlParse from '../helpers/htmlParse'
import VideoGrid from './VideoGrid'

const syncRotate = keyframes`
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
`

const StyledVideoPlayer = styled.div`
  display: ${props => (props.active ? 'flex' : 'none')};
  flex-direction: column;
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
  min-height: 20rem;
  min-width: 25rem;
  max-width: 90%;
  border: 2px solid #555;
  border-radius: 0.5rem;
  background-color: #111;
  transition: all 0.4s;

  & > p {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }

  & > iframe {
    align-self: center;
  }
`
const DragHandle = styled.div`
  position: absolute;
  bottom: -1.8rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  padding: 0.2rem 1rem;
  border-radius: 0 0 1rem 1rem;
  font-size: 1rem;
  background-image: linear-gradient(
    to bottom,
    ${props => props.theme.colorGreyLight1},
    ${props => props.theme.colorGreyDark2}
  );
`
const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  transform: translate(30%, -30%);
  box-shadow: 0 0 4px;
`
const SyncButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-30%, -30%);
  box-shadow: 0 0 4px;
  color: ${props => props.color};
  .rotate {
    /* position: relative; */
    color: inherit;
    transform-origin: center;
    transform-box: fill-box;
    animation: ${syncRotate} 3s linear;
  }
`
const Notification = styled.span`
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  font-size: 1.3rem;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  z-index: 10;
`

const SYNC = { OFF: 'off', REQUESTED: 'requested', UNACCEPTED: 'unaccepted', ACCEPTED: 'accepted' }

/** ******************* Component Starts */
const VideoPlayer = props => {
  const { socketHelper, roomId, userId, active, videoNotify, setVideoNotify } = props
  const [currentVideo, setCurrentVideo] = useState(null)
  const [isShown, setIsShown] = useState(false)
  const [parser, setParser] = useState(new HtmlParse(null))
  const [syncState, setSyncState] = useState(SYNC.OFF)
  const player = useRef()

  const coords = { x: window.innerWidth / 2, y: window.innerHeight / 3 }

  const onSubmitSearch = async newQuery => {
    if (!newQuery || newQuery === parser.search) return
    const newParser = new HtmlParse(newQuery)
    await newParser.parsePage()
    setParser(newParser)
  }

  const msg = {
    roomId,
    userId,
  }

  const selectVideo = videoId => {
    setCurrentVideo(videoId)
    if (syncState === SYNC.ACCEPTED) {
      msg.videoId = videoId
      msg.type = 'setVideo'
      socketHelper.emit('videoPlayerSync', msg)
    }
  }

  const receiveMessage = newMsg => {
    if (newMsg.userId === userId) return
    let newState = syncState
    // Handle other user toggling on sync
    if (newMsg.type === 'start') {
      if (syncState === SYNC.OFF) {
        newState = SYNC.UNACCEPTED
      } else if (syncState === SYNC.REQUESTED) {
        newState = SYNC.ACCEPTED
        socketHelper.emit('videoPlayerSync', { ...msg, videoId: currentVideo, type: 'setVideo' })
      }
      // Handle other user toggling off sync
    } else if (newMsg.type === 'stop') {
      if (syncState === SYNC.UNACCEPTED) {
        newState = SYNC.OFF
      } else if (syncState === SYNC.ACCEPTED) {
        newState = SYNC.REQUESTED
      }
      // Handle other user changing the video
    } else if (newMsg.type === 'setVideo' && syncState === SYNC.ACCEPTED) {
      if (!active) setVideoNotify(true)
      setCurrentVideo(newMsg.videoId)
    }
    // Notify if state was changed
    if (syncState !== newState && !active) {
      setVideoNotify(true)
    }
    setSyncState(newState)
  }

  useEffect(() => {
    if (!socketHelper) return
    socketHelper.socket.on('videoPlayerSync', receiveMessage)
    return () => {
      socketHelper.socket.off('videoPlayerSync')
    }
  }, [socketHelper, currentVideo, syncState, active])

  useEffect(() => {
    if (videoNotify && active) {
      setVideoNotify(false)
    }
  }, [active])
  const toggleSync = () => {
    let newState = syncState
    if (syncState === SYNC.OFF) {
      newState = SYNC.REQUESTED
    } else if (syncState === SYNC.REQUESTED) {
      newState = SYNC.OFF
    } else if (syncState === SYNC.UNACCEPTED) {
      newState = SYNC.ACCEPTED
    } else if (syncState === SYNC.ACCEPTED) {
      newState = SYNC.UNACCEPTED
    }
    setSyncState(newState)
    if (syncState === SYNC.OFF || syncState === SYNC.UNACCEPTED) {
      msg.type = 'start'
    } else {
      msg.type = 'stop'
    }
    socketHelper.emit('videoPlayerSync', msg)
  }

  const getColor = React.useMemo(() => {
    if (syncState === SYNC.OFF) return '#fff'
    if (syncState === SYNC.ACCEPTED) return 'green'
    return '#ffe400'
  }, [syncState])

  return (
    <React.Fragment>
      <VideoGrid
        videos={parser.videos}
        onSubmitSearch={onSubmitSearch}
        isShown={active && isShown}
        setIsShown={setIsShown}
        selectVideo={selectVideo}
      />
      <StyledVideoPlayer coords={coords} active={active}>
        <SearchButton onClick={() => setIsShown(true)}>
          <i className="fas fa-search" />
        </SearchButton>
        <SyncButton onClick={toggleSync} color={getColor}>
          {syncState === SYNC.UNACCEPTED && <Notification />}
          <i className={`fas fa-sync-alt ${syncState === SYNC.ACCEPTED ? 'rotate' : ''}`} />
        </SyncButton>
        <DragHandle>
          <i className="fas fa-grip-horizontal" />
        </DragHandle>
        {currentVideo ? (
          <iframe
            ref={player}
            title="PIP Video Player"
            src={HtmlParse.getUrl() + currentVideo}
            frameBorder="0"
            width={window.innerWidth * 0.9 - 10}
            height={window.innerWidth * 0.9 * 0.6}
            scrolling="no"
            allowFullScreen={false}
          />
        ) : (
          <p>Watch something while you wait!</p>
        )}
      </StyledVideoPlayer>
    </React.Fragment>
  )
}

export default VideoPlayer

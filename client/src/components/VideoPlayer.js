import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import HtmlParse from '../helpers/htmlParse'
import VideoGrid from './VideoGrid'

const syncRotate = keyframes`
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
`

const StyledVideoPlayer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
  min-height: 20rem;
  max-width: 90%;
  border: 2px solid #555;
  border-radius: .5rem;
  background-color: #111;
  transition: all .4s;
  /* opacity: ${props => (props.active ? 1 : 0)}; */

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
  width: 2rem;
  height: 2rem;
  z-index: 10;
`

const SYNC = { OFF: 'off', REQUESTED: 'requested', UNACCEPTED: 'unaccepted', ACCEPTED: 'accepted' }

/** ******************* Component Starts */
const VideoPlayer = props => {
  const { socketHelper, roomId, userId, active } = props
  console.log(props)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [isShown, setIsShown] = useState(false)
  const [parser, setParser] = useState(new HtmlParse(null))
  const [syncState, setSyncState] = useState(SYNC.ACCEPTED)
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

  useEffect(() => {
    if (!socketHelper) return
    socketHelper.socket.on('videoPlayerSync', newMsg => {
      if (newMsg.userId === userId) return
      console.log(newMsg)
      let newState = syncState
      if (newMsg.type === 'start') {
        if (syncState === SYNC.OFF) {
          newState = SYNC.UNACCEPTED
        } else if (syncState === SYNC.REQUESTED) {
          newState = SYNC.ACCEPTED
        }
      } else if (newMsg.type === 'stop') {
        if (syncState === SYNC.UNACCEPTED) {
          newState = SYNC.OFF
        } else if (syncState === SYNC.ACCEPTED) {
          newState = SYNC.REQUESTED
        }
      } else if (newMsg.type === 'setVideo' && syncState === SYNC.ACCEPTED) {
        setCurrentVideo(newMsg.videoId)
        console.log(`setVideo with ${newMsg.videoId}`)
      }
      setSyncState(newState)
    })
    return () => {
      socketHelper.socket.off('videoPlayerSync')
    }
  }, [socketHelper])

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
    if (syncState === SYNC.OFF || syncState === SYNC.UNACCEPTED) msg.type = 'start'
    else {
      msg.type = 'stop'
    }
    socketHelper.emit('videoPlayerSync', msg)
    setSyncState(newState)
  }

  const getColor = React.useMemo(() => {
    if (syncState === SYNC.OFF) return '#fff'
    // if (syncState === SYNC.ACCEPTED) return props.theme.colorPrimary
    return '#ffe400'
  }, [syncState])

  console.log(HtmlParse.getUrl() + currentVideo)
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
            allowFullScreen
          />
        ) : (
          <p>Watch something while you wait!</p>
        )}
      </StyledVideoPlayer>
    </React.Fragment>
  )
}

export default VideoPlayer

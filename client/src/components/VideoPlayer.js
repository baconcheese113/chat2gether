import React from 'react'
import styled, { keyframes } from 'styled-components'
import HtmlParse from '../helpers/htmlParse3'
import VideoGrid from './VideoGrid'
import { useNotify } from '../hooks/NotifyContext'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import { Button } from './common'

const syncRotate = keyframes`
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
`

const StyledVideoPlayer = styled.div`
  display: ${p => (p.active ? 'flex' : 'none')};
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #111;
  transition: all 0.4s;
`
const VideoContainer = styled.div`
  filter: ${p => p.disabled && 'brightness(40%)'};
  pointer-events: ${p => p.disabled && 'none'};
  display: flex;
  flex: 1;
  justify-content: stretch;
  align-items: stretch;
`
const EmptyStateText = styled.p`
  font-size: 2rem;
  flex: 1;
  align-self: center;
`
const Video = styled.video`
  flex: 1;
  position: absolute;
  top: ${p => p.flowDirection === 'row' && '50%'};
  bottom: ${p => p.flowDirection !== 'row' && 0};
  left: 0;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  transform: ${p => p.flowDirection === 'row' && 'translateY(-50%)'};
`
const VideoBlocker = styled.div`
  display: ${p => (p.disabled ? 'block' : 'none')};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`
const SearchButton = styled(Button)`
  position: absolute;
  left: 1rem;
  top: 1rem;
  box-shadow: 0 0 4px;
`
const SyncButton = styled(Button)`
  position: absolute;
  left: 6rem;
  top: 1rem;
  box-shadow: 0 0 4px;
  color: ${p => p.color};
  .rotate {
    color: inherit;
    transform-origin: center;
    transform-box: fill-box;
    animation: ${syncRotate} 3s linear;
  }
`

const SYNC = { OFF: 'off', REQUESTED: 'requested', UNACCEPTED: 'unaccepted', ACCEPTED: 'accepted' }
const UPDATE = { PAUSE: 'pause', PLAY: 'play', SEEKED: 'seeked' }

/** ******************* Component Starts */
export default function VideoPlayer(props) {
  const { socketHelper, roomId, userId, flowDirection } = props
  const [currentVideo, setCurrentVideo] = React.useState(null)
  const [isShown, setIsShown] = React.useState(false)
  const [parser, setParser] = React.useState(new HtmlParse(null))
  const [syncState, setSyncState] = React.useState(SYNC.OFF)
  const [videoUrl, setVideoUrl] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)

  const player = React.useRef()

  const { enabledWidgets } = useEnabledWidgets()
  const active = enabledWidgets.video
  const { videoNotify, setVideoNotify } = useNotify()

  const coords = { x: window.innerWidth / 2, y: window.innerHeight / 3 }

  // When user presses search
  const onSubmitSearch = async newQuery => {
    if (!newQuery || newQuery === parser.search) return
    const newParser = new HtmlParse(newQuery)
    await newParser.parsePage()
    setParser(newParser)
  }

  // Boilerplate socket message
  const msg = {
    roomId,
    userId,
  }

  // Selecting local video from grid
  const selectVideo = async videoId => {
    const newVideoUrl = await HtmlParse.getUrl(videoId)
    setVideoUrl(newVideoUrl)
    setCurrentVideo(videoId)
    if (syncState === SYNC.ACCEPTED) {
      msg.videoId = videoId
      msg.videoUrl = newVideoUrl
      msg.type = 'setVideo'
      socketHelper.emit('videoPlayerSync', msg)
    }
  }

  // Changing sync state when remote user clicks sync button
  const receiveSyncMsg = React.useCallback(
    newMsg => {
      if (newMsg.userId === userId) return
      let newState = syncState
      // Handle other user toggling on sync
      if (newMsg.type === 'start') {
        if (syncState === SYNC.OFF) {
          newState = SYNC.UNACCEPTED
        } else if (syncState === SYNC.REQUESTED) {
          newState = SYNC.ACCEPTED
          socketHelper.emit('videoPlayerSync', {
            ...msg,
            videoId: currentVideo,
            videoUrl,
            currentTime: player.current && player.current.currentTime,
            type: 'setVideo',
          })
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
        if (!newMsg.videoId) return
        setCurrentVideo(newMsg.videoId)
        setVideoUrl(newMsg.videoUrl)
        if (player.current && newMsg.currentTime) {
          player.current.currentTime = parseFloat(newMsg.currentTime)
        }
      }
      // Notify if state was changed
      if (syncState !== newState && !active) {
        setVideoNotify(true)
      }
      setSyncState(newState)
    },
    [active, currentVideo, msg, setVideoNotify, socketHelper, syncState, userId, videoUrl],
  )

  // Changing local player when remote user updates player
  const receiveUpdateMsg = React.useCallback(
    newMsg => {
      if (!player.current || newMsg.userId === userId || syncState !== SYNC.ACCEPTED) return
      // If other user paused the video
      if (newMsg.type === UPDATE.PAUSE) {
        player.current.pause()
        player.current.currentTime = newMsg.currentTime
      } else if (newMsg.type === UPDATE.PLAY) {
        player.current.play()
        player.current.currentTime = newMsg.currentTime
      } else if (newMsg.type === UPDATE.SEEKED) {
        player.current.currentTime = newMsg.currentTime
      } else return
      setDisabled(true)
    },
    [syncState, userId],
  )

  const handlePlayerUpdate = e => {
    if (disabled) {
      setDisabled(false)
      return
    }
    msg.type = e.type
    msg.currentTime = e.target.currentTime
    socketHelper.emit('videoPlayerUpdate', msg)
  }

  // Setting listeners for Sync and Update socket requests
  React.useEffect(() => {
    if (!socketHelper) return
    socketHelper.socket.on('videoPlayerSync', receiveSyncMsg)
    socketHelper.socket.on('videoPlayerUpdate', receiveUpdateMsg)
    return () => {
      socketHelper.socket.off('videoPlayerSync')
      socketHelper.socket.off('videoPlayerUpdate')
    }
  }, [socketHelper, currentVideo, syncState, active, receiveSyncMsg, receiveUpdateMsg])

  // Clearing the notify when player is made active
  React.useEffect(() => {
    if (videoNotify && active) {
      setVideoNotify(false)
    }
  }, [active, setVideoNotify, videoNotify])

  // Clicking the player's toggle sync button
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

  // Color for the sync button
  const getColor = React.useMemo(() => {
    if (syncState === SYNC.OFF) return '#fff'
    if (syncState === SYNC.ACCEPTED) return 'green'
    return '#ffe400'
  }, [syncState])

  const getSyncText = React.useCallback(() => {
    if (syncState === SYNC.OFF) return 'Request Sync'
    if (syncState === SYNC.REQUESTED) return 'Cancel Sync'
    if (syncState === SYNC.UNACCEPTED) return 'Accept Sync'
    return 'Synced'
  }, [syncState])

  // {syncState === SYNC.UNACCEPTED && <Notification />}
  // <i className={`fas fa-sync-alt ${syncState === SYNC.ACCEPTED ? 'rotate' : ''}`} />
  return (
    <>
      <StyledVideoPlayer coords={coords} active={active}>
        <VideoContainer disabled={disabled}>
          <VideoBlocker disabled={disabled} />
          {currentVideo ? (
            <Video
              data-cy="playerVideo"
              flowDirection={flowDirection}
              ref={player}
              onPause={handlePlayerUpdate}
              onPlay={handlePlayerUpdate}
              onSeeked={handlePlayerUpdate}
              src={videoUrl}
              autoPlay
              controls
              playsInline
              allowFullScreen={false}
            />
          ) : (
            <EmptyStateText>Click the search and sync buttons in the top left!</EmptyStateText>
          )}
          <SearchButton data-cy="playerSearchButton" onClick={() => setIsShown(true)}>
            <i className="fas fa-search" />
          </SearchButton>
          <SyncButton data-cy="playerSyncButton" onClick={toggleSync} color={getColor} label={getSyncText()} />
        </VideoContainer>
      </StyledVideoPlayer>
      <VideoGrid
        videos={parser.videos}
        onSubmitSearch={onSubmitSearch}
        isShown={active && isShown}
        setIsShown={setIsShown}
        selectVideo={selectVideo}
      />
    </>
  )
}

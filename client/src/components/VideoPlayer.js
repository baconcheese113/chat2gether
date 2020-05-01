import React from 'react'
import styled, { keyframes } from 'styled-components'
import HtmlParse from '../helpers/htmlParse3'
import { useNotify } from '../hooks/NotifyContext'
import { useEnabledWidgets } from '../hooks/EnabledWidgetsContext'
import useWindowSize from '../hooks/WindowSizeHook'
import { Button } from './common'
import VideoGrid from './VideoGrid'

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
  user-select: none;
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
const VideoControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 5px;
`
const SearchButton = styled(Button)`
  box-shadow: 0 0 4px;
  margin-left: 4px;
  min-height: 38px;
  min-width: 38px;
`
const SyncButton = styled(Button)`
  position: relative;
  margin-left: 8px;
  box-shadow: 0 0 4px;
  min-height: 38px;
  color: ${p => p.color};
  display: flex;
  justify-content: center;
`
const marquee = keyframes`
  0% { transform: translateY(0px);}
  100% { transform: translateY(-8px);}
`
const ArrowIcon = styled.i`
  position: absolute;
  top: 120%;
  font-size: 32px;
  color: white;
  animation: ${marquee} 0.8s infinite;
`
const SideToastContainer = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
`
const SideToast = styled.div`
  position: relative;
  bottom: 0;
  right: ${p => (p.showToast ? 0 : -100)}%;
  background-color: ${p => p.theme.colorPrimary};
  max-width: 80%;
  border-radius: 8px 0 0 8px;
  transition: all 0.6s;
`
const SideToastMessage = styled.p`
  font-size: 18px;
  padding: 8px 12px;
`

const SYNC = { OFF: 'off', REQUESTED: 'requested', UNACCEPTED: 'unaccepted', ACCEPTED: 'accepted' }
const UPDATE = { PAUSE: 'pause', PLAY: 'play', SEEKED: 'seeked' }

/** ******************* Component Starts */
export default function VideoPlayer(props) {
  const { socketHelper, roomId, userId } = props
  const [currentVideo, setCurrentVideo] = React.useState(null)
  const [isShown, setIsShown] = React.useState(false)
  const [parser, setParser] = React.useState(new HtmlParse(null))
  const [syncState, setSyncState] = React.useState(SYNC.OFF)
  const [videoUrl, setVideoUrl] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)
  const [showVideoSyncToast, setShowVideoSyncToast] = React.useState(false)

  const player = React.useRef()

  const { flowDirection, innerWidth, innerHeight } = useWindowSize()
  const { enabledWidgets, setEnabledWidgets } = useEnabledWidgets()
  const active = enabledWidgets.video
  const { videoNotify, setVideoNotify } = useNotify()

  const coords = { x: innerWidth / 2, y: innerHeight / 3 }

  const showHintArrow = !window.sessionStorage.getItem('tutVideoSyncButton')

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

  const tryShowingVideoSyncTutorial = React.useCallback(() => {
    if (!window.sessionStorage.getItem('tutVideoSyncRequest')) {
      setShowVideoSyncToast(true)
      setEnabledWidgets({ ...enabledWidgets, video: true })
      setTimeout(() => {
        window.sessionStorage.setItem('tutVideoSyncRequest', true)
        setShowVideoSyncToast(false)
      }, 6000)
    }
  }, [enabledWidgets, setEnabledWidgets])

  // Changing sync state when remote user clicks sync button
  const receiveSyncMsg = React.useCallback(
    newMsg => {
      if (newMsg.userId === userId) return
      let newState = syncState
      // Handle other user toggling on sync
      if (newMsg.type === 'start') {
        tryShowingVideoSyncTutorial()
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
    [active, currentVideo, msg, setVideoNotify, socketHelper, syncState, userId, videoUrl, tryShowingVideoSyncTutorial],
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
    window.sessionStorage.setItem('tutVideoSyncButton', true)
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
      <StyledVideoPlayer active={active} coords={coords}>
        <VideoContainer disabled={disabled}>
          <VideoBlocker disabled={disabled} />
          {currentVideo ? (
            <Video
              ref={player}
              autoPlay
              controls
              playsInline
              allowFullScreen={false}
              data-cy="playerVideo"
              flowDirection={flowDirection}
              src={videoUrl}
              onPause={handlePlayerUpdate}
              onPlay={handlePlayerUpdate}
              onSeeked={handlePlayerUpdate}
            />
          ) : (
            <EmptyStateText>Click the search and sync buttons in the top left!</EmptyStateText>
          )}
          <VideoControls>
            <SearchButton data-cy="playerSearchButton" onClick={() => setIsShown(true)}>
              <i className="fas fa-search" />
            </SearchButton>
            <SyncButton color={getColor} data-cy="playerSyncButton" label={getSyncText()} onClick={toggleSync}>
              {showHintArrow && <ArrowIcon className="fas fa-long-arrow-alt-up" />}
            </SyncButton>
          </VideoControls>
        </VideoContainer>
      </StyledVideoPlayer>
      <VideoGrid
        isShown={active && isShown}
        selectVideo={selectVideo}
        setIsShown={setIsShown}
        videos={parser.videos}
        onSubmitSearch={onSubmitSearch}
      />
      <SideToastContainer>
        <SideToast showToast={showVideoSyncToast}>
          <SideToastMessage>You&apos;ve received a request to watch video together!</SideToastMessage>
        </SideToast>
      </SideToastContainer>
    </>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { compose, graphql, withApollo } from 'react-apollo'
import VideoWindow from './VideoWindow'
import TextChat from './TextChat'
import { UPDATE_USER } from '../queries/mutations'
import { GET_ME, FIND_ROOM } from '../queries/queries'
import SocketHelper from '../helpers/socketHelper'
import Settings from './Settings'
import InCallNavBar from './InCallNavBar'
import VideoPlayer from './VideoPlayer'
import UserUpdateForm from './UserUpdateForm'
import Countdown from './Countdown'

// When user presses Share Video, request camera
// When user presses Next Match, Initialize socket and Find Room
// When connection is established, alert user to countdown
// Start Call
// On connection end or Find Next -> Find Room()

function ChatHub(props) {
  const [user, setUser] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [socketHelper, setSocketHelper] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [textChat, setTextChat] = useState([])
  const [connectionMsg, setConnectionMsg] = useState('Welcome to Chat2Gether')
  const [countdown, setCountdown] = useState(-1)
  const [countdownTimer, setCountdownTimer] = useState(null)
  const [widgetsActive, setWidgetsActive] = useState({ text: false, menu: false, video: false, countdown: false })
  const [countdownNotify, setCountdownNotify] = useState(false)
  const [videoNotify, setVideoNotify] = useState(false)
  const [chatSettings, setChatSettings] = useState({ micMute: false, speakerMute: false })
  const [lastReadMsg, setLastReadMsg] = useState(-1)

  const probeTimer = useRef(null)
  const room = useRef(null)

  const startCountdown = () => {
    setCountdown(5)
    // setConnectionMsg(5)
    let num = 5
    const timer = setInterval(() => {
      if (num <= 1) {
        window.clearInterval(timer)
      }
      num -= 1
      // setConnectionMsg(`${num}`)
      setCountdown(num)
    }, 1000)
    setCountdownTimer(timer)
  }

  const resetState = () => {
    console.log('reset state')
    // Clean up any existing room
    window.clearInterval(countdownTimer)
    clearTimeout(probeTimer.current)
    setRemoteStream(null)
    setTextChat([])
    room.current = null
    setOtherUser(null)
    if (socketHelper) socketHelper.leaveRooms()
  }

  // Starts socket.io up
  const initializeSocket = () => {
    const newSocketHelper = new SocketHelper()
    newSocketHelper.localStream = localStream
    newSocketHelper.onNextRoom = async roomId => {
      console.log('onNextRoom')
      if (roomId) {
        const { error } = await props.client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { visited: { connect: { id: roomId } } } },
        })
        if (error) console.error(error)
      }
      // eslint-disable-next-line no-use-before-define
      nextMatch()
    }
    newSocketHelper.onTrack = async e => {
      console.log('ontrack', e)
      clearTimeout(probeTimer.current)
      const { data, loading, error } = await props.client.mutate({
        mutation: UPDATE_USER,
        variables: { data: { isConnected: true } },
      })
      if (error) console.error(error)
      if (loading) console.log(loading)
      setUser(data.updateUser)
      console.log('ontrack dump', data.updateUser, room.current, e.streams[0])
      newSocketHelper.emit('identity', { user: data.updateUser, roomId: room.current })
      // setRemoteStream(e.streams[0])
      setTimeout(() => {
        console.log(`other user is ${otherUser}`)
        let hackyUser = null
        // Using this hack to get state from inside closure
        setOtherUser(prev => {
          hackyUser = prev
          return prev
        })
        console.log(`hackyUser is ${hackyUser}`)
        if (hackyUser) {
          setRemoteStream(e.streams[0])
        }
      }, 5000)
    }
    newSocketHelper.onIdentity = u => {
      console.log(`Chatting with ${u.id}`)
      setOtherUser(u)
      setConnectionMsg(
        `Matched with a ${u.age} year old ${u.gender.toLowerCase()}.
        Prefers ${u.audioPref.replace(/_/g, ' ').toLowerCase()}...`,
      )
      startCountdown()
    }
    newSocketHelper.onIceConnectionStateChange = e => {
      console.log(e.target.iceConnectionState)
      // setTextChat([...textChat, {comment: e.target.iceConnectionState, userId: -1}]);
    }
    newSocketHelper.onComment = e => {
      console.log(...textChat)
      setTextChat(prev => [...prev, { comment: e.text, userId: e.userId }])
    }
    newSocketHelper.updateConnectionMsg = connectMsg => {
      setConnectionMsg(connectMsg)
    }
    newSocketHelper.onDisconnect = () => {
      console.log('Disconnecting...')
      setConnectionMsg('User Disconnected')
      // newSocketHelper.pc.close()
      resetState()
    }
    newSocketHelper.initializeEvents()
    setSocketHelper(newSocketHelper)
    console.log('initialize socket')
    return newSocketHelper
  }

  const nextMatch = async () => {
    const data = { isHost: false, isConnected: false }
    if (otherUser) {
      data.visited = { connect: [{ id: otherUser.id }] }
    }

    // Clean up any existing room
    resetState()
    setConnectionMsg('Finding a match...')
    const resetUserRes = await props.client.mutate({
      mutation: UPDATE_USER,
      variables: { data },
    })
    if (resetUserRes.error) console.error(resetUserRes)

    // Start finding a room
    const d = new Date()
    d.setMinutes(d.getMinutes() - 1)
    const tempSocketHelper = await initializeSocket()
    // tempSocketHelper.leaveRooms()
    const compatibleHosts = await props.client.query({
      query: FIND_ROOM,
      variables: {
        where: {
          AND: [
            { id_not: user.id },
            { id_not_in: user.visited.map(x => x.id) },
            { gender_in: user.lookingFor.map(x => x.name) },
            { lookingFor_some: { name: user.gender } },
            { minAge_lte: user.age },
            { maxAge_gte: user.age },
            { age_lte: user.maxAge },
            { age_gte: user.minAge },
            { audioPref_in: user.accAudioPrefs.map(x => x.name) },
            { accAudioPrefs_some: { name: user.audioPref } },
            { isHost: true },
            { isConnected: false },
            { visited_none: { id: user.id } },
            { updatedAt_gt: d.toISOString() },
          ],
        },
      },
    })
    if (compatibleHosts.error) {
      console.error(compatibleHosts.error)
      return
    }
    const hosts = compatibleHosts.data.users
    console.log(hosts)

    if (hosts.length < 1) {
      setConnectionMsg('No Hosts Found')
      // Become a host
      const updateUserRes = await props.client.mutate({
        mutation: UPDATE_USER,
        variables: { data: { isHost: true } },
      })
      console.log(updateUserRes)
      const updatedUser = updateUserRes.data.updateUser
      setConnectionMsg('Waiting for matches...')
      console.log(updatedUser)
      setUser(updatedUser)
      room.current = updatedUser.id
      console.log(`FUCK WE JOINING ${updatedUser.id} BRUH`)
      tempSocketHelper.joinRoom(updatedUser.id)
    } else {
      // Join a host
      room.current = hosts[0].id
      setOtherUser(hosts[0])
      tempSocketHelper.joinRoom(hosts[0].id)
    }
  }

  useEffect(() => {
    if (connectionMsg === 'Waiting for matches...') {
      console.log('effect cleared')
      clearTimeout(probeTimer.current)
      probeTimer.current = setTimeout(() => {
        nextMatch()
      }, 60000)
    }
  }, [connectionMsg])

  // InitializeSocket needs to be called first
  const requestCamera = async (videoSource = undefined, audioSource = undefined) => {
    console.log('request camera')
    const constraints = {
      video: {
        deviceId: videoSource ? { exact: videoSource } : undefined,
        aspectRatio: { min: 0.5, max: 2 },
      },
      audio: {
        deviceId: audioSource ? { exact: audioSource } : undefined,
      },
    }
    console.log(constraints)
    // Get stream
    try {
      console.log(navigator.mediaDevices)
      // Have to stop tracks before switching on mobile
      if (localStream) localStream.getTracks().forEach(track => track.stop())
      console.log('tracks stopped')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      // If we have an existing connection
      console.log(stream)
      if (remoteStream && videoSource) {
        socketHelper.replaceTrack(stream)
      }
      setLocalStream(stream)
      const audio = stream.getAudioTracks()
      console.log(audio)
      if (audio.length > 0) {
        audio[0].enabled = !chatSettings.micMute
        console.log(`audio enabled is now ${audio[0].enabled}`)
      }
    } catch (e) {
      alert(
        "Video is required to use this app. On iOS only Safari can share video. Also make sure you're at 'https://'. If you're still receiving this error, please contact me.",
      )
      console.error(e)
    }
  }

  const getChatNav = () => {
    return (
      <div className="chat-nav">
        <button className="next-match" type="button" onClick={nextMatch}>
          Next Match
        </button>
        <button
          type="button"
          className="settings-button"
          onClick={() => setWidgetsActive({ ...widgetsActive, menu: true })}
        >
          <i className="fas fa-ellipsis-v" />
        </button>
      </div>
    )
  }

  // On mount, run through flow
  useEffect(() => {
    ;(async () => {
      const { data, error } = await props.client.query({ query: GET_ME })
      if (error) console.error(error)
      if (data.me) {
        console.log(data.me)
        setUser(data.me)
      }
      return data.me
    })()
  }, [])

  const renderBackground = () => {
    if (remoteStream) {
      return (
        <React.Fragment>
          <VideoWindow videoType="remoteVideo" stream={remoteStream} chatSettings={chatSettings} />
          <VideoWindow
            videoType="localVideo"
            stream={localStream}
            chatSettings={chatSettings}
            setChatSettings={setChatSettings}
          />
          {getChatNav()}
          {widgetsActive.text && (
            <TextChat
              user={user}
              socketHelper={socketHelper}
              room={room.current}
              textChat={textChat}
              lastReadMsg={lastReadMsg}
              setLastReadMsg={setLastReadMsg}
            />
          )}
          <VideoPlayer
            socketHelper={socketHelper}
            userId={user.id}
            roomId={room.current}
            active={widgetsActive.video}
            videoNotify={videoNotify}
            setVideoNotify={setVideoNotify}
          />
          <Countdown
            socketHelper={socketHelper}
            myUserId={user.id}
            roomId={room.current}
            countdownNotify={countdownNotify}
            setCountdownNotify={setCountdownNotify}
            active={widgetsActive.countdown}
          />
          <InCallNavBar
            nextMatch={nextMatch}
            resetState={resetState}
            setWidgetsActive={setWidgetsActive}
            widgetsActive={widgetsActive}
            textNotify={textChat.length - (lastReadMsg + 1)}
            countdownNotify={countdownNotify}
            videoNotify={videoNotify}
            chatSettings={chatSettings}
            setChatSettings={setChatSettings}
            localStream={localStream}
            buttons={{ stop: true, mic: true, speaker: true, countdown: true, chat: true, video: true }}
          />
        </React.Fragment>
      )
    }
    if (!localStream) {
      return (
        <div className="video-connecting">
          <button type="button" onClick={() => requestCamera()}>
            Share Video to Begin
          </button>
        </div>
      )
    }
    return (
      <React.Fragment>
        <div className="video-connecting">
          {getChatNav()}
          <p className="connecting-text">{connectionMsg}</p>
          <VideoWindow
            videoType="localVideo"
            stream={localStream}
            chatSettings={chatSettings}
            setChatSettings={setChatSettings}
          />
          {countdown > 0 && <div className="countdown">{countdown}</div>}
          <UserUpdateForm
            user={user}
            setUser={newUser => {
              setUser(newUser)
              if (room.current) nextMatch()
            }}
          />
          <InCallNavBar
            nextMatch={nextMatch}
            resetState={resetState}
            setWidgetsActive={setWidgetsActive}
            widgetsActive={widgetsActive}
            chatSettings={chatSettings}
            setChatSettings={setChatSettings}
            localStream={localStream}
            buttons={{ stop: true, mic: true, speaker: true }}
          />
        </div>
      </React.Fragment>
    )
  }

  return (
    <div>
      {renderBackground()}
      {widgetsActive.menu && (
        <Settings setWidgetsActive={setWidgetsActive} requestCamera={requestCamera} stream={localStream} />
      )}
    </div>
  )
}

export default compose(graphql(GET_ME, { name: 'GET_ME' }))(withApollo(ChatHub))

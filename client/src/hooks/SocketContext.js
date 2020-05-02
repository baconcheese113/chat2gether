import React from 'react'
import { useApolloClient } from '@apollo/client'
import SocketHelper from '../helpers/socketHelper'
import { UPDATE_USER, DISCONNECT_MATCH, CREATE_MATCH } from '../queries/mutations'
import { FIND_ROOM } from '../queries/queries'
import PrefMatcher from '../components/PrefMatcher'
import AirPlaneDing from '../assets/air-plane-ding.mp3'
import { useMyUser } from './MyUserContext'
import { useEnabledWidgets } from './EnabledWidgetsContext'

const WELCOME = process.env.REACT_APP_WELCOME_MESSAGE

const SocketContext = React.createContext()
export function useSocket() {
  return React.useContext(SocketContext)
}

// ¯\_(ツ)_/¯
let nextMatch

export default function SocketProvider(props) {
  const { children } = props

  const [otherUser, setOtherUser] = React.useState(null)
  const [connectionMsg, setConnectionMsg] = React.useState(`Welcome to Chat2Gether${WELCOME ? `\n${WELCOME}` : ''}`)
  const [remoteStream, setRemoteStream] = React.useState(null)
  const [canNextMatch, setCanNextMatch] = React.useState(true)
  const [matchCountdown, setMatchCountdown] = React.useState(-1)

  const socketHelper = React.useRef()
  const matchTimer = React.useRef(null)
  const probeTimer = React.useRef(null)
  const room = React.useRef(null)
  const matchId = React.useRef(null)

  const { user, getMe } = useMyUser()
  const client = useApolloClient()
  const { setEnabledWidgets } = useEnabledWidgets()

  const resetSocket = React.useCallback(() => {
    console.log('reset socket')
    // Clean up any existing room
    window.clearInterval(matchTimer.current)
    window.clearTimeout(probeTimer.current)
    setRemoteStream(null)
    // setTextChat([])
    room.current = null
    matchId.current = null
    setOtherUser(null)
    setMatchCountdown(-1)
    if (socketHelper.current && socketHelper.current.leaveRooms) socketHelper.current.leaveRooms()
  }, [])

  const startCountdown = React.useCallback(() => {
    setMatchCountdown(8)
    let num = 8
    const timer = setInterval(() => {
      if (num <= 1) {
        window.clearInterval(timer)
        if (socketHelper.current) setRemoteStream(socketHelper.current.remoteStream)
      }
      num -= 1
      setMatchCountdown(num)
    }, 1000)
    matchTimer.current = timer
  }, [])

  const onIdentity = React.useCallback(
    async u => {
      try {
        // Have to fix on iOS safari first
        const isIOS =
          (/iPad|iPhone|iPod/.test(navigator.platform) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
          !window.MSStream
        if (!isIOS && !window.safari) {
          new Audio(AirPlaneDing).play()
        }
      } catch (err) {
        console.error(`can't play this shit`, err)
      }
      console.log('I am ', user)
      console.log(`Chatting with ${u.id}`, u)
      setOtherUser(u)
      setConnectionMsg(
        <PrefMatcher
          myAccPrefs={user.accAudioPrefs.map(lf => lf.name)}
          myAge={user.age}
          myGender={user.gender}
          myPref={user.audioPref}
          theirAccPrefs={u.accAudioPrefs.map(lf => lf.name)}
          theirAge={u.age}
          theirGender={u.gender}
          theirPref={u.audioPref}
        />,
      )
      if (user.id === room.current) {
        // if we're in our own room then we're the host
        const { data } = await client.mutate({
          mutation: CREATE_MATCH,
          variables: { data: { otherUserId: u.id } },
        })
        matchId.current = data.createMatch.id
        console.log(`I'm the host and matchId is ${matchId.current}`)
        socketHelper.current.emit('matchId', { matchId: matchId.current, roomId: room.current, userId: user.id })
      }
      startCountdown()
      setEnabledWidgets(enabledWidgets => ({ video: enabledWidgets.video, localVideo: true }))
    },
    [client, setEnabledWidgets, startCountdown, user],
  )

  const onMatchId = React.useCallback(mId => {
    if (!matchId.current) {
      matchId.current = mId
    }
  }, [])

  const endCall = React.useCallback(
    async type => {
      const disconnectPayload = {
        mutation: DISCONNECT_MATCH,
        variables: { data: { id: matchId.current, type } },
        errorPolicy: 'all',
      }
      // If refreshing, we don't want to await anything, just fire and forget
      if (type === 'REFRESH') {
        if (matchId.current) client.mutate(disconnectPayload)
        return
      }
      if (matchId.current) {
        console.log('Ending call')
        await client.mutate(disconnectPayload)
      }
      if (socketHelper.current) {
        await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { isHost: false, isConnected: false } },
        })
        resetSocket()
        await getMe()
      }
    },
    [client, getMe, resetSocket],
  )

  // Starts socket.io up
  const initializeSocket = React.useCallback(
    localStream => {
      socketHelper.current = new SocketHelper()
      socketHelper.current.localStream = localStream
      socketHelper.current.onNextRoom = nextMatch
      socketHelper.current.socket.on('identity', onIdentity)
      socketHelper.current.socket.on('matchId', onMatchId)
      socketHelper.current.onIceConnectionStateChange = async e => {
        console.log('iceconnectionstatechange', e.target.iceConnectionState, e)
        if (e.target.iceConnectionState === 'checking') {
          clearTimeout(probeTimer.current)
          const { loading, error } = await client.mutate({
            mutation: UPDATE_USER,
            variables: { data: { isConnected: true } },
          })
          if (error) console.error('error', error)
          if (loading) console.log('loading', loading)
          const updatedUser = await getMe()
          socketHelper.current.emit('identity', { user: updatedUser, roomId: room.current })
        }
        // if (e.target.iceConnectionState !== 'connected') return
      }
      socketHelper.current.updateConnectionMsg = connectMsg => {
        setConnectionMsg(connectMsg)
      }
      socketHelper.current.onDisconnect = () => {
        setConnectionMsg('User Disconnected')
        endCall('REFRESH')
        resetSocket()
      }
      socketHelper.current.initializeEvents()
    },
    [client, endCall, getMe, onIdentity, onMatchId, resetSocket],
  )

  nextMatch = React.useCallback(
    async localStream => {
      if (!canNextMatch) return
      setCanNextMatch(false)
      if (matchId.current) {
        await client.mutate({
          mutation: DISCONNECT_MATCH,
          variables: { data: { id: matchId.current, type: 'NEXT_MATCH' } },
        })
      }

      // Clean up any existing room
      resetSocket()
      setConnectionMsg('Finding a match...')
      const resetUserRes = await client.mutate({
        mutation: UPDATE_USER,
        variables: { data: { isHost: false, isConnected: false } },
      })
      if (resetUserRes.error) console.error(resetUserRes)
      let updatedUser = await getMe()

      // Start finding a room
      const d = new Date()
      d.setMinutes(d.getMinutes() - 0.25)
      initializeSocket(localStream)
      // if (socketHelper) {
      //   console.log('Could have used cached socketHelper', tempSocketHelper)
      // }
      const compatibleHost = await client.query({ query: FIND_ROOM, fetchPolicy: 'network-only', errorPolicy: 'all' })
      if (compatibleHost.errors) {
        setCanNextMatch(true)
        console.log(compatibleHost.errors)
        setConnectionMsg(compatibleHost.errors[0].message)
        return
      }
      const host = compatibleHost.data.findRoom

      if (!host) {
        setConnectionMsg('No Hosts Found')
        // Become a host
        await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { isHost: true } },
        })
        updatedUser = await getMe()
        setConnectionMsg('Waiting for matches...')
        room.current = updatedUser.id
        console.log(`No match, creating my room with id ${updatedUser.id}`)
        socketHelper.current.joinRoom(updatedUser.id)
      } else {
        // Join a host
        console.log(`Match found, joining ${host.id}`)
        room.current = host.id
        setOtherUser(host)
        socketHelper.current.joinRoom(host.id)
      }
      setCanNextMatch(true)
    },
    [canNextMatch, client, getMe, initializeSocket, resetSocket],
  )

  // Repeat search functionality
  React.useEffect(() => {
    if (connectionMsg === 'Waiting for matches...' && !otherUser) {
      clearTimeout(probeTimer.current)
      probeTimer.current = setTimeout(() => {
        if (socketHelper.current) {
          nextMatch(socketHelper.current.localStream)
        }
      }, 15000)
    }
  }, [connectionMsg, otherUser])

  return (
    <SocketContext.Provider
      value={{
        socketHelper: socketHelper.current,
        connectionMsg,
        remoteStream,
        endCall,
        nextMatch,
        canNextMatch,
        roomId: room.current,
        resetSocket,
        matchCountdown,
        otherUser,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

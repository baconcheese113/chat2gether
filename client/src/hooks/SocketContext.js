import React from 'react'
import { useApolloClient } from '@apollo/client'
import SocketHelper from '../helpers/socketHelper'
import { UPDATE_USER } from '../queries/mutations'
import { FIND_ROOM } from '../queries/queries'
import { useMyUser } from './MyUserContext'
import PrefMatcher from '../components/PrefMatcher'
import AirPlaneDing from '../assets/air-plane-ding.mp3'
import { useEnabledWidgets } from './EnabledWidgetsContext'

const SocketContext = React.createContext()
export function useSocket() {
  return React.useContext(SocketContext)
}

// ¯\_(ツ)_/¯
let nextMatch

export default function SocketProvider(props) {
  const { children } = props

  const [socketHelper, setSocketHelper] = React.useState()
  const [otherUser, setOtherUser] = React.useState(null)
  const [connectionMsg, setConnectionMsg] = React.useState('Welcome to Chat2Gether')
  const [remoteStream, setRemoteStream] = React.useState(null)
  const [canNextMatch, setCanNextMatch] = React.useState(true)
  const [matchCountdown, setMatchCountdown] = React.useState(-1)

  const matchTimer = React.useRef(null)
  const probeTimer = React.useRef(null)
  const room = React.useRef(null)

  const { user, getMe } = useMyUser()
  const client = useApolloClient()
  const { setEnabledWidgets } = useEnabledWidgets()

  const resetSocket = React.useCallback(() => {
    console.log('reset state')
    // Clean up any existing room
    window.clearInterval(matchTimer)
    clearTimeout(probeTimer.current)
    setRemoteStream(null)
    // setTextChat([])
    room.current = null
    setOtherUser(null)
    if (socketHelper && socketHelper.leaveRooms) socketHelper.leaveRooms()
  }, [socketHelper])

  const startCountdown = React.useCallback(() => {
    setMatchCountdown(8)
    let num = 8
    const timer = setInterval(() => {
      if (num <= 1) {
        window.clearInterval(timer)
      }
      num -= 1
      setMatchCountdown(num)
    }, 1000)
    matchTimer.current = timer
  }, [])

  const onNextRoom = React.useCallback(
    async (roomId, localStream) => {
      console.log('onNextRoom with localStream', localStream)
      if (roomId) {
        const { error } = await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { visited: { connect: { id: roomId } } } },
        })
        if (error) console.error(error)
      }
      nextMatch(localStream)
    },
    [client],
  )

  const onIdentity = React.useCallback(
    u => {
      try {
        // Have to fix on iOS safari first
        const isIOS =
          (/iPad|iPhone|iPod/.test(navigator.platform) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
          !window.MSStream
        if (!isIOS) {
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
          myPref={user.audioPref}
          myAccPrefs={user.accAudioPrefs.map(lf => lf.name)}
          myAge={user.age}
          myGender={user.gender}
          theirPref={u.audioPref}
          theirAccPrefs={u.accAudioPrefs.map(lf => lf.name)}
          theirAge={u.age}
          theirGender={u.gender}
        />,
      )
      startCountdown()
      setEnabledWidgets({ localVideo: true })
    },
    [setEnabledWidgets, startCountdown, user],
  )

  // Starts socket.io up
  const initializeSocket = React.useCallback(
    localStream => {
      const newSocketHelper = new SocketHelper()
      newSocketHelper.localStream = localStream
      newSocketHelper.onNextRoom = onNextRoom
      newSocketHelper.onTrack = async e => {
        console.log('ontrack', e)
        clearTimeout(probeTimer.current)
        const { loading, error } = await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { isConnected: true } },
        })
        if (error) console.error(error)
        if (loading) console.log(loading)
        const updatedUser = await getMe()
        console.log('ontrack dump', updatedUser, room.current, e.streams[0])
        newSocketHelper.emit('identity', { user: updatedUser, roomId: room.current })

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
        }, 8000)
      }
      newSocketHelper.onIdentity = onIdentity
      newSocketHelper.onIceConnectionStateChange = e => {
        console.log(e.target.iceConnectionState)
      }
      newSocketHelper.updateConnectionMsg = connectMsg => {
        setConnectionMsg(connectMsg)
      }
      newSocketHelper.onDisconnect = () => {
        console.log('Disconnecting...')
        setConnectionMsg('User Disconnected')
        // newSocketHelper.pc.close()
        resetSocket()
      }
      newSocketHelper.initializeEvents()
      setSocketHelper(newSocketHelper)
      console.log('initialize socket')
      return newSocketHelper
    },
    [client, getMe, onIdentity, onNextRoom, otherUser, resetSocket],
  )

  const endCall = React.useCallback(async () => {
    const data = { isHost: false, isConnected: false }
    if (otherUser) {
      console.log('Ending call with', otherUser)
      data.visited = { connect: [{ id: otherUser.id }] }
    }

    resetSocket()
    await client.mutate({
      mutation: UPDATE_USER,
      variables: { data },
    })
    await getMe()
  }, [client, getMe, otherUser, resetSocket])

  nextMatch = React.useCallback(
    async localStream => {
      console.log('in nextMatch with ', user)
      if (!canNextMatch) return
      setCanNextMatch(false)
      const data = { isHost: false, isConnected: false }
      if (otherUser) {
        data.visited = { connect: [{ id: otherUser.id }] }
      }

      // Clean up any existing room
      resetSocket()
      setConnectionMsg('Finding a match...')
      const resetUserRes = await client.mutate({
        mutation: UPDATE_USER,
        variables: { data },
      })
      if (resetUserRes.error) console.error(resetUserRes)
      let updatedUser = await getMe()

      // Start finding a room
      const d = new Date()
      d.setMinutes(d.getMinutes() - 0.25)
      const tempSocketHelper = await initializeSocket(localStream)
      if (socketHelper) {
        console.log('Could have used cached socketHelper', tempSocketHelper)
      }
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
        tempSocketHelper.joinRoom(updatedUser.id)
      } else {
        // Join a host
        console.log(`Match found, joining ${host.id}`)
        room.current = host.id
        setOtherUser(host)
        tempSocketHelper.joinRoom(host.id)
      }
      setCanNextMatch(true)
    },
    [canNextMatch, client, getMe, initializeSocket, otherUser, resetSocket, socketHelper, user],
  )

  // Repeat search functionality
  React.useEffect(() => {
    if (connectionMsg === 'Waiting for matches...' && !otherUser) {
      console.log('effect cleared')
      clearTimeout(probeTimer.current)
      probeTimer.current = setTimeout(() => {
        if (socketHelper) {
          nextMatch(socketHelper.localStream)
        }
      }, 15000)
    }
  }, [connectionMsg, otherUser, socketHelper])

  return (
    <SocketContext.Provider
      value={{
        socketHelper,
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

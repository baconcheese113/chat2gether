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
let initializeSocket
let nextMatch

export default function SocketProvider(props) {
  const { children } = props

  const [socketHelper, setSocketHelper] = React.useState({})
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
  console.log('SocketProvider render')

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

  const startCountdown = () => {
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
  }

  const onNextRoom = React.useCallback(
    async (roomId, localStream) => {
      console.log('onNextRoom')
      if (roomId) {
        const { error } = await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { visited: { connect: { id: roomId } } } },
        })
        if (error) console.error(error)
      }
      // eslint-disable-next-line no-use-before-define
      nextMatch(localStream)
    },
    // eslint-disable-next-line no-use-before-define
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
      console.log(`Chatting with ${u.id}`)
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
    [setEnabledWidgets, user.accAudioPrefs, user.age, user.audioPref, user.gender],
  )

  // Starts socket.io up
  // eslint-disable-next-line prefer-const
  initializeSocket = React.useCallback(
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
      // tempSocketHelper.leaveRooms()
      const compatibleHosts = await client.query({
        query: FIND_ROOM,
        variables: {
          where: {
            AND: [
              { id_not: updatedUser.id },
              { id_not_in: updatedUser.visited ? updatedUser.visited.map(x => x.id) : [] },
              { gender_in: updatedUser.lookingFor.map(x => x.name) },
              { lookingFor_some: { name: updatedUser.gender } },
              { minAge_lte: updatedUser.age },
              { maxAge_gte: updatedUser.age },
              { age_lte: updatedUser.maxAge },
              { age_gte: updatedUser.minAge },
              { audioPref_in: updatedUser.accAudioPrefs.map(x => x.name) },
              { accAudioPrefs_some: { name: updatedUser.audioPref } },
              { isHost: true },
              { isConnected: false },
              { visited_none: { id: updatedUser.id } },
              { updatedAt_gt: d.toISOString() },
            ],
          },
        },
      })
      if (compatibleHosts.error) {
        setCanNextMatch(true)
        console.error(compatibleHosts.error)
        return
      }
      const hosts = compatibleHosts.data.users
      console.log(hosts)

      if (hosts.length < 1) {
        setConnectionMsg('No Hosts Found')
        // Become a host
        const updateUserRes = await client.mutate({
          mutation: UPDATE_USER,
          variables: { data: { isHost: true } },
        })
        console.log('updateUserRes is ', updateUserRes)
        updatedUser = await getMe()
        setConnectionMsg('Waiting for matches...')
        room.current = updatedUser.id
        console.log(`FUCK WE JOINING ${updatedUser.id} BRUH`)
        tempSocketHelper.joinRoom(updatedUser.id)
      } else {
        // Join a host
        room.current = hosts[0].id
        setOtherUser(hosts[0])
        tempSocketHelper.joinRoom(hosts[0].id)
      }
      setCanNextMatch(true)
    },
    [canNextMatch, client, getMe, otherUser, resetSocket, user],
  )

  React.useEffect(() => {
    if (connectionMsg === 'Waiting for matches...' && !otherUser) {
      console.log('effect cleared')
      clearTimeout(probeTimer.current)
      probeTimer.current = setTimeout(() => {
        nextMatch(socketHelper.localStream)
      }, 15000)
    }
  }, [connectionMsg, otherUser, socketHelper.localStream])

  return (
    <SocketContext.Provider
      value={{
        socketHelper,
        connectionMsg,
        remoteStream,
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

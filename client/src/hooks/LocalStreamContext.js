import React from 'react'
import { useEnabledWidgets } from './EnabledWidgetsContext'
import { useSocket } from './SocketContext'

const LocalStreamContext = React.createContext({ localStream: null, requestDevices: () => {} })
export function useLocalStream() {
  return React.useContext(LocalStreamContext)
}

export const LocalStreamProvider = props => {
  const { children } = props
  const [localStream, setLocalStream] = React.useState(null)
  const [inEfficiencyMode, setInEfficiencyMode] = React.useState(false)

  const { chatSettings } = useEnabledWidgets()
  const { remoteStream, socketHelper } = useSocket()

  React.useEffect(() => {
    console.log(`localStream changed to `, localStream)
  }, [localStream])

  const determineEfficiencyMode = React.useCallback(
    async inCall => {
      const videoTracks = localStream && localStream.getVideoTracks()
      if (!videoTracks || !videoTracks.length) {
        setInEfficiencyMode(false)
        return
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const rear = allDevices.find(d => d.kind === 'videoinput' && d.label.match(/back/i))
      const front = allDevices.find(d => d.kind === 'videoinput' && d.label.match(/front/i))
      const onMobile = rear && front
      if (!onMobile) {
        setInEfficiencyMode(false)
        return
      }

      const videoConstraints = videoTracks[0].getConstraints()
      if (inCall && videoConstraints.frameRate === 1) {
        videoConstraints.frameRate = 30
      } else if (!inCall && videoConstraints.frameRate !== 1) {
        videoConstraints.frameRate = 1
      }
      videoTracks[0].applyConstraints(videoConstraints)
      setInEfficiencyMode(videoConstraints.frameRate === 1)
    },
    [localStream],
  )

  // InitializeSocket needs to be called first
  const requestDevices = React.useCallback(
    async ({ videoSource, audioSource }) => {
      const constraints = {
        video: {
          deviceId: videoSource ? { exact: videoSource } : undefined,
          aspectRatio: { min: 0.5, max: 2 },
          frameRate: inEfficiencyMode ? 1 : 30,
        },
        audio: {
          deviceId: audioSource ? { exact: audioSource } : undefined,
        },
      }
      // Get stream
      try {
        // Have to stop tracks before switching on mobile
        if (localStream) localStream.getTracks().forEach(track => track.stop())
        console.log('tracks stopped')
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        // If we have an existing connection
        console.log('stream', stream)
        // TODO: pull in socketHelper
        if (remoteStream && videoSource) {
          socketHelper.replaceTrack(stream)
        }
        setLocalStream(stream)
        const audio = stream.getAudioTracks()
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
    },
    [chatSettings.micMute, inEfficiencyMode, localStream, remoteStream, socketHelper],
  )

  return (
    <LocalStreamContext.Provider value={{ localStream, requestDevices, determineEfficiencyMode, inEfficiencyMode }}>
      {children}
    </LocalStreamContext.Provider>
  )
}

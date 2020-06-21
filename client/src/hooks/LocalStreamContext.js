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

  const { chatSettings } = useEnabledWidgets()
  const { remoteStream, socketHelper } = useSocket()

  React.useEffect(() => {
    console.log(`localStream changed to `, localStream)
  }, [localStream])

  // InitializeSocket needs to be called first
  const requestDevices = React.useCallback(
    async (videoSource = undefined, audioSource = undefined) => {
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
      console.log('constraints', constraints)
      // Get stream
      try {
        console.log(navigator.mediaDevices)
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
    [chatSettings.micMute, localStream, remoteStream, socketHelper],
  )

  return <LocalStreamContext.Provider value={{ localStream, requestDevices }}>{children}</LocalStreamContext.Provider>
}

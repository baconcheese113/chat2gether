import io from 'socket.io-client'

export default class SocketHelper {
  constructor() {
    this.socket = io()
    // this.socket.emit('create or join');
    this.pc = null
    this.localStream = null
    this.remoteStream = null
    this.isCaller = false
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.l.google.com:19302' },
        /* turn here */
      ],
    }
    // this.initializeEvents();
  }

  // Functions to overwrite

  onTrack = e => e

  onIceConnectionStateChange = e => e

  onComment = e => e

  updateConnectionMsg = connectionMsg => connectionMsg

  onNextRoom = userId => userId

  onDisconnect = () => {}

  onIdentity = user => user

  /**
   * General Flow
   *
   * User hits page, calls 'create or join' which checks the number of clients connected.
   * User1 creates room. Sets up camera
   * User2 joins room. Sets up camera, emits 'ready'
   * User1 receives 'ready'. Creates PC, sets ICE, adds localStream track, sets local desc, emits new offer.
   * User2 receives 'offer'. Creates PC, sets ICE, adds localStream track, sets local desc, emits new answer, sets remote desc.
   * User1 receives 'answer'. Sets remote desc.
   *
   * Candidates are sent by both users throughout process.
   */
  initializeEvents = () => {
    this.socket.on('created', () => {
      console.log('created')
      this.isCaller = true
      this.updateConnectionMsg('Waiting for users that meet your criteria...')
    })
    this.socket.on('joined', roomId => {
      // await setupCamera();
      console.log('joined')
      this.updateConnectionMsg('Connecting to your match...')
      this.roomId = roomId
      this.socket.emit('ready', roomId)
    })
    this.socket.on('full room', roomId => {
      console.log(`full room at ${roomId}`)
      this.updateConnectionMsg('Room full, finding next...')
      this.onNextRoom(null, this.localStream)
    })
    this.socket.on('disconnect', () => {
      console.log('disconnect')
      // this.pc.close()
      this.onDisconnect()
      this.socket.disconnect(true)
    })

    // Called each time a candidate is received, executes on both users
    const onIceCandidate = e => {
      console.log('on ice candidate')
      if (e.candidate) {
        // console.log(e.candidate);
        this.socket.emit('candidate', {
          type: 'candidate',
          label: e.candidate.sdpMLineIndex,
          id: e.candidate.sdpMid,
          candidate: e.candidate.candidate,
          roomId: this.roomId,
        })
      }
    }

    // This code is called from ready and offer, once per user
    const createPC = () => {
      this.pc = new RTCPeerConnection(this.iceServers)
      this.pc.onicecandidate = onIceCandidate
      this.pc.ontrack = e => {
        console.log('ontrack', e)
        this.updateConnectionMsg('Connection complete')
        this.onTrack(e)
      }
      this.pc.oniceconnectionstatechange = e => {
        this.onIceConnectionStateChange(e)
      }
      this.pc.onnegotiationneeded = async e => {
        console.log(`negotiation needed for`, e)
        // await this.pc.createOffer(setLocalAndOffer, err => console.error(err))
      }
      // if (this.pc.addStream) {
      //   console.log('addStream')
      //   this.pc.addStream(this.localStream)
      // } else {
      console.log('addTracks')
      // Recommended implementation since addStream is obsolete
      this.localStream.getTracks().forEach(track => {
        console.log('track gotten', track)
        this.pc.addTrack(track, this.localStream)
      })
      // }
    }

    // Set Local description and emit offer
    const setLocalAndOffer = sessionDesc => {
      console.log('setLocalAndOffer', sessionDesc)
      this.pc.setLocalDescription(sessionDesc)
      this.socket.emit('offer', {
        type: 'offer',
        sdp: sessionDesc,
        roomId: this.roomId,
      })
    }

    // Ready called after 2nd user joins, only 1st user executes this
    this.socket.on('ready', async () => {
      if (this.isCaller) {
        console.log('on ready')
        createPC()
        try {
          // await this.pc.createOffer(setLocalAndOffer, e => console.error(e))
          const offer = await this.pc.createOffer()
          setLocalAndOffer(offer)
        } catch (e) {
          console.error(e)
        }
        console.log('local rtc established')
      }
    })

    const setLocalAndAnswer = sessionDesc => {
      console.log('setLocalAndAnswer', sessionDesc)
      this.pc.setLocalDescription(sessionDesc)
      this.socket.emit('answer', {
        type: 'answer',
        sdp: sessionDesc,
        roomId: this.roomId,
      })
    }
    // Offer emitted by 1st user, only 2nd user executes this and emits the answer
    this.socket.on('offer', async desc => {
      if (!this.isCaller) {
        console.log('on offer')
        createPC()
        console.log(desc)
        try {
          await this.pc.setRemoteDescription(new RTCSessionDescription(desc))
          console.log('set remote description')
          // await this.pc.createAnswer(setLocalAndAnswer, e => console.log(e))
          const answer = await this.pc.createAnswer()
          setLocalAndAnswer(answer)
        } catch (e) {
          console.error(e)
        }
      } else {
        console.log('offer received by user 1', desc)
      }
    })

    // Answer emitted by 2nd user, only 1st user executes this which triggers ontrack
    this.socket.on('answer', e => {
      console.log('on answer')
      this.pc.setRemoteDescription(new RTCSessionDescription(e))
    })

    // Both users execute this when a candidate is chosen
    this.socket.on('candidate', e => {
      console.log('on candidate')
      this.pc.addIceCandidate(
        new RTCIceCandidate({
          sdpMLineIndex: e.label,
          candidate: e.candidate,
        }),
      )
    })

    // Other non-setup functions
    this.socket.on('identity', this.onIdentity)
  }

  leaveRooms() {
    this.socket.disconnect()
  }

  // Helper function for creating and joining a specific room
  joinRoom(roomId) {
    this.socket.emit('create or join', roomId)
    console.log(`socketHelper getting started with ${roomId}`)
    this.roomId = roomId
  }

  emit(title, msg) {
    this.socket.emit(title, msg)
  }

  async replaceTrack(newStream) {
    console.log('switching tracks')
    const videoTracks = newStream.getVideoTracks()
    const audioTracks = newStream.getAudioTracks()
    if (videoTracks && videoTracks[0]) {
      const sender = this.pc.getSenders().find(s => s.track.kind === videoTracks[0].kind)
      console.log('found video sender', sender)
      await sender.replaceTrack(videoTracks[0])
    }
    if (audioTracks && audioTracks[0]) {
      const sender = this.pc.getSenders().find(s => s.track.kind === audioTracks[0].kind)
      console.log('found audio sender', sender)
      await sender.replaceTrack(audioTracks[0])
    }
  }
}

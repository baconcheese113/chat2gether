import io from 'socket.io-client'

class SocketHelper {
  constructor() {
    this.socket = io()
    // this.socket.emit('create or join');
    this.pc = null
    this.localStream = null
    this.remoteStream = null
    this.isCaller = false
    this.iceServers = {
      iceServers: [{ url: 'stun:stun.services.mozilla.com' }, { url: 'stun:stun.l.google.com:19302' }],
    }
    // this.initializeEvents();
  }

  // Functions to overwrite
  // onTrack = (e) => {};
  // onIceConnectionStateChange = (e) => {};
  // onComment = e => {};
  // updateConnectionMsg = connectionMsg => {};
  // onNextRoom = userId => {};
  // onDisconnect = () => {};
  // onIdentity = user => {};

  onTrack = () => {}

  onIceConnectionStateChange = () => {}

  onComment = () => {}

  updateConnectionMsg = () => {}

  onNextRoom = () => {}

  onDisconnect = () => {}

  onIdentity = () => {}

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
      this.onNextRoom(null)
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
        console.log('ontrack')
        this.updateConnectionMsg('Connection complete')
        this.onTrack(e)
      }
      this.pc.oniceconnectionstatechange = e => {
        this.onIceConnectionStateChange(e)
      }
      this.pc.addStream(this.localStream)
    }

    // Set Local description and emit offer
    const setLocalAndOffer = sessionDesc => {
      console.log(sessionDesc)
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
        await this.pc.createOffer(setLocalAndOffer, e => console.error(e))
        console.log('local rtc established')
      }
    })

    const setLocalAndAnswer = sessionDesc => {
      console.log(sessionDesc)
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
        await this.pc.setRemoteDescription(new RTCSessionDescription(desc))
        await this.pc.createAnswer(setLocalAndAnswer, e => console.log(e))
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
    this.socket.on('comment', this.onComment)
    this.socket.on('identity', this.onIdentity)
  }

  leaveRooms() {
    this.socket.disconnect(true)
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
}

export default SocketHelper

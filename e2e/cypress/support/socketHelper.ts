//@ts-ignore
import io from 'socket.io-client';

interface ISocketHelper {
  initializeSocket: () => Promise<void>;
  emit: (label: string, data: string | number | Object) => void;
}

interface User {
  id: string;
}

export default class SocketHelper implements ISocketHelper {
  public socket: any;
  public mediaStream: MediaStream;
  public roomId: string = '';
  public user: User = { id: '' };

  constructor(mediaStream: MediaStream) {
    this.socket = io();
    this.mediaStream = mediaStream;
  }

  public async initializeSocket() {
    this.socket.on('ready', async (roomId: string) => {
      this.roomId = roomId;
      const pc = new RTCPeerConnection();

      this.mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, this.mediaStream);
      });

      pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          this.emit('candidate', {
            type: 'candidate',
            label: e.candidate.sdpMLineIndex,
            id: e.candidate.sdpMid,
            candidate: e.candidate.candidate,
            roomId
          });
        }
      };

      pc.ontrack = async (e: RTCTrackEvent) => {
        console.log('their user is', this.user);
        this.emit('identity', { user: this.user, roomId });
      };

      const offer = await pc.createOffer();
      pc.setLocalDescription(offer);
      this.emit('offer', {
        type: 'offer',
        sdp: offer,
        roomId
      });

      this.socket.on('answer', (e: RTCSessionDescriptionInit) => {
        pc.setRemoteDescription(new RTCSessionDescription(e));
      });

      this.socket.on('candidate', (e: { label: number; candidate: string }) => {
        pc.addIceCandidate(
          new RTCIceCandidate({
            sdpMLineIndex: e.label,
            candidate: e.candidate
          })
        );
      });
    });
  }

  public emit(label: string, data: string | number | Object) {
    console.log(this.user.id, ' is emitting ', label, ' -> ', data);
    this.socket.emit(label, data);
  }

  public sendComment(text: string) {
    this.emit('send', {
      text,
      userId: this.user.id,
      roomId: this.roomId
    });
  }

  public sendPlayerSync(type: string) {
    this.emit('videoPlayerSync', {
      type,
      userId: this.user.id,
      roomId: this.roomId
    });
  }

  /**
   * Perform html video element function where currentTime is in seconds
   */
  public sendPlayerUpdate(partial: { type: 'play' | 'pause' | 'seeked'; currentTime: number }) {
    this.emit('videoPlayerUpdate', {
      ...partial,
      userId: this.user.id,
      roomId: this.roomId
    });
  }

  public sendCountdownUpdate(type: 'requestedCountdown' | 'startedCountdown' | 'cancelledCountdown') {
    this.emit('countdown', {
      type,
      userId: this.user.id,
      roomId: this.roomId
    });
  }
}

//@ts-ignore
import io from 'socket.io-client';

interface ISocketHelper {
  initializeSocket: () => Promise<void>;
  emit: (label: string, data: string | number | Object) => void;
}

export default class SocketHelper implements ISocketHelper {
  public socket: any;
  public mediaStream: MediaStream;
  public roomId: string = '';
  public userId: string = '';

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
        const updateQuery = `
          mutation UpdateUserMutation($data: UserUpdateInput!) {
            updateUser(data: $data) {
              id
              gender
              age
              lookingFor {
                name
              }
              minAge
              maxAge
              audioPref
              accAudioPrefs {
                name
              }
            }
          }
        `;
        const updateVars = {
          data: {
            isConnected: true
          }
        };
        const res = await fetch('/graphql', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: updateQuery, variables: updateVars }),
          method: 'POST'
        });
        const { data } = await res.json();
        this.emit('identity', { user: data.updateUser, roomId });
        this.userId = data.updateUser.id;
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
    this.socket.emit(label, data);
  }

  public sendComment(text: string) {
    this.emit('send', {
      userId: this.userId,
      text,
      roomId: this.roomId
    });
  }
}

//@ts-ignore
import io from 'socket.io-client';

describe('matchmaking_spec', function() {
  let theirSocket = io();
  let theirStream: MediaStream;

  before(() => {
    cy.clearCookies();

    const query = `
      mutation CreateUserMutation($data: CreateUserInput!) {
      createUser(data: $data) {
        id
      }
    }`;
    const variables = {
      data: {
        gender: 'F2M',
        lookingFor: {
          connect: [{ name: 'F2M' }, { name: 'M2F' }]
        },
        age: 50,
        minAge: 40,
        maxAge: 60,
        audioPref: 'CONVERSATION',
        accAudioPrefs: {
          connect: [{ name: 'CONVERSATION' }, { name: 'CHAT_FIRST' }]
        }
      }
    };
    cy.request({
      log: true,
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      body: { query, variables }
    });

    cy.window().then(async win => {
      theirStream = await win.navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: 1, height: 500, width: 500 },
        audio: true
      });
      // expect(theirStream.getVideoTracks()[0]).to.have.property('label', 'fake_device_0');
    });

    theirSocket.on('created', () => {
      console.log('theirSocket created');
    });
    theirSocket.on('ready', async (roomId: string) => {
      console.log('theirSocket ready', roomId);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.services.mozilla.com' },
          { urls: 'stun:stun.l.google.com:19302' }
          /* turn here */
        ]
      });
      pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          theirSocket.emit('candidate', {
            type: 'candidate',
            label: e.candidate.sdpMLineIndex,
            id: e.candidate.sdpMid,
            candidate: e.candidate.candidate,
            roomId
          });
        }
      };
      pc.ontrack = async (e: RTCTrackEvent) => {
        // User is technically connected here
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
        const res = await fetch('http://localhost:3000/graphql', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: updateQuery, variables: updateVars }),
          method: 'POST'
        });
        const { data } = await res.json();
        theirSocket.emit('identity', { user: data.updateUser, roomId });
      };
      theirStream.getTracks().forEach(track => {
        pc.addTrack(track, theirStream);
      });

      const offer = await pc.createOffer();
      console.log('OFFERING', offer, pc);
      pc.setLocalDescription(offer);
      theirSocket.emit('offer', {
        type: 'offer',
        sdp: offer,
        roomId
      });

      theirSocket.on('answer', (e: RTCSessionDescriptionInit) => {
        pc.setRemoteDescription(new RTCSessionDescription(e));
      });
      theirSocket.on('candidate', (e: { label: number; candidate: string }) => {
        pc.addIceCandidate(
          new RTCIceCandidate({
            sdpMLineIndex: e.label,
            candidate: e.candidate
          })
        );
      });
    });

    cy.visit('/');
    cy.dataCy('shareVideoButton').click();
  });

  it("doesn't match with incompatible users", function() {
    cy.getCookie('token').then(token => {
      expect(token).to.exist;
      if (!token) return;

      const createQuery = `
      mutation CreateUserMutation($data: CreateUserInput!) {
      createUser(data: $data) {
        id
      }
    }`;
      const createVars = {
        data: {
          gender: 'M2F',
          lookingFor: {
            connect: [{ name: 'F2M' }, { name: 'M2F' }]
          },
          age: 50,
          minAge: 40,
          maxAge: 60,
          audioPref: 'CONVERSATION',
          accAudioPrefs: {
            connect: [{ name: 'CONVERSATION' }, { name: 'CHAT_FIRST' }]
          }
        }
      };
      cy.request({
        url: 'http://localhost:4000/graphql',
        method: 'POST',
        body: { query: createQuery, variables: createVars }
      });

      const updateQuery = `
        mutation UpdateUserMutation($data: UserUpdateInput!) {
          updateUser(data: $data) {
            id
          }
        }
      `;
      const updateVars = {
        data: {
          isHost: true
        }
      };
      cy.request({
        log: true,
        url: 'http://localhost:4000/graphql',
        method: 'POST',
        body: { query: updateQuery, variables: updateVars }
      }).then(data => {
        const [resp] = data.allRequestResponses;
        const { updateUser } = resp['Response Body'].data;
        console.log('resp is', updateUser.id);
        theirSocket.emit('create or join', updateUser.id);
      });

      cy.getCookie('token').then(newToken => console.log('newToken', newToken));
      cy.setCookie('token', token.value);
    });

    // cy.pause();
    cy.server()
      .route('POST', '/graphql')
      .as('graphql');

    cy.dataCy('nextMatchButton')
      .click()
      .wait('@graphql'); // connection countdown length
    cy.contains(/connection complete/i).should('exist');

    cy.get('[data-cy=remoteVideo]', { timeout: 15000 }).should('exist');

    cy.dataCy('navCommentButton').click();
  });
});

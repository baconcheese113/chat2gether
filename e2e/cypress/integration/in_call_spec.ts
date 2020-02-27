//@ts-ignore
import SocketHelper from '../support/socketHelper';

describe('in_call_spec', function() {
  let theirSocketHelper: SocketHelper;

  before(() => {
    cy.clearCookies();

    // Create my user
    cy.createUser({});

    // Get their user's stream/socket
    cy.window().then(async win => {
      const mediaStream = await win.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      theirSocketHelper = new SocketHelper(mediaStream);
      await theirSocketHelper.initializeSocket();
    });

    cy.visit('/');
    cy.dataCy('shareVideoButton').click();

    // Create their user and have them try to join
    cy.getCookie('token').then(token => {
      expect(token).to.exist;
      if (!token) return;

      cy.createUser({ gender: 'M2F', lookingFor: { connect: [{ name: 'F2M' }] } });
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses;
        const { updateUser } = resp['Response Body'].data;
        console.log('resp is', updateUser.id);
        theirSocketHelper.emit('create or join', updateUser.id);
      });

      cy.getCookie('token').then(newToken => console.log('newToken', newToken));
      cy.setCookie('token', token.value);
    });

    // Next match and go in-call
    cy.server()
      .route('POST', '/graphql')
      .as('graphql');

    cy.dataCy('nextMatchButton')
      .click()
      .wait('@graphql'); // connection countdown length
    cy.contains(/connection complete/i).should('exist');

    cy.get('[data-cy=remoteVideo]', { timeout: 15000 }).should('exist');
  });

  it('Uses comment widget send/recieve and notifications', function() {
    theirSocketHelper.sendComment('I guess you have some Bukowski to depart?');
    cy.dataCy('navCommentButton').click();
    cy.dataCy('commentInput')
      .type('you can’t beat death but{enter}', { delay: 30 })
      .type('you can beat death in life, sometimes.{enter}', { delay: 30 })
      .type('and the more often you learn to do it,{enter}', { delay: 30 })
      .type('the more light there will be.{enter}', { delay: 30 });
  });

  it('Uses profile widget', function() {
    cy.dataCy('navProfileButton')
      .click()
      .wait(1000);
  });

  it('Uses countdown widget', function() {
    cy.dataCy('navCountdownButton')
      .click()
      .wait(1000);
  });

  it('Uses video player widget', function() {
    cy.dataCy('navPlayerButton')
      .click()
      .wait(1000);
  });
});

// @ts-ignore
import SocketHelper from '../support/socketHelper'

describe('in_call_spec', function () {
  let theirSocketHelper: SocketHelper
  let myToken: Cypress.Cookie | null

  before(() => {
    cy.clearCookies()

    // Create my user
    cy.createUser({})
    cy.getCookie('token').then(t => {
      myToken = t
    })
    // expect(myToken).to.haveOwnProperty('value');

    // Get their user's stream/socket
    cy.window().then(async win => {
      const mediaStream = await win.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      theirSocketHelper = new SocketHelper(mediaStream)
      await theirSocketHelper.initializeSocket()
    })

    cy.visit('/')
    cy.dataCy('shareVideoButton').click()

    // Create their user and have them try to join

    cy.clearCookies()

    cy.createUser({ gender: 'M2F', lookingFor: { connect: [{ name: 'F2M' }] } })
    cy.updateUser({ isHost: true }).then(data => {
      const [resp] = data.allRequestResponses
      const { updateUser } = resp['Response Body'].data
      console.log('resp is', updateUser.id)
      theirSocketHelper.user = updateUser
      theirSocketHelper.emit('create or join', updateUser.id)
    })

    cy.getCookie('token').then(() => {
      if (!myToken) throw new Error()
      cy.setCookie('token', myToken.value)
    })

    // Next match and go in-call
    cy.server().route('POST', '/graphql').as('graphql')

    cy.dataCy('nextMatchButton').click().wait('@graphql') // connection countdown length
    cy.contains(/connection complete/i, { timeout: 10000 }).should('exist')

    cy.get('[data-cy=remoteVideo]', { timeout: 15000 }).should('exist')
  })

  after(() => {
    theirSocketHelper.socket.close()
  })

  it('Uses comment widget send/recieve and notifications', function () {
    cy.window().then(() => {
      theirSocketHelper.sendComment('I guess you have some Bukowski to depart?')
    })
    cy.dataCy('navCommentButton').should('contain.text', '1').wait(1000).click()
    cy.dataCy('commentInput')
      .type('you can’t beat death but{enter}', { delay: 30 })
      .type('you can beat death in life, sometimes.{enter}', { delay: 30 })
      .type('and the more often you learn to do it,{enter}', { delay: 30 })
      .type('the more light there will be.{enter}', { delay: 30 })
      .wait(300)
    cy.window().then(() => {
      theirSocketHelper.sendComment('That was beautiful, gahhhh')
    })
    cy.contains(/that was beautiful/i).wait(300)
    cy.dataCy('navCommentButton').click()
  })

  it('Uses profile widget', function () {
    cy.dataCy('navProfileButton').click()
    // Make sure their gender is correct, if so the others should be correct
    cy.dataCy('profileGender').contains(/m2f/i).should('exist').wait(1000)
    cy.dataCy('navProfileButton').click()
  })

  it('Uses countdown widget', function () {
    cy.window().then(() => {
      theirSocketHelper.sendCountdownUpdate('requestedCountdown')
    })
    cy.dataCy('navCountdownButton').should('contain.text', '1').click().wait(1000)
    cy.dataCy('countdownStartButton').click()
    cy.dataCy('countdownText').contains(/go/i, { timeout: 20000 }).should('exist')
    cy.dataCy('countdownCancelButton').click()
    cy.wait(1000)
    cy.dataCy('navCountdownButton').click()
  })

  it('Uses video player widget', function () {
    cy.dataCy('navPlayerButton').click()
    cy.window().then(() => {
      theirSocketHelper.sendPlayerSync('start')
    })
    // No longer needed since video player defaults open
    // cy.dataCy('navPlayerButton').should('contain.text', '1').click().wait(1000)
    cy.dataCy('playerSyncButton').should('contain.text', 'Accept Sync').click().should('contain.text', 'Synced')

    cy.dataCy('navMicButton').click()
    cy.dataCy('navSpeakerButton').click() // Stop feedback from playing video

    cy.dataCy('playerSearchButton').click()
    cy.dataCy('playerSearchInput').type('spongebob')
    cy.dataCy('playerSearchSubmit').click()
    cy.dataCy('playerSearchResult').first().click()
    cy.get('[data-cy=playerVideo]', { timeout: 15000 })
      .as('video')
      .then(() => {
        theirSocketHelper.sendPlayerUpdate({ type: 'seeked', currentTime: 60 })
      })
      .wait(1000)
      .get('@video')
      .then(video => {
        const videoEl = video.get(0) as HTMLVideoElement
        videoEl.muted = true
        console.log('playback rate is ', videoEl.playbackRate)
        expect(videoEl.currentTime).to.be.greaterThan(59)
        theirSocketHelper.sendPlayerUpdate({ type: 'pause', currentTime: 80 })
      })
      .wait(1000)
      .get('@video')
      .then(video => {
        const videoEl = video.get(0) as HTMLVideoElement
        videoEl.muted = true
        console.log('playback rate is ', videoEl.playbackRate)
        // expect(videoEl.playbackRate).to.equal(0);
        expect(videoEl.currentTime).to.be.greaterThan(79)
        theirSocketHelper.sendPlayerUpdate({ type: 'play', currentTime: 100 })
      })
      .wait(1000)
      .get('@video')
      .then(video => {
        const videoEl = video.get(0) as HTMLVideoElement
        videoEl.muted = true
        console.log('playback rate is ', videoEl.playbackRate)
        expect(videoEl.playbackRate).to.equal(1)
        expect(videoEl.currentTime).to.be.greaterThan(99)
      })

    cy.dataCy('navPlayerButton').click()
    cy.dataCy('navStopButton').click().wait(2000)
  })
})

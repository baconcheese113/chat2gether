// @ts-ignore
import SocketHelper from '../support/socketHelper'

describe('matchmaking_spec', function () {
  let theirSocketHelper: SocketHelper

  before(() => {
    cy.clearCookies()
    Cypress.Cookies.preserveOnce('token')

    // Create my user
    cy.createUser({})

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
  })

  it("doesn't match with users I don't want", function () {
    // Create their user and have them try to join
    cy.getCookie('token').then(token => {
      expect(token).to.exist
      if (!token) return

      cy.createUser({ gender: 'MALE' })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.createUser({ age: 20 })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.createUser({ audioPref: 'NO_AUDIO' })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.getCookie('token')
      cy.setCookie('token', token.value)
    })

    // Next match and go in-call
    cy.server().route('POST', '/graphql').as('graphql')

    cy.dataCy('nextMatchButton').click().wait('@graphql') // connection countdown length
    cy.contains(/no hosts found/i, { timeout: 6000 }).should('exist')

    Cypress.Cookies.preserveOnce('token')
  })

  after(() => {
    theirSocketHelper.socket.close()
  })

  it("doesn't match with users that don't want me", function () {
    // Create their user and have them try to join
    cy.getCookie('token').then(token => {
      expect(token).to.exist
      if (!token) return

      cy.createUser({ lookingFor: { connect: [{ name: 'MALE' }, { name: 'FEMALE' }] } })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.createUser({ minAge: 20, maxAge: 49 })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.createUser({ accAudioPrefs: { connect: [{ name: 'NO_AUDIO' }, { name: 'CHAT_FIRST' }] } })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.getCookie('token')
      cy.setCookie('token', token.value)
    })

    // Next match and go in-call
    cy.server().route('POST', '/graphql').as('graphql')

    cy.dataCy('nextMatchButton').click().wait('@graphql') // connection countdown length
    cy.contains(/no hosts found/i, { timeout: 6000 }).should('exist')

    Cypress.Cookies.preserveOnce('token')
  })

  it('matches with a compatible user', function () {
    cy.getCookie('token').then(token => {
      expect(token).to.exist
      if (!token) return

      cy.createUser({ gender: 'M2F', lookingFor: { connect: [{ name: 'F2M' }] } })
      cy.updateUser({ isHost: true }).then(data => {
        const [resp] = data.allRequestResponses
        const { updateUser } = resp['Response Body'].data
        console.log('resp is', updateUser.id)
        theirSocketHelper.user = updateUser
        theirSocketHelper.emit('create or join', updateUser.id)
      })

      cy.getCookie('token').then(newToken => console.log('newToken', newToken))
      cy.setCookie('token', token.value)
    })

    // Next match and go in-call
    cy.server().route('POST', '/graphql').as('graphql')

    cy.dataCy('nextMatchButton').click().wait('@graphql') // connection countdown length
    cy.contains(/connection complete/i, { timeout: 6000 }).should('exist')
    cy.wait(8000)

    cy.get('[data-cy=remoteVideo]', { timeout: 15000 }).should('exist')
    cy.dataCy('navStopButton').click().wait(2000)
  })
})

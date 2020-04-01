describe('chat_hub_spec', function () {
  before(() => {
    cy.clearCookies()

    const query = `
      mutation CreateUserMutation($data: CreateUserInput!) {
      createUser(data: $data) {
        id
      }
    }`
    const variables = {
      data: {
        gender: 'F2M',
        lookingFor: {
          connect: [{ name: 'F2M' }, { name: 'M2F' }],
        },
        age: 50,
        minAge: 40,
        maxAge: 60,
        audioPref: 'CONVERSATION',
        accAudioPrefs: {
          connect: [{ name: 'CONVERSATION' }, { name: 'CHAT_FIRST' }],
        },
      },
    }
    cy.request({
      log: true,
      url: 'http://localhost:4000/graphql',
      method: 'POST',
      body: { query, variables },
    })

    cy.visit('/')
  })

  it('Widgets behave correctly', function () {
    cy.getCookie('token').should('have.property', 'value')

    cy.dataCy('shareVideoButton').click()
    cy.server().route('POST', '/graphql').as('graphql')

    // Update user widget
    cy.dataCy('navUpdateUserButton').click()
    cy.dataCy('applyChangesButton').should('be.disabled')
    cy.dataCy('theirGenderPicker', '[data-cy="picker-active"]').should('have.length', 2)
    cy.dataCy('theirAgeSlider').should('contain.text', 40).should('contain.text', 60)
    cy.dataCy('myAudioSlider').contains('CONVERSATION').invoke('attr', 'data-cy').should('contain', 'slider-active')
    cy.dataCy('theirAudioPicker').scrollIntoView({ duration: 500 })
    cy.dataCy('theirAudioPicker', '[data-cy="picker-active"]').should('have.length', 2)

    // Try changing and resetting
    cy.dataCy('theirAudioPicker').contains('CONVERSATION').as('conversation').click()
    cy.dataCy('applyChangesButton').should('be.enabled').wait(500)
    cy.get('@conversation').click()
    cy.dataCy('applyChangesButton').should('be.disabled')
    cy.get('@conversation').click()
    cy.dataCy('applyChangesButton').should('be.enabled').click()
    // .should('be.disabled'); //TODO Fix this

    // Stats widget
    cy.dataCy('navStatsButton').click().wait('@graphql')
    cy.dataCy('timeSelect').click()
    cy.contains('1 Hour').click()
    cy.dataCy('timeSelect').click()
    cy.contains('6 Hours').click()
    cy.dataCy('timeSelect').click()
    cy.contains('1 Day').click()
    cy.dataCy('timeSelect').click()
    cy.contains('6 Days').click()
    cy.dataCy('timeSelect').click()
    cy.contains('1 Month').click()

    // Matches widget
    cy.dataCy('navMatchesButton').click()
    cy.contains(/No Matches Yet/i)
  })
})

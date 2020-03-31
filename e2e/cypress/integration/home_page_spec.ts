describe('home_page_spec', function () {
  before(() => {
    cy.clearCookies()
    cy.visit('/')
  })

  it('Uses UI to adjust sliders and submit form', function () {
    cy.dataCy('myGenderSlider').contains('F2M').click()

    cy.dataCy('theirGenderPicker')
      .as('theirGenderPicker')
      .contains('MALE')
      .click()
      .get('@theirGenderPicker')
      .contains('FEMALE')
      .click()

    cy.dataCy('myAgeSlider', '[data-index="0"]')
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 500, clientY: 0 })
      .trigger('mouseup')

    cy.dataCy('theirAgeSlider', '[data-index="0"]')
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400, clientY: 0 })
      .trigger('mouseup')

    cy.dataCy('theirAgeSlider', '[data-index="1"]')
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 600, clientY: 0 })
      .trigger('mouseup')

    cy.dataCy('myAudioSlider').contains('CONVERSATION').click()

    cy.dataCy('theirAudioPicker')
      .as('theirAudioPicker')
      .contains('NO AUDIO')
      .click()
      .get('@theirAudioPicker')
      .contains('MOANS')
      .click()

    cy.server()
    cy.route('POST', '/graphql').as('gql')
    cy.dataCy('startButton').click()
    cy.wait('@gql')

    cy.getCookie('token').should('have.property', 'value')
  })
})

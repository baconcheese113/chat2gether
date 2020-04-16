import './commands'

// Fail-fast-all-files
before(function () {
  cy.getCookie('has-failed-test').then(cookie => {
    if (cookie && typeof cookie === 'object' && cookie.value === 'true') {
      const cypress: any = Cypress
      cypress.runner.stop()
    }
  })
})

// Fail-fast-single-file
afterEach(function () {
  if (this.currentTest && this.currentTest.state === 'failed') {
    cy.setCookie('has-failed-test', 'true')
    const cypress: any = Cypress
    cypress.runner.stop()
  }
})

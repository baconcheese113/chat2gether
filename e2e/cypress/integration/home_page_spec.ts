describe('home_page_spec', function() {
  before(() => {
    cy.clearCookies();
    cy.visit('/');
  });

  it('Uses UI to adjust sliders and submit form', function() {
    cy.dataCy('myGenderSlider').should('have.length', 4);
    console.log(Cypress.config(), Cypress.config().supportFile);
  });
});

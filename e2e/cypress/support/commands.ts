Cypress.Commands.add('dataCy', (dataCy: string, selector?: string) => {
  const operatorRegex = /^[\~\^\$\*]/;
  const operatorModifierArr = operatorRegex.exec(dataCy) || [''];
  const dataCyStripped = dataCy.replace(operatorRegex, '');
  const dataCySelector = `[data-cy${operatorModifierArr[0]}="${dataCyStripped}"]`;
  if (!selector) {
    return cy.get(dataCySelector);
  }

  const selectorIsPsuedo = selector.startsWith(':');
  const joinChar = selectorIsPsuedo ? '' : ' ';
  const dataCyWithSelector = [dataCySelector, selector].join(joinChar);
  return cy.get(dataCyWithSelector);
});

declare namespace Cypress {
  interface Chainable {
    dataCy<E extends Node = HTMLElement>(dataCy: string, selector?: string): Chainable<JQuery<E>>;
  }
}

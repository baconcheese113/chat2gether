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

type Gender = 'F2M' | 'M2F' | 'MALE' | 'FEMALE';
type AudioPref = 'NO_AUDIO' | 'CONVERSATION' | 'CHAT_FIRST';
interface User {
  gender: string;
  lookingFor: { connect: { name: Gender }[] };
  age: number;
  minAge: number;
  maxAge: number;
  audioPref: AudioPref;
  accAudioPrefs: { connect: { name: AudioPref }[] };
  isHost: boolean;
  isConnected: boolean;
}

Cypress.Commands.add('createUser', (userPartial: Partial<User>) => {
  const query = `
    mutation CreateUserMutation($data: CreateUserInput!) {
      createUser(data: $data) {
        id
      }
    }
  `;
  const defaultVars = {
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
  };
  const variables = { data: { ...defaultVars, ...userPartial } };
  return cy.request({
    log: true,
    url: '/graphql',
    method: 'POST',
    body: { query, variables }
  });
});

Cypress.Commands.add('updateUser', (userPartial: Partial<User>) => {
  const query = `
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
  const variables = { data: userPartial };

  return cy.request({
    log: true,
    url: '/graphql',
    method: 'POST',
    body: { query, variables }
  });
});

declare namespace Cypress {
  interface Chainable {
    dataCy<E extends Node = HTMLElement>(dataCy: string, selector?: string): Chainable<JQuery<E>>;
    /**
     * Create a user (will send back a token and overwrite any existing token), pass in a partial to customize beyond the defaults
     */
    createUser(userPartial: Partial<User>): Chainable<Cypress.Response>;
    /**
     * Update a user (uses the current token), pass in a partial to customize beyond the defaults
     */
    updateUser(userPartial: Partial<User>): Chainable<Cypress.Response>;
  }
}

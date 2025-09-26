import 'cypress-data-session'

const getToken = (): Cypress.Chainable<string> =>
  cy
    .api({
      method: 'GET',
      url: '/auth/fake-token'
    })
    .its('body.token')

const maybeGetToken = (sessionName: string): Cypress.Chainable<string> =>
  cy.dataSession({
    name: sessionName,
    validate: (): true => true,
    setup: () => getToken(),
    // setup: getToken
    // functional programmimg: when calling a function with mo arguments
    shareAcrossSpecs: true
  })
Cypress.Commands.add('maybeGetToken', maybeGetToken)

// https://docs.cypress.io/api/introduction/api.html

// Cypress.Cookies.debug(true);
describe('Login Succesfull', () => {
  it('visits the app root url', () => {
    cy.session('test', () => {
      cy.visit('http://localhost:4173');
      cy.wait(2000);
      cy.origin('http://keycloak:8080', () => {
        cy.contains('h1', 'Bei Ihrem Konto anmelden');
        cy.get('input[name=username]').type('test_superuser@example.com');
        cy.get('input[name=password]').type('Test123!').type('{enter}'); // '{enter}' submits the form
      });
      cy.get('.def-headline').contains('Auftragsübersicht');
    });
  });
});

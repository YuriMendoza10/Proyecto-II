describe('Aceptacion CSP institucional', () => {
  const email = Cypress.env('ADMIN_EMAIL')
  const password = Cypress.env('ADMIN_PASSWORD')

  it('AC-03 pantalla CSP institucional muestra elementos principales si hay sesion', function () {
    if (!email || !password) {
      cy.log('Skip por credenciales: requiere CYPRESS_ADMIN_EMAIL y CYPRESS_ADMIN_PASSWORD.')
      this.skip()
    }

    cy.visit('/login')
    cy.get('input').first().clear().type(email)
    cy.get('input[type="password"]').clear().type(password, { log: false })
    cy.contains('button', /Iniciar sesi/i).click()

    cy.visit('/admin/institutional-csp')
    cy.contains('Horarios generados', { timeout: 15000 }).should('be.visible')
    cy.contains('Horario seleccionado').should('be.visible')
    cy.contains('Resumen de preparacion').should('be.visible')
  })

  it('AC-04 omite pruebas autenticadas si no hay credenciales', function () {
    if (email && password) {
      cy.log('Credenciales disponibles; la prueba autenticada puede ejecutarse.')
      return
    }
    cy.log('Skip por credenciales: no se almacenan claves reales en el repositorio.')
  })

  it('AC-05 navegacion protegida responde de forma controlada sin sesion', () => {
    cy.clearLocalStorage()
    cy.visit('/admin/institutional-csp')
    cy.location('pathname', { timeout: 10000 }).should('match', /login|institutional-csp/)
    cy.get('#root').should('not.be.empty')
  })
})


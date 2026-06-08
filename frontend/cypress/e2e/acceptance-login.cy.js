describe('Aceptacion login OptiAcademic', () => {
  it('AC-01 login carga correctamente', () => {
    cy.visit('/login')
    cy.contains(/OptiAcademic|Sistema inteligente/i).should('be.visible')
    cy.get('input').should('have.length.at.least', 2)
    cy.contains('button', /Iniciar sesi/i).should('be.visible')
  })

  it('AC-02 login invalido no permite acceso', () => {
    cy.visit('/login')
    cy.get('input').first().clear().type('no-existe@example.com')
    cy.get('input[type="password"]').clear().type('clave-invalida')
    cy.contains('button', /Iniciar sesi/i).click()
    cy.location('pathname', { timeout: 8000 }).should('include', '/login')
  })
})


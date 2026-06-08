import { expect, test } from '@playwright/test'

/* global process */

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test('E2E-05 login no muestra pantalla blanca', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText(/Sistema inteligente/i)).toBeVisible()
})

test('E2E-06 rutas administrativas cargan con sesion valida', async ({ page }) => {
  test.skip(!email || !password, 'Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para validar navegacion autenticada.')

  await page.goto('/login')
  await page.getByLabel(/Correo electronico|Correo electr/i).fill(email)
  await page.getByLabel(/Contrase/i).fill(password)
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()

  for (const path of ['/admin/executive-dashboard', '/admin/reports/sustainability', '/admin/institutional-csp']) {
    await page.goto(path)
    await expect(page.locator('#root')).not.toBeEmpty()
  }
})

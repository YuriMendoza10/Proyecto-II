import { expect, test } from '@playwright/test'

/* global process */

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test('E2E-04 reporte de sostenibilidad carga con sesion valida', async ({ page }) => {
  test.skip(!email || !password, 'Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para validar rutas autenticadas.')

  await page.goto('/login')
  await page.getByLabel(/Correo electronico|Correo electr/i).fill(email)
  await page.getByLabel(/Contrase/i).fill(password)
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()

  await page.goto('/admin/reports/sustainability')

  await expect(page.getByText(/Funcionalidad mas usada/i)).toBeVisible()
  await expect(page.getByText(/CO2 estimado|CO₂ estimado/i)).toBeVisible()
  await expect(page.getByText(/Solicitudes/i)).toBeVisible()
  await expect(page.getByText(/Tiempo promedio/i)).toBeVisible()
  await expect(page.getByText(/Datos transferidos/i)).toBeVisible()
})

import { expect, test } from '@playwright/test'

/* global process */

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test('E2E-07 login carga antes de validar CSP institucional', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /OptiAcademic/i })).toBeVisible()
})

test('E2E-08 login invalido no permite acceder al CSP institucional', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/Correo electronico|Correo electr/i).fill('no-existe@example.com')
  await page.getByLabel(/Contrase/i).fill('credencial-invalida')
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()
  await expect(page).toHaveURL(/\/login/)
})

test('E2E-09 CSP institucional muestra listado de horarios generados con sesion admin', async ({ page }) => {
  test.skip(!email || !password, 'Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para validar CSP autenticado.')

  await page.goto('/login')
  await page.getByLabel(/Correo electronico|Correo electr/i).fill(email)
  await page.getByLabel(/Contrase/i).fill(password)
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()

  await page.goto('/admin/institutional-csp')

  await expect(page.getByText('Horarios generados')).toBeVisible()
  await expect(page.getByText('Horario seleccionado')).toBeVisible()
  await expect(page.getByText('Resumen de preparacion')).toBeVisible()
  await expect(page.getByPlaceholder(/2026-I/i)).toBeVisible()
  await expect(page.getByText('Cargar horario')).toBeVisible()
  await expect(page.getByText('Ver bloques')).toBeVisible()
})


import { expect, test } from '@playwright/test'

test('E2E-01 login carga correctamente', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /OptiAcademic/i })).toBeVisible()
  await expect(page.getByLabel(/Correo electronico|Correo electr/i)).toBeVisible()
  await expect(page.getByLabel(/Contrase/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Iniciar sesi/i })).toBeVisible()
})

test('E2E-02 login invalido no permite acceso', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/Correo electronico|Correo electr/i).fill('no-existe@example.com')
  await page.getByLabel(/Contrase/i).fill('credencial-invalida')
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()

  await expect(page).toHaveURL(/\/login/)
})

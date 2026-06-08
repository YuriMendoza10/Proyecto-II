import { expect, test } from '@playwright/test'

test('E2E-03 modo claro oscuro se puede cambiar en login', async ({ page }) => {
  await page.goto('/login')

  const toggle = page.getByRole('button', { name: /Cambiar a modo oscuro|Cambiar a modo claro/i })
  await expect(toggle).toBeVisible()

  await toggle.click()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

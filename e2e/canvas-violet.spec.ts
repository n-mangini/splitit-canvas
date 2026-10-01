// Ybug #7 · SPLT-canvas · botón activo del viewport en violeta

import { test, expect } from '@playwright/test'

test('botón activo del viewport usa violeta (#8B5CF6), no verde', async ({ page }) => {
  await page.goto('/canvas')

  // Hacer clic en "Desktop" para que quede activo
  await page.getByRole('button', { name: 'Desktop' }).click()

  // El botón activo debe tener background violeta
  const activeBg = await page.getByRole('button', { name: 'Desktop' }).evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  )
  expect(activeBg).toBe('rgb(139, 92, 246)')

  // El botón inactivo NO debe tener ese background
  const inactiveBg = await page.getByRole('button', { name: 'Mobile' }).evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  )
  expect(inactiveBg).not.toBe('rgb(139, 92, 246)')
})

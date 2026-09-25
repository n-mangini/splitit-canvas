import { expect, test } from '@playwright/test'

// SPLT-001 — Login / acceso.
// Bug: el botón primario tiene h-10 (40 px), por debajo del mínimo táctil
// recomendado de 44 px (Apple HIG). En mobile resulta difícil presionarlo.
test('el botón primario de login tiene al menos 44 px de alto', async ({ page }) => {
  await page.goto('/login')

  const boton = page.getByRole('button', { name: 'Ingresar' })
  await expect(boton).toBeVisible()

  const box = await boton.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

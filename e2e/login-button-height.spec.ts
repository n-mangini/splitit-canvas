import { expect, test } from '@playwright/test'

// SPLT-002 — Iniciar sesión.
// Bug: el botón de submit de login tenía h-10 (40px), por debajo del mínimo táctil de 44px.
test('el botón de login tiene altura suficiente para uso en mobile (>=44px)', async ({ page }) => {
  await page.goto('/login')

  const boton = page.getByRole('button', { name: 'Ingresar' })
  await expect(boton).toBeVisible()

  const box = await boton.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

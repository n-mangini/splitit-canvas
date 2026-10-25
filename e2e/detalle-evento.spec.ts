import { expect, test } from '@playwright/test'

// SPLT-007 — Ver el detalle de un evento.
// Test de referencia: el agente de QA copia este estilo al sumar el de cada bug.
test('el detalle muestra el evento y sus secciones', async ({ page }) => {
  await page.goto('/events/event-1')

  await expect(page.getByRole('heading', { level: 1, name: 'Juntada Asado' })).toBeVisible()
  await expect(page.getByText('Asado del sabado en casa de Nicolas')).toBeVisible()
  for (const seccion of ['Gastos', 'Saldos', 'Integrantes']) {
    await expect(page.getByRole('button', { name: seccion, exact: true })).toBeVisible()
  }
})

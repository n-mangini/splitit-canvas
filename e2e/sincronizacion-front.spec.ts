import { expect, test } from '@playwright/test'

const TOKEN = 'r7Qk2Vx9mLpZ4tHnCwB3sd'

// SPLT-022 — Acceder al evento sin cuenta.
test('el invitado elige quién es y entra solo a su evento', async ({ page }) => {
  await page.goto(`/eventos/invitacion/${TOKEN}?escenario=sin-sesion`)

  await page.getByRole('button', { name: 'Continuar sin cuenta' }).click()
  await page.getByLabel('¿Quién sos en este evento?').selectOption({ label: 'Francisco' })
  await page.getByRole('button', { name: 'Entrar como invitado' }).click()

  await expect(page).toHaveURL(/\/eventos\/1$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Juntada Asado' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver a eventos' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Editar gasto/ })).toHaveCount(0)
})

// SPLT-022 — sin integrantes libres no se puede entrar sin cuenta.
test('sin integrantes libres el invitado no puede entrar', async ({ page }) => {
  await page.goto(
    `/eventos/invitacion/${TOKEN}?escenario=sin-sesion,sin-integrantes&paso=quien-sos`
  )
  await expect(page.getByText('Todos los integrantes ya tienen una cuenta.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar como invitado' })).toBeDisabled()
})

// SPLT-019 — Ingresar con Google.
test('ingresar con Google lleva a Mis eventos', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continuar con Google' }).click()
  await expect(page).toHaveURL(/\/eventos$/)
})

// SPLT-019 — email que ya tiene cuenta con contraseña.
test('Google con una cuenta existente pregunta si vincular o reemplazar', async ({ page }) => {
  await page.goto('/login?escenario=cuenta-existente')
  await page.getByRole('button', { name: 'Continuar con Google' }).click()
  await expect(page.getByText('Ya tenés una cuenta con este email')).toBeVisible()
  await page.getByRole('button', { name: 'Vincular' }).click()
  await expect(page).toHaveURL(/\/eventos$/)
})

// SPLT-019 — la cuenta de Google no cambia su email.
test('Mi cuenta de Google muestra el email como solo lectura', async ({ page }) => {
  await page.goto('/perfil?escenario=google')
  await page.getByRole('button', { name: 'Editar' }).click()
  await expect(page.getByText('Tu email viene de Google y no se puede cambiar.')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveAttribute('readonly', '')
})

// SPLT-021 — Eliminar evento.
test('un evento con gastos no se puede eliminar', async ({ page }) => {
  await page.goto('/eventos/1?modal=eliminar')
  await expect(page.getByText('Este evento tiene 5 gastos.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Eliminar evento' })).toHaveCount(0)
})

test('un evento sin gastos se puede eliminar', async ({ page }) => {
  await page.goto('/eventos/4?modal=eliminar')
  await expect(page.getByRole('button', { name: 'Eliminar evento' })).toBeVisible()
})

// SPLT-012 — los gastos llegan de a 20.
test('la lista de gastos se pagina con «Ver más gastos»', async ({ page }) => {
  await page.goto('/eventos/2?tab=gastos')
  await expect(page.getByRole('button', { name: /^Editar gasto/ })).toHaveCount(20)
  await page.getByRole('button', { name: 'Ver más gastos' }).click()
  await expect(page.getByRole('button', { name: /^Editar gasto/ })).toHaveCount(24)
  await expect(page.getByRole('button', { name: 'Ver más gastos' })).toHaveCount(0)
})

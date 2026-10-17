import { test, expect } from '@playwright/test'
import { createYbugDiagnostics, summarizeYbugReport } from '../lib/ybug-diagnostics'

test('Ybug observers expose shape without logging report values or changing submission', () => {
  const messages: string[] = []
  const callbacks = createYbugDiagnostics(() => true, message => messages.push(message))
  const before = Object.freeze({
    title: 'PRIVATE_TITLE', comment: 'PRIVATE_COMMENT',
    reporter: Object.freeze({ email: 'private@example.com' }),
    screenshot: 'data:image/png;base64,PRIVATE_IMAGE',
    attributes: Object.freeze({ url: 'https://private.example/?token=SECRET' }),
  })
  const after = Object.freeze({ ...before, id: 'PRIVATE_ID', reportUrl: 'https://example.com/SECRET' })
  expect(callbacks.onload()).toBeUndefined()
  expect(callbacks.onbeforesend(before)).toBeUndefined()
  expect(callbacks.onaftersend(after)).toBeUndefined()
  expect(messages).toHaveLength(3)
  expect(messages[1]).toContain('beforesend')
  expect(messages[1]).toContain('image-data-url')
  expect(messages[2]).toContain('aftersend')
  expect(messages[2]).toContain('reportUrl')
  expect(messages.join()).not.toMatch(/PRIVATE|private@example|SECRET/)
  expect(before.title).toBe('PRIVATE_TITLE')
})

test('Ybug diagnostics stay silent until the tester opts in', () => {
  let enabled = false
  const messages: string[] = []
  const callbacks = createYbugDiagnostics(() => enabled, message => messages.push(message))
  callbacks.onload()
  callbacks.onbeforesend({ title: 'test' })
  callbacks.onaftersend({ id: 'test' })
  expect(messages).toEqual([])
  enabled = true
  callbacks.onaftersend({ id: 'test' })
  expect(messages).toHaveLength(1)
})

test('Ybug diagnostics cannot block submission when storage or logging throws', () => {
  for (const callbacks of [
    createYbugDiagnostics(() => { throw new Error('Storage disabled') }),
    createYbugDiagnostics(() => true, () => { throw new Error('Console disabled') }),
  ]) {
    expect(callbacks.onload()).toBeUndefined()
    expect(callbacks.onbeforesend({})).toBeUndefined()
    expect(callbacks.onaftersend({})).toBeUndefined()
  }
})

test('Ybug shape inspection tolerates missing data, cycles, blobs and accessors', () => {
  expect(summarizeYbugReport(null).reportType).toBe('null')
  expect(summarizeYbugReport(undefined).fields).toEqual([])
  const report: Record<string, unknown> = { screenshot: new Blob(['PRIVATE']), attachments: [] }
  report.self = report
  Object.defineProperty(report, 'secret', { get() { throw new Error('Must not read') } })
  const summary = summarizeYbugReport(report)
  expect(summary.fields).toContainEqual({ field: 'screenshot', type: 'blob', bytes: 7 })
  expect(summary.fields).toContainEqual({ field: 'secret', type: 'accessor' })
  expect(JSON.stringify(summary)).not.toContain('PRIVATE')
})

test('the widget registers callbacks before loading the script, with tab opt-in', async ({ page }) => {
  test.skip(
    process.env.NEXT_PUBLIC_YBUG_ID !== 'diagnostics-test'
      || process.env.NEXT_PUBLIC_YBUG_DIAGNOSTICS !== 'true',
    'Run the isolated diagnostics command from docs/ybug-callback-diagnostics.md',
  )
  const messages: string[] = []
  page.on('console', message => {
    if (message.text().startsWith('[Ybug diagnostics]')) messages.push(message.text())
  })
  let scripts = 0
  await page.route('https://widget.ybug.io/**', async route => {
    scripts++
    // Fake only the external SDK: no real report, quota, email or Slack activity.
    await route.fulfill({ contentType: 'application/javascript', body: 'window.ybug_settings.onload()' })
  })
  await page.goto('/inicio')
  await expect.poll(() => scripts).toBe(1)
  const result = await page.evaluate(() => {
    const settings = window.ybug_settings!
    const report = Object.freeze({ title: 'PRIVATE', screenshot: 'data:image/png;base64,PRIVATE' })
    const silentResult = settings.onbeforesend!(report)
    sessionStorage.setItem('splitit:ybug-diagnostics', 'true')
    settings.onload!()
    const beforeResult = settings.onbeforesend!(report)
    const afterResult = settings.onaftersend!({ ...report, id: 'PRIVATE_ID', reportUrl: 'https://example.com/PRIVATE' })
    sessionStorage.removeItem('splitit:ybug-diagnostics')
    settings.onaftersend!(report)
    return { id: settings.id, silentResult, beforeResult, afterResult, title: report.title }
  })
  expect(result).toEqual({
    id: 'diagnostics-test', title: 'PRIVATE', silentResult: undefined,
    beforeResult: undefined, afterResult: undefined,
  })
  expect(messages).toHaveLength(3)
  expect(messages[0]).toBe('[Ybug diagnostics] load')
  expect(messages[1]).toContain('beforesend')
  expect(messages[2]).toContain('reportUrl')
  expect(messages.join()).not.toContain('PRIVATE')
})

type ReportEvent = 'beforesend' | 'aftersend'

/** Inspect shape only: never retain the report or read nested user data. */
export function summarizeYbugReport(report: unknown) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    return { reportType: report === null ? 'null' : typeof report, fields: [] }
  }

  const fields = Object.entries(Object.getOwnPropertyDescriptors(report)).map(([field, descriptor]) => {
    // Avoid invoking accessors on an object owned by the widget.
    if (!('value' in descriptor)) return { field, type: 'accessor' }
    const value: unknown = descriptor.value
    if (value === null) return { field, type: 'null' }
    if (typeof value === 'string') {
      const format = /^data:image\//i.test(value) ? 'image-data-url'
        : /^https?:\/\//i.test(value) ? 'http-url' : 'text'
      return { field, type: 'string', format, length: value.length }
    }
    if (Array.isArray(value)) return { field, type: 'array', length: value.length }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return { field, type: 'blob', bytes: value.size }
    }
    return { field, type: typeof value }
  })

  return { reportType: 'object', fields }
}

/** Synchronous observers: no Promise, cancellation, report mutation or network I/O. */
export function createYbugDiagnostics(
  enabled: () => boolean,
  log: (message: string) => void = message => console.info(message),
) {
  function observe(event: ReportEvent, report: unknown): void {
    try {
      if (enabled()) log(`[Ybug diagnostics] ${event} ${JSON.stringify(summarizeYbugReport(report))}`)
    } catch {
      // Diagnostics must never prevent a report from being sent, even if storage/logging fails.
    }
  }

  return {
    onload(): void {
      try {
        if (enabled()) log('[Ybug diagnostics] load')
      } catch { /* Keep widget startup independent of diagnostics. */ }
    },
    onbeforesend(report: unknown): void { observe('beforesend', report) },
    onaftersend(report: unknown): void { observe('aftersend', report) },
  }
}

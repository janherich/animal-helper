import { safeContactHref } from '@/app/pages/fixtures/contacts'

// A narrow desktop window or touchscreen laptop must not launch a calling app.
// This is a device hint, not proof that telephony is supported.
export function isMobilePhone(userAgent: string): boolean {
  return /iPhone|iPod|Android.*Mobile/i.test(userAgent)
}

export function requestMobileCall(href: string): void {
  const safeHref = safeContactHref(href, 'phone')
  if (!safeHref || !isMobilePhone(navigator.userAgent)) return
  // Synchronous with the click; the OS owns confirmation and call handling.
  try {
    window.location.assign(safeHref)
  } catch {
    // Still allow the outcome screen when no protocol handler is available.
  }
}

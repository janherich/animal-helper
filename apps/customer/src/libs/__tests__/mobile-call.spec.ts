import { afterEach, expect, it, vi } from 'vitest'
import { isMobilePhone, requestMobileCall } from '../mobile-call'

afterEach(() => vi.unstubAllGlobals())

it.each([
  ['Mozilla iPhone', true],
  ['Mozilla Android 15 Mobile', true],
  ['Mozilla Android 15 Tablet', false],
  ['Mozilla Windows NT 10.0', false],
  ['Mozilla Macintosh', false]
])('classifies %s conservatively', (agent, expected) => {
  expect(isMobilePhone(agent)).toBe(expected)
})

it('requests the supplied phone URI only on phones, without a real call', () => {
  const assign = vi.fn()
  vi.stubGlobal('window', { location: { assign } })
  vi.stubGlobal('navigator', { userAgent: 'iPhone' })
  requestMobileCall('tel:158')
  expect(assign).toHaveBeenCalledExactlyOnceWith('tel:158')
  requestMobileCall('javascript:alert(1)')
  vi.stubGlobal('navigator', { userAgent: 'Windows NT' })
  requestMobileCall('tel:158')
  expect(assign).toHaveBeenCalledTimes(1)
})

it('does not block navigation when the OS rejects the request', () => {
  vi.stubGlobal('navigator', { userAgent: 'iPhone' })
  vi.stubGlobal('window', {
    location: {
      assign: () => {
        throw new Error('Unavailable')
      }
    }
  })
  expect(() => requestMobileCall('tel:158')).not.toThrow()
})

import { describe, expect, it, vi } from 'vitest'
import type { Router } from 'vue-router'
import { backWithinFlow, contactScreens } from '../instruction-navigation'

describe('instruction history navigation', () => {
  it.each(contactScreens)('returns to %s through history without pushing another entry', screen => {
    const back = vi.fn()
    const replace = vi.fn()
    const router = {
      options: { history: { state: { back: '/' + screen.toLowerCase() } } },
      resolve: () => ({ name: screen }),
      back,
      replace
    } as unknown as Router
    backWithinFlow(router, 'W15', contactScreens)
    expect(back).toHaveBeenCalledOnce()
    expect(replace).not.toHaveBeenCalled()
  })
  it.each([null, undefined, 'https://example.org', '//example.org', '/unrelated'])(
    'uses a safe fallback for %s',
    previous => {
      const back = vi.fn()
      const replace = vi.fn()
      const router = {
        options: { history: { state: { back: previous } } },
        resolve: () => ({ name: 'home' }),
        back,
        replace
      } as unknown as Router
      backWithinFlow(router, 'W15', contactScreens)
      expect(back).not.toHaveBeenCalled()
      expect(replace).toHaveBeenCalledWith({ name: 'W15' })
    }
  )
})

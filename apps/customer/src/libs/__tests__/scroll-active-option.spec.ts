import { afterEach, expect, it, vi } from 'vitest'
import { scrollActiveOption } from '../scroll-active-option'

afterEach(() => vi.unstubAllGlobals())

it.each([false, true])('reveals only the list option with reduced motion %s', reduced => {
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
  const list = document.createElement('ul')
  const option = document.createElement('li')
  option.setAttribute('role', 'option')
  list.append(option)
  Object.defineProperty(list, 'clientHeight', { value: 100 })
  list.getBoundingClientRect = () => ({ top: 0 }) as DOMRect
  option.getBoundingClientRect = () => ({ top: 110, bottom: 140 }) as DOMRect
  list.scrollTo = vi.fn()
  scrollActiveOption(list, 0)
  expect(list.scrollTo).toHaveBeenCalledWith({ top: 40, behavior: reduced ? 'instant' : 'smooth' })
  vi.mocked(list.scrollTo).mockClear()
  option.getBoundingClientRect = () => ({ top: 10, bottom: 40 }) as DOMRect
  scrollActiveOption(list, 0)
  expect(list.scrollTo).not.toHaveBeenCalled()
})

import { afterEach, expect, it, vi } from 'vitest'
import {
  beginScreenNavigation,
  clearScreenScroll,
  holdScreenHeight,
  screenEntered,
  setScreenScroll
} from '../transition-scroll'

afterEach(() => {
  clearScreenScroll()
  vi.restoreAllMocks()
})

it('keeps the outgoing height and scroll until the new screen is mounted', () => {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const main = document.createElement('main')
  const page = document.createElement('div')
  main.append(page)
  vi.spyOn(main, 'getBoundingClientRect').mockReturnValue({ height: 1800 } as DOMRect)
  beginScreenNavigation()
  holdScreenHeight(page)
  expect(main.style.minHeight).toBe('1800px')
  expect(setScreenScroll({ top: 0, left: 0 })).toBe(true)
  expect(scroll).not.toHaveBeenCalled()
  screenEntered()
  expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  expect(main.style.minHeight).toBe('')
})

it('restores history even when the reduced-motion enter hook precedes scrollBehavior', () => {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  beginScreenNavigation()
  screenEntered()
  expect(scroll).not.toHaveBeenCalled()
  expect(setScreenScroll({ top: 600, left: 0 })).toBe(true)
  expect(scroll).toHaveBeenCalledWith({ top: 600, left: 0, behavior: 'instant' })
  expect(setScreenScroll({ top: 0, left: 0 })).toBe(false)
})

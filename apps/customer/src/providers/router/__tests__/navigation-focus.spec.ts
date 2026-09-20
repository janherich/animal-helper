import { afterEach, expect, it } from 'vitest'
import { focusPageContent } from '../navigation-focus'

afterEach(() => document.body.replaceChildren())
it('focuses main without scrolling, but leaves active controls and modals alone', () => {
  const main = document.createElement('main')
  main.id = 'main-content'
  main.tabIndex = -1
  const input = document.createElement('input')
  main.append(input)
  document.body.append(main)
  focusPageContent()
  expect(document.activeElement).toBe(main)
  input.focus()
  focusPageContent()
  expect(document.activeElement).toBe(input)
  focusPageContent(input)
  expect(document.activeElement).toBe(main)
  input.focus()
  input.blur()
  const dialog = document.createElement('dialog')
  dialog.setAttribute('open', '')
  document.body.append(dialog)
  focusPageContent()
  expect(document.activeElement).not.toBe(main)
  dialog.remove()
  main.setAttribute('inert', '')
  focusPageContent()
  expect(document.activeElement).not.toBe(main)
})

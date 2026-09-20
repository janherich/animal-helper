import { expect, test } from '@playwright/test'

test('shared form theme covers native controls, focus and disabled states', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.customer-app').evaluate(root => {
    const form = document.createElement('form')
    form.id = 'theme-probe'
    for (const type of ['text', 'email', 'checkbox', 'radio']) {
      const input = document.createElement('input')
      input.type = type
      input.setAttribute('aria-label', type)
      form.append(input)
    }
    form.append(document.createElement('textarea'), document.createElement('select'))
    root.prepend(form)
  })
  const probe = page.locator('#theme-probe')
  const checkbox = probe.locator('[type=checkbox]')
  await expect(checkbox).toHaveCSS('appearance', 'none')
  await expect(checkbox).toHaveCSS('border-radius', '4px')
  await checkbox.check()
  await expect(checkbox).toBeChecked()
  await expect(checkbox).toHaveCSS('background-color', 'rgb(69, 77, 206)')
  await checkbox.evaluate(el => {
    ;(el as HTMLInputElement).disabled = true
  })
  await expect(checkbox).toHaveCSS('background-color', 'rgb(167, 175, 182)')
  const radio = probe.locator('[type=radio]')
  await expect(radio).not.toBeChecked()
  await expect(radio).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(radio).toHaveCSS('border-top-color', 'rgb(69, 77, 206)')
  await radio.focus()
  await page.keyboard.press('Space')
  await expect(radio).toBeChecked()
  await expect(radio).toHaveCSS('outline-style', 'solid')
  await expect(radio).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(radio).toHaveCSS('background-image', /radial-gradient.*rgb\(69, 77, 206\)/)
  await radio.hover()
  await expect(radio).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await radio.evaluate(el => {
    ;(el as HTMLInputElement).disabled = true
  })
  await expect(radio).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(radio).toHaveCSS('background-image', /radial-gradient.*rgb\(167, 175, 182\)/)
  const text = probe.locator('[type=text]')
  await expect(text).toHaveCSS('font-family', /Inter Variable/)
  await expect(page.getByRole('heading', { name: 'Čo sa stalo?' })).toHaveCSS('font-family', /Roboto Variable/)
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('14px "Inter Variable"', 'ľščťžýáíé')
      return document.fonts.check('14px "Inter Variable"', 'ľščťžýáíé')
    })
  ).toBe(true)
  await text.focus()
  await expect(text).toHaveCSS('box-shadow', 'rgb(69, 77, 206) 0px 0px 0px 1px inset')
  await expect(probe.locator('textarea')).toHaveCSS('resize', 'none')
  await expect(probe.locator('select')).toHaveCSS('border-radius', '16px')
})

import { expect, test } from '@playwright/test'

test('navigation and browser history focus the new main content without moving scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Zviera je zranené', exact: true }).click()
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('button', { name: 'Nemám fotografiu' }).click()
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('combobox').fill('mac')
  await expect(page.getByRole('combobox')).toBeFocused()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Pridajte fotografiu alebo video' })).toBeVisible()
  await expect(page.locator('#main-content')).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

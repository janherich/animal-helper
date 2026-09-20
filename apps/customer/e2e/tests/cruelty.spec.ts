import { expect, test } from '@playwright/test'

test('non-acute cruelty precedes location and media without a back loop', async ({ page }) => {
  await page.goto('/w27')
  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('button', { name: 'Týranie/zanedbávanie zvieraťa', exact: true }).click()
  await expect(page).toHaveURL(/\/w27$/)
  await page.getByRole('button', { name: 'Nejde o akútny prípad' }).click()
  await expect(page).toHaveURL(/\/w03$/)
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await expect(page).toHaveURL(/\/w04$/)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page).toHaveURL(/\/w03$/)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page).toHaveURL(/\/w27$/)
})

for (const reported of [true, false]) {
  test(`police outcome ${reported} leads to documentation`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 402, height: 874 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Týranie/zanedbávanie zvieraťa', exact: true }).click()
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Volať na políciu – 158' }).click()
    await expect(page).toHaveURL(/\/w28$/)
    await page
      .getByRole('button', { name: reported ? 'Podarilo sa nahlásiť' : 'Nepodarilo sa nahlásiť', exact: true })
      .click()
    const destination = reported ? /\/w29$/ : /\/w30$/
    await expect(page).toHaveURL(destination)
    if (!reported) {
      await expect(page.getByRole('button', { name: 'Zdokumentovať prípad' })).toBeEnabled()
      await page.getByLabel('Polícia odmietla prípad riešiť').check()
      await page.getByLabel('Iné', { exact: true }).check()
      await page.getByRole('textbox').fill('Ukážkový dôvod')
      await expect(page.locator('.base-expander')).toHaveCSS('opacity', '1')
      await expect.poll(async () => (await page.locator('.base-expander').boundingBox())?.height ?? 0).toBeGreaterThan(100)
    }
    await expect(page.locator('.customer-cruelty-followup')).toHaveCSS('opacity', '1')
    await page.screenshot({ path: testInfo.outputPath('outcome-mobile.png'), fullPage: true })
    await page.getByRole('button', { name: 'Zdokumentovať prípad' }).click()
    await expect(page).toHaveURL(/\/w03$/)
    await page.getByRole('button', { name: 'Späť', exact: true }).click()
    await expect(page).toHaveURL(destination)
    if (!reported) await expect(page.getByRole('textbox')).toHaveValue('Ukážkový dôvod')
    await page.setViewportSize({ width: 1280, height: 900 })
    await expect(page.locator('.customer-cruelty-followup')).toHaveCSS('opacity', '1')
    await page.screenshot({ path: testInfo.outputPath('outcome-desktop.png'), fullPage: true })
    await page.getByRole('button', { name: 'Späť', exact: true }).click()
    await expect(page).toHaveURL(/\/w28$/)
  })
}

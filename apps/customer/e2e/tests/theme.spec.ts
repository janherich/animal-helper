import { expect, test } from '@playwright/test'

test('applies Figma foundations and generates theme utilities', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 246, 253)')
  await expect(page.locator('body')).toHaveCSS('font-family', /Roboto Variable/)
  await page.evaluate(async () => {
    await document.fonts.load('400 14px "Roboto Variable"', 'Príliš žltý kôň')
    const sample = document.createElement('div')
    sample.id = 'theme-sample'
    sample.className = 'bg-primary text-heading-1 text-ink rounded-control shadow-brand'
    sample.textContent = 'Nadpis'
    document.body.append(sample)
  })
  const sample = page.locator('#theme-sample')
  await expect(sample).toHaveCSS('background-color', 'rgb(69, 77, 206)')
  await expect(sample).toHaveCSS('font-size', '20px')
  await expect(sample).toHaveCSS('line-height', '24px')
  await expect(sample).toHaveCSS('font-weight', '700')
  await expect(sample).toHaveCSS('border-radius', '16px')
  await sample.evaluate(node => node.classList.add('bg-primary-gradient'))
  await expect(sample).toHaveCSS('background-image', /linear-gradient/)
  const fontLoaded = await page.evaluate(() =>
    [...document.fonts].some(font => font.family.includes('Roboto Variable') && font.status === 'loaded')
  )
  expect(fontLoaded).toBe(true)
})

test('matches audited navigation typography, progress shadow and footer headings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const headings = page.locator('.customer-home__section-toggle')
  await expect(headings).toHaveCount(3)
  for (const heading of await headings.all()) await expect(heading).toHaveCSS('line-height', '28px')
  await page.getByRole('button', { name: 'Zviera je zranené', exact: true }).click()
  async function checkNavigation(step: string) {
    const back = page.getByRole('button', { name: 'Späť', exact: true })
    await expect(back).toHaveCSS('font-family', /Inter Variable/)
    await expect(back).toHaveCSS('font-size', '18px')
    await expect(back).toHaveCSS('line-height', '26px')
    await expect(back).toHaveCSS('font-weight', '600')
    await expect(back).toHaveCSS('letter-spacing', '-0.24px')
    await expect(page.getByText(step, { exact: true })).toHaveCSS('font-family', /Inter Variable/)
    await expect(page.getByText(step, { exact: true })).toHaveCSS('line-height', '20px')
    const track = page.getByRole('progressbar')
    await expect(track).toHaveCSS('height', '8px')
    expect(await track.evaluate(el => getComputedStyle(el, '::after').boxShadow)).toBe(
      'rgba(83, 71, 155, 0.16) 0px 2px 4px 0px inset'
    )
  }
  await checkNavigation('Krok 1 z 4')
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await checkNavigation('Krok 2 z 4')
  await page.getByRole('button', { name: 'Nemám fotografiu' }).click()
  await checkNavigation('Krok 2 z 4')
})

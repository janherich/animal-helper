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

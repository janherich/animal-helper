import { expect, test } from '@playwright/test'

test('blinks only the eye and respects reduced motion', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const headerSource = await page.locator('.customer-app__header img').getAttribute('src')
  await expect(page.locator('.customer-app__header img')).toHaveAttribute('src', /.+/)
  const response = await request.get(headerSource!)
  await page.setContent(await response.text())
  const eye = page.locator('.bird-eye')
  await expect(eye).toHaveCount(1)
  const mask = page.locator('.bird-eye-mask')
  const lid = page.locator('.bird-eyelid')
  await expect(mask).toHaveCSS('animation-duration', '30s')
  await expect(mask).toHaveCSS('animation-iteration-count', 'infinite')
  const openBounds = await eye.boundingBox()
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause()
      animation.currentTime = 29790
    }
  })
  await expect(mask).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 5)')
  await expect(lid).toHaveCSS('opacity', '1')
  const closedBounds = await eye.boundingBox()
  expect(closedBounds).toEqual(openBounds)
  await expect(eye).toHaveCSS('transform', 'none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(mask).toHaveCSS('animation-name', 'none')
  await expect(mask).toHaveCSS('transform', 'none')
  await expect(lid).toHaveCSS('opacity', '0')
})

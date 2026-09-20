import { expect, test } from '@playwright/test'

test('assembles splash from three directions and skips it with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.goto('/')
  const splash = page.locator('.customer-app__splash')
  await expect(splash).toBeVisible()
  const positions = await page.evaluate(() => {
    const parts = ['splash-zvero', 'splash-linka', 'splash-bird']
    const animations = parts.map(name => document.querySelector('.' + name)!.getAnimations()[0]!)
    animations.forEach(animation => {
      animation.pause()
      animation.currentTime = 0
    })
    const start = parts.map(name => {
      const matrix = new DOMMatrix(getComputedStyle(document.querySelector('.' + name)!).transform)
      return { x: matrix.m41, y: matrix.m42 }
    })
    animations.forEach(animation => {
      animation.currentTime = 950
    })
    const end = parts.map(name => getComputedStyle(document.querySelector('.' + name)!).transform)
    return { start, end }
  })
  expect(positions.start[0]!.x).toBeLessThan(-200)
  expect(positions.start[1]!.x).toBeGreaterThan(200)
  expect(positions.start[2]!.y).toBeGreaterThan(200)
  expect(positions.end).toEqual(Array(3).fill('matrix(1, 0, 0, 1, 0, 0)'))
  await page.clock.runFor(1700)
  await expect(splash).toHaveCount(0)
  await expect(page.locator('.customer-app__content')).not.toHaveAttribute('inert')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await page.clock.runFor(10)
  await expect(splash).toHaveCount(0)
})

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

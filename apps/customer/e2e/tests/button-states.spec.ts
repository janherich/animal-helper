import { expect, test } from '@playwright/test'

test('shared primary and secondary states preserve size and keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const primary = page.getByRole('button', { name: 'Zviera je zranené', exact: true })
  const secondary = page.getByRole('button', { name: 'Iné', exact: true })
  const original = await secondary.boundingBox()
  await expect(primary).toHaveCSS('background-color', 'rgb(69, 77, 206)')
  await primary.hover()
  await expect(primary).toHaveCSS('background-image', 'none')
  await expect(primary).toHaveCSS('background-color', 'rgb(69, 77, 206)')
  await page.mouse.down()
  await expect(primary).toHaveCSS('background-color', 'rgb(37, 42, 49)')
  await page.mouse.move(0, 0)
  await page.mouse.up()
  await secondary.hover()
  await expect(secondary).toHaveCSS('box-shadow', 'rgb(69, 77, 206) 0px 0px 0px 1px inset')
  const hovered = await secondary.boundingBox()
  expect(hovered?.width).toBe(original?.width)
  expect(hovered?.height).toBe(original?.height)
  await page.keyboard.press('Tab')
  await secondary.focus()
  await expect(secondary).toHaveCSS('outline-style', 'solid')
  await primary.evaluate(el => {
    ;(el as HTMLButtonElement).disabled = true
  })
  await secondary.evaluate(el => {
    ;(el as HTMLButtonElement).disabled = true
  })
  await expect(primary).toHaveCSS('background-color', 'rgb(167, 175, 182)')
  await expect(primary).toHaveCSS('opacity', '1')
  await expect(secondary).toHaveCSS('border-top-color', 'rgb(167, 175, 182)')
  await expect(secondary).toHaveCSS('color', 'rgb(167, 175, 182)')
})

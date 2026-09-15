import { expect, test } from '@playwright/test'

test('renders Pug, Tailwind, global icons and VueUse interaction', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Animal Helper', exact: true })).toBeVisible()
  await expect(page.locator("symbol[id^='icon-']")).toHaveCount(50)
  const icon = page.getByRole('img', { name: 'Poloha na mape' })
  await expect(icon).toHaveCSS('width', '40px')
  expect(await icon.locator('use').evaluate(node => (node as SVGGraphicsElement).getBBox().width)).toBeGreaterThan(0)
  expect(
    await page
      .locator('#icon-place-on-map [fill]')
      .evaluateAll(nodes => new Set(nodes.map(node => node.getAttribute('fill'))).size)
  ).toBeGreaterThan(1)
  await page.getByRole('button', { name: 'Prepnúť detail' }).click()
  await expect(page.getByText('Reaktivita cez VueUse funguje.')).toBeVisible()
  expect(errors).toEqual([])
})

test('supports direct routes, page scroll and back restoration', async ({ page }) => {
  await page.goto('/missing')
  await expect(page.getByRole('heading', { name: 'Stránka sa nenašla' })).toBeVisible()
  await page.getByRole('link', { name: 'Späť na úvod' }).click()
  const link = page.getByRole('link', { name: 'Overiť neznámu stránku' })
  await link.scrollIntoViewIfNeeded()
  const before = await page.evaluate(() => window.scrollY)
  await link.click()
  await expect(page).toHaveURL(/\/missing$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Animal Helper', exact: true })).toBeAttached()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})

test('scrolls the internal area with the keyboard', async ({ page }) => {
  await page.goto('/')
  const list = page.getByRole('list', { name: 'Ukážkový zoznam' })
  await list.focus()
  const before = await list.boundingBox()
  await page.keyboard.press('End')
  await expect.poll(async () => (await list.boundingBox())?.y).toBeLessThan(before?.y ?? 0)
})

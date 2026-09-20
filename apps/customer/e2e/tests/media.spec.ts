import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('previews local media, preserves it on back and removes it', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/w04')
  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('button', { name: 'Zviera je zranené', exact: true }).click()
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await expect(page.getByRole('heading', { name: 'Pridajte fotografiu alebo video' })).toBeVisible()
  const chooserOpened = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Pridať fotografiu alebo video', exact: true }).first().click()
  await (await chooserOpened).setFiles([])
  await page.screenshot({ path: testInfo.outputPath('media-empty.png'), fullPage: true })
  await page.getByRole('button', { name: 'Nemám fotografiu' }).click()
  await expect(page.getByRole('heading', { name: 'O aké zviera ide?' })).toBeVisible()
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  const gallery = page.locator('input[type=file][multiple]')
  await gallery.setInputFiles({ name: 'test.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
  await expect(page.getByRole('alert').filter({ hasText: 'Vyberte fotografiu' })).toBeVisible()
  await page.getByRole('button', { name: 'Zavrieť oznámenie' }).click()
  await gallery.setInputFiles(resolve('src/assets/brand/location-preview.png'))
  await expect(page.locator('.customer-media__grid img')).toBeVisible()
  await gallery.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(21 * 1024 * 1024) })
  await expect(page.getByRole('alert')).toContainText('large.png')
  await expect(page.getByRole('alert')).toContainText('Súbor je príliš veľký')
  await page.screenshot({ path: testInfo.outputPath('media-error-toast.png'), fullPage: true })
  await expect(page.locator('.customer-media__grid img')).toBeVisible()
  await page.getByRole('button', { name: 'Zavrieť oznámenie' }).click()
  await page.screenshot({ path: testInfo.outputPath('media-selected.png'), fullPage: true })
  await gallery.setInputFiles({
    name: 'extra.png',
    mimeType: 'image/png',
    buffer: readFileSync(resolve('src/assets/brand/location-preview.png'))
  })
  await page.getByRole('button', { name: 'Odstrániť súbor: extra.png', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Vrátiť späť' })).toBeVisible()
  await page.getByRole('button', { name: 'Potvrdiť', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Vrátiť späť' })).toHaveCount(0)
  await expect(page.locator('.customer-media__spinner')).toBeVisible()
  await expect(page.locator('.customer-media__actions button').first()).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Spracovávam údaje' })).toBeVisible()
  await expect(page.locator('.toast-manager__item')).toHaveCount(0)
  const pupil = page.locator('.customer-processing__pupil')
  await expect(pupil).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const travel = await pupil.evaluate(element => {
    const animation = element.getAnimations()[0]!
    animation.pause()
    animation.currentTime = 0
    const left = new DOMMatrix(getComputedStyle(element).transform).m41
    animation.currentTime = 1200
    const right = new DOMMatrix(getComputedStyle(element).transform).m41
    animation.currentTime = 3000
    const returned = new DOMMatrix(getComputedStyle(element).transform).m41
    animation.play()
    return { left, right, returned }
  })
  expect(travel).toEqual({ left: -10, right: 10, returned: -10 })
  await page.locator('.customer-processing__graphic').evaluate(element => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause()
      animation.currentTime = 2340
    }
  })
  await expect(pupil).toHaveCSS('opacity', '0')
  await expect(page.locator('.customer-processing__closed')).toHaveCSS('opacity', '1')
  await expect(page.locator('.customer-processing__eye')).toHaveCSS('opacity', '0')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(pupil).toHaveCSS('transform', 'none')
  await expect(pupil).toHaveCSS('opacity', '1')
  await expect(page.locator('.customer-processing__closed')).toHaveCSS('opacity', '0')
  await expect(page.getByText('Lokálna ukážka čakania.', { exact: false })).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('media-processing.png'), fullPage: true })
  await expect(page.getByText('Zviera sa nepodarilo identifikovať', { exact: true })).toBeVisible()
  const warning = page.locator('.customer-animal-details [role=status]')
  await expect(warning).toHaveCSS('background-color', 'rgb(254, 245, 242)')
  await expect(warning).toHaveCSS('border-top-color', 'rgb(245, 109, 66)')
  await expect(warning).toHaveCSS('border-radius', '16px')
  await expect(warning.locator('use')).toHaveAttribute('href', '#icon-warning')
  await page.screenshot({ path: testInfo.outputPath('identification-failed.png'), fullPage: true })
  await expect(page.getByRole('button', { name: 'Prejsť na manuálny výber', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Spracovávam údaje' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page.locator('.customer-media__grid img')).toHaveCount(1)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await expect(page.locator('.customer-media__grid img')).toBeVisible()
  await page.getByRole('button', { name: 'Odstrániť súbor: location-preview.png' }).click()
  await expect(page.getByRole('button', { name: 'Pridať fotografiu alebo video' })).toHaveCount(2)
  await page.getByRole('button', { name: 'Vrátiť späť' }).click()
  await expect(page.locator('.customer-media__grid img')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Vrátiť späť' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Odstrániť súbor: location-preview.png' }).click()
  await page.getByRole('button', { name: 'Zavrieť oznámenie' }).click()
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Vrátiť späť' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await expect(page.locator('input[type=file]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Otvoriť fotoaparát' })).toHaveCount(0)
  await page.reload()
  await expect(page).toHaveURL(/\/$/)
})

test('groups removals into one toast and restores the original order', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Zviera je zranené', exact: true }).click()
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  const buffer = readFileSync(resolve('src/assets/brand/location-preview.png'))
  const names = Array.from({ length: 7 }, (_, index) => `animal-${index}.png`)
  await page.locator('input[type=file]').setInputFiles(names.map(name => ({ name, mimeType: 'image/png', buffer })))
  await expect(page.locator('.customer-media__grid img')).toHaveCount(7)
  await page.mouse.move(640, 400)
  await page.mouse.wheel(0, 450)
  await expect.poll(async () => (await page.locator('.customer-app__header').boundingBox())?.y).toBe(0)
  await expect
    .poll(async () => {
      const bounds = await page.locator('.customer-media__actions').boundingBox()
      return bounds ? Math.round(bounds.y + bounds.height) : 0
    })
    .toBe(page.viewportSize()!.height)
  await page.getByRole('button', { name: 'Odstrániť súbor: animal-1.png', exact: true }).click()
  await page.getByRole('button', { name: 'Odstrániť súbor: animal-0.png', exact: true }).click()
  await expect(page.locator('.toast-manager__item')).toHaveCount(1)
  await expect(page.getByRole('status').filter({ hasText: 'Počet odstránených súborov: 2' })).toBeVisible()
  await page.getByRole('button', { name: 'Vrátiť všetky', exact: true }).click()
  await expect(page.locator('.customer-media__grid img')).toHaveCount(7)
  expect(
    await page
      .locator('.customer-media__grid img')
      .evaluateAll(images => images.map(image => image.getAttribute('alt')))
  ).toEqual(names)
  await expect(page.locator('.toast-manager__item')).toHaveCount(0)
})

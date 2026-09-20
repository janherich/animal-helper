import { expect, test } from '@playwright/test'

test('details and edit identification round trip preserve answers', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 402, height: 874 })
  await page.goto('/w40')
  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('button', { name: 'Zviera je zranené', exact: true }).click()
  await page.getByRole('button', { name: 'Ukážková mapa — vybrať Dolné Orešany' }).click()
  await page.getByRole('button', { name: 'Potvrdiť polohu' }).click()
  await page.getByRole('button', { name: 'Nemám fotografiu' }).click()
  await page.getByRole('combobox').fill('mac')
  await page.getByRole('option', { name: 'Mačka domáca' }).click()
  await page.getByRole('button', { name: 'Potvrdiť voľbu' }).click()
  await expect(page.getByRole('heading', { name: 'Doplňte podrobnosti' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zobraziť možnosti pomoci' })).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Iné', exact: true }).check()
  await page.getByRole('textbox').fill('Poranená labka')
  await page.locator('input[name=conscious][value=yes]').check()
  await page.locator('input[name=juvenile][value=no]').check()
  await page.getByRole('button', { name: 'Zobraziť možnosti pomoci' }).click()
  await expect(page.getByRole('heading', { name: 'Pozor!', exact: true })).toBeVisible()
  await expect(page.locator('.customer-advice__blocks section')).toHaveCount(2)
  await expect(page.locator('.customer-advice__avoid')).toHaveCSS('border-top-color', 'rgb(198, 46, 62)')
  await expect(page.locator('.customer-advice__do')).toHaveCSS('background-color', 'rgb(251, 253, 247)')
  await expect(page.locator('.customer-advice__avoid use')).toHaveAttribute('href', '#icon-attention')
  await expect(page.locator('.customer-advice__do use')).toHaveAttribute('href', '#icon-info')
  await page.screenshot({ path: testInfo.outputPath('advice-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Rozumiem', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Možnosti kontaktovania' })).toBeVisible()
  await expect(page.locator('.customer-contact-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'Iné možnosti pomoci', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pomôžte sami', exact: true })).toBeVisible()
  await expect(page.locator('.customer-self-help ol li')).toHaveCount(2)
  await expect(page.locator('.customer-self-help .bg-danger-light')).toBeVisible()
  await expect(page.locator('.customer-self-help figure')).toHaveCount(4)
  for (const image of await page.locator('.customer-self-help figure img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
  await expect(page.getByRole('link', { name: 'OpenMoji', exact: true })).toHaveAttribute(
    'href',
    'https://openmoji.org/'
  )
  await page.screenshot({ path: testInfo.outputPath('self-help-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Rady', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Rady na pomoc' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Podarilo sa pomôcť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ďakujeme za vašu pomoc' })).toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(23)
  await expect(page.getByRole('heading', { name: 'Prečo sa nepodarilo pomôcť zvieraťu?' })).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Ako situácia dopadla?' })).toHaveCount(1)
  await expect(page.locator('.customer-thank-you .bg-success-light')).toHaveCount(1)
  await expect(page.getByRole('checkbox').first()).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Rady', exact: true })).toHaveCount(0)
  await page.getByRole('textbox', { name: 'E-mail (nepovinné)' }).fill('not-an-email')
  expect(await page.locator('input[type=email]').evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(
    false
  )
  await page.getByRole('textbox', { name: 'E-mail (nepovinné)' }).fill('test@example.org')
  await page.screenshot({ path: testInfo.outputPath('thank-you-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({ path: testInfo.outputPath('thank-you-desktop.png'), fullPage: true })
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await page.getByRole('button', { name: 'Nepodarilo sa pomôcť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ďakujeme za vašu snahu' })).toBeVisible()
  await expect(page.locator('.customer-thank-you .base-expander').first()).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('textarea').first()).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Iné', exact: true }).first().check()
  await page.getByRole('textbox', { name: 'Opíšte, čo sa stalo' }).fill('Testovací dôvod')
  await page.setViewportSize({ width: 402, height: 874 })
  await page.screenshot({ path: testInfo.outputPath('thank-you-failure.png'), fullPage: true })
  for (const [route, heading] of [
    ['w26', 'Uzatvorenie prípadu'],
    ['w38', 'Zviera žije a potrebuje ošetrenie?'],
    ['w39', 'Ďakujeme za vašu pomoc']
  ]) {
    await page.evaluate(path => {
      history.pushState({}, '', '/' + path)
      dispatchEvent(new PopStateEvent('popstate'))
    }, route)
    await expect(page.getByRole('heading', { name: heading!, exact: true })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('thank-you-' + route + '.png'), fullPage: true })
  }
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pomôžte sami', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({ path: testInfo.outputPath('self-help-desktop.png'), fullPage: true })
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Možnosti kontaktovania' })).toBeVisible()
  await page.setViewportSize({ width: 402, height: 874 })
  await page.getByRole('button', { name: 'Podarilo sa pomôcť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ďakujeme za vašu pomoc' })).toBeVisible()
  await expect(page.locator('input[type=email]')).toHaveValue('nespravna-adresa')
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  const contactsUrl = page.url()
  const adviceTrigger = page.getByRole('button', { name: 'Rady', exact: true })
  await adviceTrigger.click()
  const adviceDialog = page.getByRole('dialog', { name: 'Rady na pomoc' })
  await expect(adviceDialog).toBeVisible()
  await expect(adviceDialog.locator('section')).toHaveCount(2)
  expect(page.url()).toBe(contactsUrl)
  const panel = page.locator('.customer-advice-drawer__panel')
  const headerBox = await page.locator('.customer-app__header').boundingBox()
  const panelBox = await panel.boundingBox()
  expect(panelBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height)
  await page.screenshot({ path: testInfo.outputPath('advice-drawer.png') })
  await adviceDialog.getByRole('button', { name: 'Rozumiem', exact: true }).click()
  await expect(adviceDialog).toBeHidden()
  await expect(adviceTrigger).toBeFocused()
  await adviceTrigger.click()
  await page.keyboard.press('Escape')
  await expect(adviceDialog).toBeHidden()
  await expect(adviceTrigger).toBeFocused()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 767, height: 500 })
  await adviceTrigger.click()
  await expect(adviceDialog).toBeVisible()
  const animationPositions = await panel.evaluate(element => {
    const animation = element.getAnimations()[0]!
    animation.pause()
    animation.currentTime = 0
    const start = element.getBoundingClientRect().top
    animation.currentTime = 180
    const middle = element.getBoundingClientRect().top
    animation.currentTime = 360
    const overshootBottom = element.getBoundingClientRect().bottom
    const surfaceExtension = getComputedStyle(element).boxShadow
    animation.finish()
    const end = element.getBoundingClientRect().top
    return {
      start,
      middle,
      overshootBottom,
      surfaceExtension,
      end,
      viewport: window.innerHeight,
      scroll: element.parentElement!.scrollTop,
      transform: getComputedStyle(element).transform
    }
  })
  expect(animationPositions.start, JSON.stringify(animationPositions)).toBeGreaterThanOrEqual(
    animationPositions.viewport - 1
  )
  expect(animationPositions.middle).toBeLessThan(animationPositions.start)
  expect(animationPositions.overshootBottom).toBeLessThan(animationPositions.viewport)
  expect(animationPositions.overshootBottom + 12).toBeGreaterThanOrEqual(animationPositions.viewport)
  expect(animationPositions.surfaceExtension).toContain('rgb(255, 255, 255) 0px 12px 0px 0px')
  expect(animationPositions.end).toBeLessThan(animationPositions.middle)
  await panel.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished))
  })
  const shortHeader = await page.locator('.customer-app__header').boundingBox()
  const shortPanel = await panel.boundingBox()
  expect(shortPanel!.x).toBe(0)
  expect(shortPanel!.width).toBe(767)
  expect(shortPanel!.y).toBeGreaterThan(shortHeader!.y + shortHeader!.height)
  const scrollContent = adviceDialog.locator('.overflow-y-auto')
  expect(await scrollContent.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  await scrollContent.evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  expect(await scrollContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  await page.screenshot({ path: testInfo.outputPath('advice-drawer-short.png') })
  await page.keyboard.press('Escape')
  await expect(adviceDialog).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 768, height: 800 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => window.scrollTo(0, 600))
  const initialScroll = await page.evaluate(() => window.scrollY)
  await adviceTrigger.click()
  await expect(adviceDialog).toBeVisible()
  await expect(page).toHaveURL(/\/w15$/)
  await panel.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished))
  })
  const desktopPanel = await panel.boundingBox()
  expect(desktopPanel!.width).toBe(640)
  expect(Math.abs(desktopPanel!.x + desktopPanel!.width / 2 - 384)).toBeLessThan(2)
  expect(Math.abs(desktopPanel!.y + desktopPanel!.height / 2 - 400)).toBeLessThan(2)
  await expect(adviceDialog.getByRole('button', { name: 'Späť', exact: true })).toHaveCount(0)
  await expect(adviceDialog.getByRole('progressbar')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Rozumiem', exact: true }).click()
  await expect(adviceDialog).toBeHidden()
  await expect(adviceTrigger).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll)
  await expect(page).toHaveURL(/\/w15$/)
  await page.setViewportSize({ width: 402, height: 874 })
  await page.screenshot({ path: testInfo.outputPath('contacts-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Podarilo sa pomôcť', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ďakujeme za vašu pomoc' })).toBeVisible()
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  for (const [path, title, cards] of [
    ['/w18', 'Môžete kontaktovať veterinárnu kliniku', 3],
    ['/w20', 'Zavolajte na políciu', 1],
    ['/w21', 'Obráťte sa na dobrovoľníkov', 0],
    ['/w36', 'Zavolajte diaľničnú patrolu', 1],
    ['/w15', 'Možnosti kontaktovania', 6]
  ] as const) {
    await page.evaluate(path => {
      history.pushState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, path)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.locator('.customer-contact-card')).toHaveCount(cards)
    await expect(page.locator('.customer-contacts a[href^="tel:"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(path.slice(1) + '-contacts.png'), fullPage: true })
    await expect(page.getByRole('button', { name: 'Nepodarilo sa pomôcť', exact: true })).toHaveCount(0)
    await expect(page.locator('.customer-contacts figure')).toHaveCount(0)
    await page.getByRole('button', { name: 'Iné možnosti pomoci', exact: true }).click()
    await expect(page).toHaveURL(/\/w22$/)
    const historyLength = await page.evaluate(() => history.length)
    await page.getByRole('button', { name: 'Späť', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(path + '$'))
    expect(await page.evaluate(() => history.length)).toBe(historyLength)
    await page.goForward()
    await expect(page).toHaveURL(/\/w22$/)
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(path + '$'))
  }
  await expect(page.getByRole('combobox')).toHaveCount(0)
  await expect(page.locator('.customer-contact-notice')).toHaveCount(3)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('details-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Upraviť', exact: true }).click()
  await page.getByRole('combobox').fill('morca')
  await page.getByRole('combobox').press('ArrowDown')
  await page.getByRole('combobox').press('Enter')
  await expect(page.getByText('Morča domáce', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveValue('Poranená labka')
  await page.getByRole('button', { name: 'Upraviť', exact: true }).click()
  await page.getByRole('button', { name: 'Prejsť na manuálny výber zvieraťa' }).click()
  await page.getByRole('button', { name: 'Začať výber odznova' }).click()
  await page.getByRole('button', { name: 'Hospodárske zvieratá', exact: true }).click()
  await page.getByRole('combobox').fill('mac')
  await page.getByRole('option', { name: 'Mačka domáca', exact: true }).click()
  await page.goBack()
  await expect(page).toHaveURL(/\/w40$/)
  await page.getByRole('button', { name: 'Späť', exact: true }).click()
  await expect(page.getByText('Morča domáce', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveValue('Poranená labka')
  await page.getByRole('button', { name: 'Upraviť', exact: true }).click()
  await page.getByRole('button', { name: 'Prejsť na manuálny výber zvieraťa' }).click()
  await page.getByRole('radio', { name: 'Neviem identifikovať', exact: true }).check()
  await page.getByRole('button', { name: 'Potvrdiť voľbu' }).click()
  await expect(page.getByText('Neidentifikované zviera', { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.screenshot({ path: testInfo.outputPath('details-desktop.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280)
})

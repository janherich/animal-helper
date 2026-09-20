import { mount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { beginPreview, previewSession } from '../../preview-flow'
import { otherFailedFixture, otherSituationFixture } from '../fixtures/other-situations'
import PageCrueltyFollowup from '../page-cruelty-followup.vue'
import PageOtherSituation from '../page-other-situation.vue'
const push = vi.hoisted(() => vi.fn())
vi.mock('vue-router', () => ({ useRouter: () => ({ push, replace: vi.fn() }) }))
beforeEach(() => {
  beginPreview('other')
  push.mockClear()
})
const global = { stubs: { BaseIcon: true, BaseExpander: { template: '<div><slot /></div>' } } }

it('resets stale data on branch change but preserves same-branch answers', async () => {
  previewSession.value!.otherSituation = 'road'
  previewSession.value!.animalDetails = { road: 'near-highway' }
  const page = mount(PageOtherSituation, { props: { view: otherSituationFixture }, global })
  await page.findAll('button')[1]!.trigger('click')
  expect(previewSession.value!.animalDetails).toEqual({ road: 'near-highway' })
  await page.findAll('button')[2]!.trigger('click')
  expect(previewSession.value!.otherSituation).toBe('human')
  expect(previewSession.value!.animalDetails).toBeUndefined()
  expect(push).toHaveBeenLastCalledWith({ name: 'W03' })
})

it('keeps failure reasons separate from police reporting and omits unchecked Other text', async () => {
  previewSession.value!.crueltyReport = { outcome: 'reported', reasons: [] }
  const page = mount(PageCrueltyFollowup, { props: { view: otherFailedFixture }, global })
  const other = page.get('input[value=other]')
  await other.setValue(true)
  await page.get('textarea').setValue('  Ukážkový dôvod  ')
  expect(previewSession.value!.otherReport).toEqual({ reasons: ['other'], description: 'Ukážkový dôvod' })
  await other.setValue(false)
  expect(previewSession.value!.otherReport).toEqual({ reasons: [] })
  expect(previewSession.value!.crueltyReport).toEqual({ outcome: 'reported', reasons: [] })
  await page.get('footer button').trigger('click')
  expect(previewSession.value!.documentingOther).toBe(true)
  expect(push).toHaveBeenLastCalledWith({ name: 'W04' })
})

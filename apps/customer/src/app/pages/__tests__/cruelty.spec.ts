import BaseIcon from '@/libs/components/base-icon.vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { crueltyFixture } from '../fixtures/cruelty'
import PageCruelty from '../page-cruelty.vue'
const push = vi.hoisted(() => vi.fn())
const replace = vi.hoisted(() => vi.fn())
const requestMobileCall = vi.hoisted(() => vi.fn())
vi.mock('@/libs/mobile-call', () => ({ requestMobileCall }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push, replace }) }))
it('requests mobile calling and advances to the outcome without assuming a successful call', async () => {
  const page = mount(PageCruelty, { props: { view: crueltyFixture }, global: { components: { BaseIcon } } })
  expect(page.get('h1').text()).toBe(crueltyFixture.copy.title)
  expect(page.findAll('li')).toHaveLength(4)
  expect(page.find('use[href="#icon-warning"]').exists()).toBe(true)
  expect(page.find('a[href^="tel:"]').exists()).toBe(false)
  await page.get('footer button').trigger('click')
  expect(requestMobileCall).toHaveBeenCalledExactlyOnceWith(crueltyFixture.actions.call.href)
  expect(push).toHaveBeenLastCalledWith({ name: 'W28' })
  await page.findAll('footer button')[1]!.trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W03' })
  await page.get('button').trigger('click')
  expect(replace).toHaveBeenLastCalledWith({ name: 'W01' })
  await page.setProps({ view: { ...crueltyFixture, allowedActions: [] } })
  expect(page.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  await page.get('footer button').trigger('click')
  expect(requestMobileCall).toHaveBeenCalledTimes(1)
})

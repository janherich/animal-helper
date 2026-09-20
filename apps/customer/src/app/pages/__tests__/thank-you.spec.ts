import BaseExpander from '@/libs/components/base-expander.vue'
import BaseIcon from '@/libs/components/base-icon.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { completion } from '../../completion'
import { previewSession } from '../../preview-flow'
import {
  helpThankYouFixture,
  thankYouFixture,
  thankYouFixtures,
  unsuccessfulThankYouFixture
} from '../fixtures/thank-you'
import PageThankYou from '../page-thank-you.vue'
const push = vi.hoisted(() => vi.fn())
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

it('renders optional contact fields and opt-ins without submitting or persisting', async () => {
  push.mockClear()
  previewSession.value = { situation: 'test', fromDraft: false, thankYouReturnTarget: 'W22' }
  const wrapper = mount(PageThankYou, {
    props: { view: thankYouFixture },
    global: { components: { BaseIcon, BaseExpander }, stubs: { CompletionAnimation: true } }
  })
  expect(wrapper.findAll('input:not([type=checkbox])')).toHaveLength(3)
  expect(wrapper.findAll('input[required]')).toHaveLength(0)
  expect(wrapper.findAll<HTMLInputElement>('input[type=checkbox]').every(input => !input.element.checked)).toBe(true)
  await wrapper.get('form').trigger('submit')
  expect(push).not.toHaveBeenCalled()
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeDefined()
  await wrapper.get('form').trigger('submit')
  expect(completion.value).toEqual({ label: thankYouFixture.completionLabel, target: thankYouFixture.submitTarget })
  completion.value = null
  await flushPromises()
  expect(push).not.toHaveBeenCalled()
  await wrapper.get('input[type=email]').setValue('test@example.org')
  await wrapper.get('input[type=checkbox]').setValue(true)
  await wrapper.get('form').trigger('submit')
  completion.value = null
  await flushPromises()
  expect(previewSession.value).toEqual({ situation: 'test', fromDraft: false, thankYouReturnTarget: 'W22' })
  await wrapper.get('button[type=button]').trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W22' })
  await wrapper.setProps({ view: { ...thankYouFixture, allowedActions: [] } })
  expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  previewSession.value = null
})

it('offers multiple reasons and an expandable description only in the failure variant', async () => {
  const wrapper = mount(PageThankYou, {
    props: { view: unsuccessfulThankYouFixture },
    global: { components: { BaseIcon, BaseExpander } }
  })
  expect(wrapper.get('h1').text()).toBe('Ďakujeme za vašu snahu')
  expect(wrapper.findAll('input[type=checkbox]')).toHaveLength(19)
  expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
  await wrapper.get('input[name=other]').setValue(true)
  await wrapper.get('input[name=escaped]').setValue(true)
  expect(wrapper.get('textarea').attributes('disabled')).toBeUndefined()
  await wrapper.get('textarea').setValue('Testovací dôvod')
  await wrapper.get('input[name=other]').setValue(false)
  expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
  expect(wrapper.get<HTMLInputElement>('input[name=escaped]').element.checked).toBe(true)
})

it('renders all supplied variants and combined blocks without inferring business rules', async () => {
  const wrapper = mount(PageThankYou, {
    props: { view: thankYouFixture },
    global: { components: { BaseIcon, BaseExpander } }
  })
  for (const view of thankYouFixtures) {
    await wrapper.setProps({ view })
    expect(wrapper.get('h1').text()).toBe(view.copy.title)
    const groups = view.reasonGroups ?? (view.reasons ? [view.reasons] : [])
    expect(wrapper.findAll('input[type=checkbox]')).toHaveLength(
      groups.reduce((sum, group) => sum + group.options.length, 0) + view.consents.length
    )
    expect(wrapper.find('.bg-success-light').exists()).toBe(!!view.help)
  }
  await wrapper.setProps({
    view: { ...helpThankYouFixture, reasons: unsuccessfulThankYouFixture.reasons!, fields: [], consents: [] }
  })
  expect(wrapper.findAll('input:not([type=checkbox])')).toHaveLength(0)
  expect(wrapper.find('.bg-success-light').exists()).toBe(true)
  await wrapper
    .findAll('button')
    .find(button => button.text() === helpThankYouFixture.help!.action.label)!
    .trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W14' })
})

import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import BaseExpander from '../base-expander.vue'

it('keeps content mounted while hiding collapsed content from interaction and accessibility', async () => {
  const wrapper = mount(BaseExpander, { slots: { default: '<input value="Retained" />' } })
  const input = wrapper.get('input').element
  expect(wrapper.attributes('inert')).toBeDefined()
  expect(wrapper.attributes('aria-hidden')).toBe('true')
  await wrapper.setProps({ state: true })
  expect(wrapper.classes()).toContain('is-open')
  expect(wrapper.attributes('inert')).toBeUndefined()
  expect(wrapper.attributes('aria-hidden')).toBe('false')
  await wrapper.setProps({ state: false })
  expect(wrapper.classes()).not.toContain('is-open')
  expect(wrapper.get('input').element).toBe(input)
})

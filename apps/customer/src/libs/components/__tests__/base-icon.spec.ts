import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseIcon from '../base-icon.vue'

describe('base-icon', () => {
  it('hides decorative icons from assistive technology', () => {
    const wrapper = mount(BaseIcon, { props: { name: 'search' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('use').attributes('href')).toBe('#icon-search')
  })
  it('labels meaningful icons and forwards sizing classes', () => {
    const wrapper = mount(BaseIcon, {
      props: { name: 'search', label: 'Search' },
      attrs: { class: 'size-10' }
    })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Search')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.classes()).toContain('size-10')
  })
})

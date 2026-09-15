import { mount } from '@vue/test-utils'
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onUnmounted } from 'vue'
import { configureScrollbars, scrollbarCancel, scrollbarOptions, usePageScrollbars } from '../index'

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  destroy: vi.fn(),
  setInitialization: vi.fn(),
  setOptions: vi.fn()
}))
vi.mock('overlayscrollbars', () => ({
  OverlayScrollbars: {
    env: () => ({
      setDefaultInitialization: mocks.setInitialization,
      setDefaultOptions: mocks.setOptions
    })
  }
}))
vi.mock('overlayscrollbars-vue', () => ({
  useOverlayScrollbars: vi.fn(() => {
    onUnmounted(mocks.destroy)
    return [mocks.initialize, () => null]
  })
}))

describe('scrollbar integration', () => {
  it('sets native overlay cancellation for all scroll areas', () => {
    configureScrollbars()
    expect(mocks.setInitialization).toHaveBeenCalledWith({
      cancel: scrollbarCancel
    })
    expect(mocks.setOptions).toHaveBeenCalledWith(scrollbarOptions)
  })
  it('initializes body with deferred lifecycle-bound integration', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          usePageScrollbars()
          return () => h('div')
        }
      })
    )
    expect(useOverlayScrollbars).toHaveBeenCalledWith({
      options: scrollbarOptions,
      defer: true
    })
    expect(mocks.initialize).toHaveBeenCalledWith({
      target: document.body,
      cancel: scrollbarCancel
    })
    wrapper.unmount()
    expect(mocks.destroy).toHaveBeenCalled()
  })
})

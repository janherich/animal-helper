import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useAutocomplete } from '../use-autocomplete'

it('wraps keyboard selection, dismisses, respects permissions and resets stale results', async () => {
  const query = ref('cat')
  const matches = ref(['cat', 'dog'])
  const enabled = ref(true)
  const select = vi.fn()
  let controller!: ReturnType<typeof useAutocomplete<string>>
  const wrapper = mount(
    defineComponent({
      setup() {
        controller = useAutocomplete({ query, matches, enabled: () => enabled.value, select })
        return () => h('div')
      }
    })
  )
  const press = (key: string, isComposing = false) =>
    controller.keydown(new KeyboardEvent('keydown', { key, isComposing }))
  await press('ArrowUp')
  expect(controller.activeIndex.value).toBe(1)
  await press('ArrowDown')
  expect(controller.activeIndex.value).toBe(0)
  await press('Enter')
  expect(select).toHaveBeenCalledWith('cat')
  await press('Escape')
  expect(controller.open.value).toBe(false)
  await press('Enter')
  expect(select).toHaveBeenCalledTimes(1)
  await press('ArrowDown', true)
  expect(controller.open.value).toBe(false)
  enabled.value = false
  await press('ArrowDown')
  expect(controller.open.value).toBe(false)
  enabled.value = true
  await press('ArrowDown')
  matches.value = ['new result']
  await nextTick()
  expect(controller.activeIndex.value).toBe(-1)
  await press('Enter')
  expect(select).toHaveBeenCalledTimes(1)
  query.value = ''
  await press('ArrowDown')
  expect(controller.open.value).toBe(false)
  wrapper.unmount()
})

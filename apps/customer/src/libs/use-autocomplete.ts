import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/vue'
import { computed, nextTick, ref, watch, type ComponentPublicInstance, type Ref } from 'vue'
import { scrollActiveOption } from './scroll-active-option'

// Presentation-only controller: callers own matching, permissions and selection semantics.
export function useAutocomplete<T>(options: {
  query: Ref<string>
  matches: Readonly<Ref<T[]>>
  enabled: () => boolean
  select: (item: T) => void
}) {
  const anchor = ref<HTMLElement>()
  const results = ref<HTMLElement>()
  const focused = ref(false)
  const activeIndex = ref(-1)
  const open = computed(() => focused.value && !!options.query.value.trim() && options.enabled())
  const { floatingStyles } = useFloating(anchor, results, {
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(6),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.max(0, Math.min(280, availableHeight))}px`
          })
        }
      })
    ],
    whileElementsMounted: autoUpdate
  })
  watch(options.query, () => {
    activeIndex.value = -1
  })
  watch(options.matches, () => {
    activeIndex.value = -1
  })
  watch(open, value => {
    if (!value) activeIndex.value = -1
  })
  async function keydown(event: KeyboardEvent) {
    if (event.isComposing) return
    if (event.key === 'Escape') {
      focused.value = false
      activeIndex.value = -1
      return
    }
    if (!options.enabled()) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focused.value = true
      const count = options.matches.value.length
      if (!open.value || !count) return
      activeIndex.value =
        activeIndex.value < 0
          ? event.key === 'ArrowDown'
            ? 0
            : count - 1
          : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
      await nextTick()
      if (open.value) scrollActiveOption(results.value, activeIndex.value)
    } else if (event.key === 'Enter' && open.value && activeIndex.value >= 0) {
      const item = options.matches.value[activeIndex.value]
      if (item !== undefined) {
        event.preventDefault()
        options.select(item)
      }
    }
  }
  function setAnchor(element: Element | ComponentPublicInstance | null) {
    anchor.value = element instanceof HTMLElement ? element : undefined
  }
  function setResults(element: Element | ComponentPublicInstance | null) {
    results.value = element instanceof HTMLElement ? element : undefined
  }
  return { setAnchor, setResults, focused, activeIndex, open, floatingStyles, keydown }
}

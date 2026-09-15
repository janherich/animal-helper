import { OverlayScrollbars } from 'overlayscrollbars'
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import 'overlayscrollbars/overlayscrollbars.css'
import { onMounted } from 'vue'

export const scrollbarOptions = { scrollbars: { autoHide: 'scroll' } } as const
export const scrollbarCancel = {
  nativeScrollbarsOverlaid: true,
  body: null
} as const
export function configureScrollbars(): void {
  OverlayScrollbars.env().setDefaultInitialization({ cancel: scrollbarCancel })
  OverlayScrollbars.env().setDefaultOptions(scrollbarOptions)
}
export function usePageScrollbars(): void {
  // The official composable cancels deferred work and destroys its instance on unmount.
  const [initialize] = useOverlayScrollbars({
    options: scrollbarOptions,
    defer: true
  })
  onMounted(() => initialize({ target: document.body, cancel: scrollbarCancel }))
}

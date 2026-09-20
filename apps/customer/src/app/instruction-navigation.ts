import type { Router } from 'vue-router'

export const contactScreens = ['W15', 'W18', 'W20', 'W21', 'W36'] as const

// Only traverse history when its previous entry belongs to the expected flow.
// Direct entry or unrelated history uses a safe route supplied by the view.
export function backWithinFlow(router: Router, fallback: string, allowedScreens: readonly string[]) {
  const previous = router.options?.history.state.back
  if (typeof previous === 'string' && previous.startsWith('/') && !previous.startsWith('//')) {
    const name = router.resolve(previous).name
    if (typeof name === 'string' && allowedScreens.includes(name)) {
      router.back()
      return
    }
  }
  void router.replace({ name: fallback })
}

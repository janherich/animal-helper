// Coordinate router scroll restoration with the out-in page transition.
type Position = { top: number; left: number }
let pending: { ready: boolean; position?: Position } | undefined
let heldContainer: HTMLElement | undefined

export function beginScreenNavigation() {
  pending = { ready: false }
}
export function holdScreenHeight(element: Element) {
  const parent = element.parentElement
  if (!parent) return
  heldContainer = parent
  parent.style.minHeight = `${parent.getBoundingClientRect().height}px`
}
function applyWhenReady() {
  if (!pending?.ready || !pending.position) return
  const position = pending.position
  pending = undefined
  // The new page is mounted; the old page has already faded out.
  window.scrollTo({ ...position, behavior: 'instant' })
  if (heldContainer) heldContainer.style.minHeight = ''
  heldContainer = undefined
}
export function setScreenScroll(position: Position) {
  if (!pending) return false
  pending.position = position
  applyWhenReady()
  return true
}
export function screenEntered() {
  if (pending) pending.ready = true
  applyWhenReady()
}
export function clearScreenScroll() {
  pending = undefined
  if (heldContainer) heldContainer.style.minHeight = ''
  heldContainer = undefined
}

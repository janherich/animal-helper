/** Reveal an option without scrolling the page or other ancestor containers. */
export function scrollActiveOption(list: HTMLElement | undefined, index: number) {
  const option = list?.querySelectorAll<HTMLElement>('[role=option]')[index]
  if (!list || !option) return
  const viewport = list.getBoundingClientRect()
  const item = option.getBoundingClientRect()
  const top = viewport.top + list.clientTop
  const bottom = top + list.clientHeight
  const delta = item.top < top ? item.top - top : item.bottom > bottom ? item.bottom - bottom : 0
  if (!delta) return
  list.scrollTo({
    top: list.scrollTop + delta,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  })
}

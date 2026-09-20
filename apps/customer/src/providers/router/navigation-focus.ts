// Keep scroll restoration and modal focus ownership intact.
export function focusPageContent(previousControl: Element | null = null) {
  const main = document.getElementById('main-content')
  if (!main || main.closest('[inert]') || document.querySelector('dialog[open]')) return
  const active = document.activeElement
  // Do not steal focus from a control the user reached during the transition.
  if (
    active instanceof HTMLElement &&
    active !== previousControl &&
    main.contains(active) &&
    active.matches('input, textarea, select, button, a[href]')
  )
    return
  main.focus({ preventScroll: true })
}

// Temporary frontend presentation model, NOT an agreed API contract.
// Reconcile with @animal-helper/contracts WalkView before wiring a server adapter.
export type HomeView = {
  screen: 'W01'
  locale: string
  allowedActions: string[]
  props: {
    draft?: {
      heading: string
      title: string
      summary: string[]
      progress: number
      progressLabel: string
      actions: { id: string; label: string; appearance: 'primary' | 'secondary' }[]
    }
    title: string
    description: string
    situationsLabel: string
    situations: { id: string; label: string; icon: string; action: string; appearance: 'primary' | 'secondary' }[]
    anonymousNotice: string
    about: { title: string; description: string }
    sections: { id: string; title: string; paragraphs: string[] }[]
    socials: { label: string; icon: string; action: string }[]
    copyright: string
    previewNotice: string
    actionNotice: string
  }
}

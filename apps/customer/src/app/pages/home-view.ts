// Presentation model for the homepage. Injured and stray starts are persisted by
// the walk adapter; these action ids are not a second command schema.
export type HomeView = {
  screen: 'W01'
  locale: string
  layout: { showMenu: boolean }
  allowedActions: string[]
  // Fixture-only transitions. Replace with server action descriptors and responses.
  previewActions: Record<string, { situation: string; fromDraft: boolean; target: string }>
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
    sections: {
      id: string
      title: string
      expanded?: boolean
      heading?: string
      paragraphs: string[]
      items?: { id: string; label: string; icon?: string; action?: string; accent?: boolean }[]
    }[]
    socials: { label: string; icon: string; action: string }[]
    copyright: string
    previewNotice: string
    actionNotice: string
  }
}

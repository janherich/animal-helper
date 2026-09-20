// Draft presentation contracts. Fixtures implement these types, never define them.
export type DetailQuestion = {
  id: string
  label: string
  hideLabel?: boolean
  kind: 'multiple' | 'single' | 'text'
  placeholder?: string
  required: boolean
  disabled?: boolean
  options: { id: string; label: string; exclusive?: boolean; description?: string; disabled?: boolean }[]
}

export type LocationPoint = { label: string; lat: number; lng: number; source: 'fixture' | 'device' }
export type LocationView = {
  screen: string
  locale: string
  layout: { showMenu: boolean }
  allowedActions: string[]
  backTarget: string
  confirmTarget: string
  backHistoryTargets?: string[]
  map: { imageUrl: string; point: LocationPoint }
  places: (LocationPoint & { title: string; detail: string })[]
  props: {
    back: string
    step: string
    progress: number
    title: string
    description: string
    searchLabel: string
    placeholder: string
    locate: string
    locating: string
    mapLabel: string
    mapHint: string
    preview: string
    results: string
    empty: string
    selected: string
    deviceLabel: string
    denied: string
    unavailable: string
    confirm: string
    confirmed: string
  }
}
export type ProcessingView = {
  screen: string
  thresholdMs: number
  demoDurationMs: number
  title: string
  preview: string
}
export type MediaView = {
  screen: string
  locale: string
  layout: { showMenu: boolean }
  allowedActions: string[]
  backTarget: string
  manualTarget: string
  resultTarget: string
  processing: ProcessingView
  limits: { bytes: number; mimeTypes: string[] }
  props: {
    back: string
    step: string
    progress: number
    title: string
    description: string
    prompt: string
    limit: string
    gallery: string
    pickerHint: string
    add: string
    remove: string
    removed: string
    removedMany: string
    removedDescription: string
    invalidTitle: string
    tooLargeTitle: string
    tooLarge: string
    undo: string
    undoAll: string
    undoTime: string
    dismiss: string
    confirm: string
    manual: string
    preview: string
    confirmed: string
    invalid: string
    unsupportedPreview: string
  }
}
export type AnimalDetailsView = {
  screen: string
  locale: string
  layout: { showMenu: boolean }
  allowedActions: string[]
  backTarget: string
  failedBackTarget: string
  editTarget: string
  manualTarget: string
  confirmTarget: string
  showAnimal?: boolean
  values: Record<string, string | string[]>
  questions: DetailQuestion[]
  copy: {
    back: string
    step: string
    progress: number
    title: string
    description: string
    animal: string
    edit: string
    details: string
    unknown: string
    other: string
    failedTitle: string
    failedDescription: string
    failedPreview: string
    manual: string
    confirm: string
    preview: string
    completed: string
  }
}
export type EditAnimalView = {
  screen: string
  locale: string
  layout: { showMenu: boolean }
  allowedActions: string[]
  backTarget: string
  mediaTarget: string
  manualTarget: string
  copy: {
    back: string
    step: string
    progress: number
    title: string
    description: string
    search: string
    results: string
    empty: string
    media: string
    manual: string
    preview: string
  }
}

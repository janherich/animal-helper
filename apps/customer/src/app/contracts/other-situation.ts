export type OtherSituationChoice = { id: 'road' | 'human' | 'other'; label: string; target: string }
export type OtherSituationView = {
  screen: string
  locale: string
  layout: { showMenu: boolean }
  backTarget: string
  copy: { back: string; title: string }
  choices: readonly OtherSituationChoice[]
}

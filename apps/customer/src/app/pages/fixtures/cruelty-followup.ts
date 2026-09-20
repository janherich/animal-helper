import type { FormValidation } from '../../contracts/validation'
export type CrueltyFollowupView = {
  validation?: FormValidation
  screen: 'W28' | 'W29' | 'W30' | 'W37'
  answerSource?: 'other'
  locale: string
  layout: { showMenu: boolean }
  backTarget: 'W27' | 'W28' | 'W36'
  copy: { back: string; title: string; description?: string; preview: string }
  reasons?: {
    title: string
    options: { id: string; label: string; description?: { placeholder: string; maxLength: number } }[]
  }
  actions: {
    label: string
    target: 'W29' | 'W30' | 'W03' | 'W04'
    outcome?: 'reported' | 'not-reported'
    primary: boolean
  }[]
}
const common = { locale: 'sk', layout: { showMenu: false } }
const preview = 'Lokálna ukážka evidencie prípadu. Odoslanie prípadu zatiaľ nie je zapojené.'
export const policeResultFixture: CrueltyFollowupView = {
  ...common,
  screen: 'W28',
  backTarget: 'W27',
  copy: { back: 'Späť', title: 'Podarilo sa vám útok nahlásiť polícii?', preview },
  actions: [
    { label: 'Podarilo sa nahlásiť', target: 'W29', outcome: 'reported', primary: true },
    { label: 'Nepodarilo sa nahlásiť', target: 'W30', outcome: 'not-reported', primary: false }
  ]
}
export const policeReportedFixture: CrueltyFollowupView = {
  ...common,
  screen: 'W29',
  backTarget: 'W28',
  copy: {
    back: 'Späť',
    title: 'Ďakujeme za nahlásenie polícii. Teraz prípad zaevidujme.',
    description:
      'Pomôžte Zverolinke prípad zdokumentovať. Zadajte polohu a základné údaje o zvierati, aby sme mohli sledovať jeho vyriešenie.',
    preview
  },
  actions: [{ label: 'Zdokumentovať prípad', target: 'W03', primary: true }]
}
export const policeFailedFixture: CrueltyFollowupView = {
  ...common,
  screen: 'W30',
  backTarget: 'W28',
  copy: {
    back: 'Späť',
    title: 'Prípad prevezmeme my',
    description: 'Zaškrtnite, čo sa stalo, a prejdite na zadanie lokality, aby sme mohli zasiahnuť.',
    preview
  },
  reasons: {
    title: 'Prečo sa prípad nepodarilo nahlásiť?',
    options: [
      { id: 'refused', label: 'Polícia odmietla prípad riešiť' },
      { id: 'not-arrived', label: 'Polícia neprišla ani po dlhom čakaní' },
      { id: 'redirected', label: 'Polícia ma odkázala na útulok/obec' },
      { id: 'no-time', label: 'Nemal/a som čas to riešiť' },
      { id: 'other', label: 'Iné', description: { placeholder: 'Opíšte, čo sa stalo', maxLength: 2000 } }
    ]
  },
  actions: [{ label: 'Zdokumentovať prípad', target: 'W03', primary: true }]
}

// Working server presentation contract. Calling and submission are simulated locally.
export type CrueltyView = {
  screen: 'W27'
  locale: string
  layout: { showMenu: boolean }
  backTarget: 'W01'
  allowedActions: ('back' | 'call' | 'continue')[]
  copy: { back: string; title: string; description: string; urgent: string; preview: string }
  safety: { title: string; paragraphs: string[] }
  instructions: { title: string; items: { id: string; text: string }[] }
  actions: {
    call: { label: string; target: 'W28' }
    continue: { label: string; target: 'W03' }
  }
}
export const crueltyFixture: CrueltyView = {
  screen: 'W27',
  locale: 'sk',
  layout: { showMenu: false },
  backTarget: 'W01',
  allowedActions: ['back', 'call', 'continue'],
  copy: {
    back: 'Späť',
    title: 'Prebieha útok na zviera práve teraz?',
    description: 'Ak niekto pred vami zviera násilne bije, dusí, kope, ťahá za autom alebo naň aktívne útočí,',
    urgent: 'okamžite volajte políciu na číslo 158!',
    preview: 'Lokálna ukážka. Tlačidlo volania nespustí hovor ani neodošle hlásenie.'
  },
  safety: {
    title: 'BEZPEČNOSŤ:',
    paragraphs: [
      'Nepokúšajte sa útočníka sami fyzicky zastaviť. Neohrozujte svoje zdravie!',
      'Bezpečne z diaľky urobte fotografiu alebo video.'
    ]
  },
  instructions: {
    title: 'Polícii nadiktujte:',
    items: [
      { id: 'location', text: 'Presnú adresu alebo opis miesta' },
      { id: 'situation', text: 'Čo sa deje a o aké zviera ide' },
      { id: 'ongoing', text: 'Či útok stále pokračuje' },
      { id: 'description', text: 'Opis páchateľa' }
    ]
  },
  actions: {
    call: {
      label: 'Volať na políciu – 158',
      target: 'W28'
    },
    continue: { label: 'Nejde o akútny prípad', target: 'W03' }
  }
}

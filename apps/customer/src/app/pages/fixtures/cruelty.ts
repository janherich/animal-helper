// Working server presentation contract. Mobile calling uses the OS; submission remains local.
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
    call: { label: string; href: string; target: 'W28' }
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
    preview:
      'Na mobile tlačidlo otvorí systémové volanie. Na desktope pokračuje na ďalšiu obrazovku. Hlásenie sa zatiaľ neodosiela.'
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
      href: 'tel:158',
      target: 'W28'
    },
    continue: { label: 'Nejde o akútny prípad', target: 'W03' }
  }
}

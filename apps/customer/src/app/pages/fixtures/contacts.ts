import type { InstructionsView } from './instructions'
// Working presentation contract, not a live directory or a recommendation engine.
export type ContactLink = { label: string; href?: string }
export type ContactBlock =
  | {
      id: string
      kind: 'contact'
      title: string
      distance?: string
      address?: string
      availability?: { label: string; tone: 'open' | 'closing' | 'closed' }
      phone?: ContactLink
      navigation?: ContactLink
    }
  | { id: string; kind: 'notice'; emphasis: 'important' | 'critical'; title: string; description: string }
  | { id: string; kind: 'instructions'; title: string; items: { id: string; text: string }[] }
  | { id: string; kind: 'link'; description: string; link: ContactLink }
export type ContactsView = Omit<InstructionsView, 'screen' | 'blocks' | 'footerActions' | 'allowedActions'> & {
  screen: Exclude<InstructionsView['screen'], 'W22'>
  blocks: ContactBlock[]
  allowedActions: ('back' | 'resolved' | 'alternatives')[]
  footerActions: (
    | { id: 'resolved'; label: string; appearance: 'primary' | 'secondary'; target: 'W24' }
    | { id: 'alternatives'; label: string; appearance: 'primary' | 'secondary'; target: 'W22' }
  )[]
}
export const municipalityFixture: ContactsView = {
  screen: 'W15',
  locale: 'sk',
  layout: { showMenu: false, adviceAction: { label: 'Rady' } },
  backTarget: 'W14',
  footerActions: [
    { id: 'resolved', label: 'Podarilo sa pomôcť', appearance: 'primary', target: 'W24' },
    { id: 'alternatives', label: 'Iné možnosti pomoci', appearance: 'secondary', target: 'W22' }
  ],
  allowedActions: ['back', 'resolved', 'alternatives'],
  copy: {
    back: 'Späť',
    title: 'Kontaktujte mesto alebo obec',
    description: 'Tu sa zobrazí postup a kontakt na mesto alebo obec podľa údajov zo servera.',
    preview: 'Lokálna ukážka kontaktov. Údaje nie sú skutočné; volanie ani navigácia nie sú zapojené.',
    unavailable: 'Ďalší postup zatiaľ nie je zapojený. Žiadne hlásenie sa neodoslalo.'
  },
  blocks: [
    {
      id: 'municipality',
      kind: 'contact',
      title: 'Ukážková obec',
      distance: '300 m',
      address: 'Ukážková adresa obce',
      availability: { label: 'Otvorené 8:00–16:00', tone: 'open' },
      phone: { label: 'Telefón doplní server' }
    }
  ]
}
export const clinicFixture: ContactsView = {
  ...municipalityFixture,
  screen: 'W18',
  copy: {
    ...municipalityFixture.copy,
    title: 'Môžete kontaktovať veterinárnu kliniku',
    description: 'Zoznam kontaktov a ich dostupnosť dodá server.'
  },
  blocks: [
    {
      id: 'cost',
      kind: 'notice',
      emphasis: 'important',
      title: 'Pozor, nebude to bezplatné',
      description: 'Ukážka upozornenia na možné náklady. Podmienky konkrétnej pomoci doplní server.'
    },
    ...(['open', 'closing', 'closed'] as const).map((tone, index): ContactBlock => ({
      id: 'clinic-' + index,
      kind: 'contact',
      title: ['Ukážková klinika Labka', 'Ukážková klinika Chvostík', 'Ukážková klinika Fúzik'][index]!,
      distance: ['300 m', '1,3 km', '2 km'][index]!,
      address: 'Ukážková adresa kliniky',
      availability: { tone, label: ['Otvorené 8:00–16:00', 'Čoskoro zatvára', 'Zatvorené'][index]! },
      phone: { label: 'Telefón doplní server' },
      navigation: { label: 'Navigovať ku klinike' }
    }))
  ]
}
export const policeFixture: ContactsView = {
  ...municipalityFixture,
  screen: 'W20',
  copy: {
    ...municipalityFixture.copy,
    title: 'Zavolajte na políciu',
    description: 'Ukážka kontaktu a pokynov, ktoré pre konkrétny prípad určí server.'
  },
  blocks: [
    { id: 'police', kind: 'contact', title: 'Tiesňové číslo polície', phone: { label: 'Telefón doplní server' } },
    {
      id: 'instructions',
      kind: 'instructions',
      title: 'Polícii nadiktujte:',
      items: [
        { id: 'location', text: 'Miesto udalosti' },
        { id: 'situation', text: 'Informácie o situácii a zvierati' }
      ]
    },
    {
      id: 'important',
      kind: 'notice',
      emphasis: 'important',
      title: 'Dôležité upozornenie',
      description: 'Tu bude doplňujúci pokyn zo servera.'
    },
    {
      id: 'critical',
      kind: 'notice',
      emphasis: 'critical',
      title: 'Veľmi dôležité upozornenie',
      description: 'Ukážka výrazného upozornenia. Konkrétny text a ďalší postup dodá server.'
    }
  ]
}
export const volunteersFixture: ContactsView = {
  ...municipalityFixture,
  screen: 'W21',
  copy: {
    ...municipalityFixture.copy,
    title: 'Obráťte sa na dobrovoľníkov',
    description: 'Tu bude kontakt na dobrovoľníkov vo vašom regióne.'
  },
  blocks: [
    { id: 'volunteers', kind: 'link', description: 'O pomoc môžete požiadať', link: { label: 'našich dobrovoľníkov' } }
  ]
}
export const patrolFixture: ContactsView = {
  ...municipalityFixture,
  screen: 'W36',
  layout: { showMenu: false },
  copy: {
    ...municipalityFixture.copy,
    title: 'Zavolajte diaľničnú patrolu',
    description: 'Kontaktné údaje a postup pre túto situáciu dodá server.'
  },
  blocks: [
    {
      id: 'instructions',
      kind: 'instructions',
      title: 'Do telefónu jasne nadiktujte:',
      items: [
        { id: 'location', text: 'Lokalitu' },
        { id: 'animal', text: 'Druh a stav zvieraťa' }
      ]
    },
    {
      id: 'patrol',
      kind: 'contact',
      title: 'Ukážková diaľničná patrola',
      distance: '900 m',
      address: 'Ukážková adresa',
      phone: { label: 'Telefón doplní server' }
    }
  ]
}
export const contactsShowcaseFixture: ContactsView = {
  ...municipalityFixture,
  copy: {
    ...municipalityFixture.copy,
    title: 'Možnosti kontaktovania',
    description: 'Prehľad všetkých podporovaných kontaktných kariet a upozornení v jednej ukážke.'
  },
  blocks: [municipalityFixture, clinicFixture, policeFixture, volunteersFixture, patrolFixture].flatMap(view =>
    view.blocks.map(block => ({ ...block, id: `${view.screen}-${block.id}` }))
  )
}
export const contactFixtures = [contactsShowcaseFixture, clinicFixture, policeFixture, volunteersFixture, patrolFixture]

export function safeContactHref(href: string | undefined, type: 'phone' | 'web'): string | undefined {
  if (!href) return undefined
  if (type === 'phone') return /^tel:\+?[\d ()-]+$/.test(href) ? href : undefined
  try {
    const url = new URL(href)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}

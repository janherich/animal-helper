import type { HomeView } from '../home-view'

// FIXTURE ONLY: Slovak copy from Figma; action IDs are provisional, not API commands.
export const homeFixture: HomeView = {
  screen: 'W01',
  locale: 'sk',
  layout: { showMenu: true },
  allowedActions: [
    'start-injured',
    'start-stray',
    'start-dead',
    'start-cruelty',
    'start-other',
    'faq-capture',
    'faq-cost',
    'faq-bird',
    'faq-all',
    'legal-privacy',
    'legal-terms'
  ],
  previewActions: {
    'start-injured': { situation: 'injured', fromDraft: false, target: 'W03' },
    'start-stray': { situation: 'stray', fromDraft: false, target: 'W03' },
    'start-dead': { situation: 'dead', fromDraft: false, target: 'W03' },
    'start-cruelty': { situation: 'cruelty', fromDraft: false, target: 'W27' },
    'start-other': { situation: 'other', fromDraft: false, target: 'W32' }
  },
  props: {
    title: 'Čo sa stalo?',
    description: 'Vyberte, o akú situáciu ide. Spolu sa pozrieme na to, ako pomôcť.',
    situationsLabel: 'Výber situácie',
    situations: [
      {
        id: 'injured',
        label: 'Zviera je zranené',
        icon: 'help-injured',
        action: 'start-injured',
        appearance: 'primary'
      },
      { id: 'stray', label: 'Zviera je zatúlané', icon: 'help-stray', action: 'start-stray', appearance: 'primary' },
      { id: 'dead', label: 'Nález mŕtveho zvieraťa', icon: 'help-dead', action: 'start-dead', appearance: 'primary' },
      {
        id: 'cruelty',
        label: 'Týranie/zanedbávanie zvieraťa',
        icon: 'help-cruelty',
        action: 'start-cruelty',
        appearance: 'primary'
      },
      { id: 'other', label: 'Iné', icon: 'other-cases', action: 'start-other', appearance: 'secondary' }
    ],
    anonymousNotice: 'Hlásenie môžete podať plne anonymne.',
    about: { title: 'Zverolinka', description: 'Prvý kontakt pri záchrane zvierat.' },
    // Expanded content is deliberately labelled until approved copy is available.
    sections: [
      {
        id: 'faq',
        title: 'Často kladené otázky',
        expanded: true,
        paragraphs: [],
        items: [
          { id: 'capture', label: 'Ako bezpečne odchytiť zranené zviera?', icon: 'faq-forward', action: 'faq-capture' },
          { id: 'cost', label: 'Kto platí ošetrenie voľne žijúceho zvieraťa?', icon: 'faq-forward', action: 'faq-cost' },
          { id: 'bird', label: 'Čo robiť, ak nájdem vypadnuté vtáča?', icon: 'faq-forward', action: 'faq-bird' },
          { id: 'all', label: 'Prejsť na všetky FAQs', action: 'faq-all', accent: true }
        ]
      },
      {
        id: 'contact',
        title: 'Kontakt',
        expanded: true,
        heading: 'Zverolinka o.z.',
        paragraphs: [],
        items: [
          { id: 'address', label: 'Račianska 62, 821 08 Bratislava', icon: 'place' },
          { id: 'email', label: 'info@zverolinka.sk', icon: 'email' },
          { id: 'web', label: 'www.zverolinka.sk', icon: 'web' }
        ]
      },
      {
        id: 'legal',
        title: 'Právne informácie',
        paragraphs: ['Ukážkový obsah: schválené právne dokumenty a ich odkazy doplní server.'],
        items: [
          { id: 'privacy', label: 'Ochrana osobných údajov', action: 'legal-privacy', accent: true },
          { id: 'terms', label: 'Podmienky používania', action: 'legal-terms', accent: true }
        ]
      }
    ],
    socials: [
      { label: 'Facebook', icon: 'facebook', action: 'social-facebook' },
      { label: 'Instagram', icon: 'instagram', action: 'social-instagram' },
      { label: 'LinkedIn', icon: 'linkedin', action: 'social-linkedin' },
      { label: 'TikTok', icon: 'tiktok', action: 'social-tiktok' }
    ],
    copyright: '© 2026 Zverolinka. Všetky práva vyhradené.',
    previewNotice: 'Ukážka s fixture dátami. Hlásenie ešte nie je možné odoslať.',
    actionNotice: 'Ukážkový režim: výber sa neodoslal. Ďalší krok doplníme po napojení backendu.'
  }
}

// Figma W01 draft variant, node 2120:13168. No real case is loaded or modified.
export const homeDraftFixture: HomeView = {
  ...homeFixture,
  allowedActions: [...homeFixture.allowedActions, 'draft-complete', 'draft-resume'],
  previewActions: {
    ...homeFixture.previewActions,
    'draft-resume': { situation: 'injured', fromDraft: true, target: 'W03' }
  },
  props: {
    ...homeFixture.props,
    draft: {
      heading: 'Rozpracovaný prípad',
      title: 'Rozpracovaný prípad',
      summary: ['Zranené zviera', 'Bocian', 'Dolné Orešany'],
      progress: 35,
      progressLabel: 'Dokončenie hlásenia',
      actions: [
        { id: 'draft-complete', label: 'Vybavené', appearance: 'secondary' },
        { id: 'draft-resume', label: 'Pokračovať', appearance: 'primary' }
      ]
    }
  }
}

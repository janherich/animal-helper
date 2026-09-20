// Working presentation model. Submission and consent processing are not connected.
export type ThankYouView = {
  screen: 'W24' | 'W25' | 'W26' | 'W38' | 'W39'
  locale: string
  layout: { showMenu: boolean }
  backTarget: string
  allowedActions: ('back' | 'submit')[]
  copy: { back: string; title: string; description: string; preview: string; submit: string; unavailable: string }
  fields: {
    id: string
    label: string
    placeholder: string
    type: 'text' | 'tel' | 'email'
    autocomplete: 'name' | 'tel' | 'email'
    required: boolean
    maxLength: number
  }[]
  consents: { id: string; label: string; required: boolean }[]
  contactIntro?: { title: string; description: string }
  reasonGroups?: NonNullable<ThankYouView['reasons']>[]
  help?: { title: string; description: string; action: { label: string; target: 'W14' | 'W15'; enabled: boolean } }
  reasons?: {
    title: string
    options: {
      id: string
      label: string
      description?: { placeholder: string; required: boolean; maxLength: number }
    }[]
  }
}
function createUnsuccessfulThankYou(): ThankYouView {
  return {
    ...thankYouFixture,
    screen: 'W25',
    backTarget: 'W22',
    copy: { ...thankYouFixture.copy, title: 'Ďakujeme za vašu snahu', description: '' },
    contactIntro: {
      title: 'Vaša pomoc sa nemusí skončiť týmto prípadom.',
      description:
        'Nechajte nám e-mail a budeme s vami zdieľať informácie, ako pomáhať zvieratám. Váš kontakt bez súhlasu nikomu nesprístupníme.'
    },
    reasons: {
      title: 'Prečo sa nepodarilo pomôcť zvieraťu?',
      options: [
        { id: 'municipality-unanswered', label: 'Na obecnom/mestskom úrade mi nezdvihli' },
        { id: 'municipality-refused', label: 'Na obecnom/mestskom úrade odmietli pomôcť alebo prísť' },
        { id: 'municipality-referred', label: 'Obec ma odkázala na niekoho iného' },
        { id: 'clinic-closed', label: 'Veterinárna klinika bola zatvorená' },
        { id: 'clinic-refused', label: 'Na klinike odmietli zviera prijať' },
        { id: 'police-refused', label: 'Polícia odmietla prípad riešiť' },
        { id: 'police-absent', label: 'Polícia neprišla ani po dlhom čakaní' },
        { id: 'police-referred', label: 'Polícia ma odkázala na útulok/obec' },
        { id: 'aggressive', label: 'Zviera bolo agresívne, bál/a som sa ho chytiť' },
        { id: 'escaped', label: 'Zviera utieklo/schovalo sa' },
        { id: 'equipment', label: 'Nemal/a som pomôcky (deku, krabicu, rukavice)' },
        { id: 'unable', label: 'Manipulácia so zvieraťom bola nad moje sily' },
        { id: 'volunteers', label: 'Dobrovoľníci neboli k dispozícii' },
        { id: 'died', label: 'Zviera na mieste uhynulo' },
        { id: 'time', label: 'Nemal/a som čas to riešiť' },
        { id: 'resolved-otherwise', label: 'Situácia sa vyriešila sama (pomohol niekto iný/zviera našlo majiteľa)' },
        {
          id: 'other',
          label: 'Iné',
          description: { placeholder: 'Opíšte, čo sa stalo', required: false, maxLength: 2000 }
        }
      ]
    }
  }
}
export const thankYouFixture: ThankYouView = {
  screen: 'W24',
  locale: 'sk',
  layout: { showMenu: false },
  backTarget: 'W15',
  allowedActions: ['back', 'submit'],
  copy: {
    back: 'Späť',
    title: 'Ďakujeme za vašu pomoc',
    description:
      'Zanechajte nám kontakt a dáme vám vedieť, ako prípad dopadol. Ak kontakt neuvediete, hlásenie odošleme anonymne.',
    preview: 'Lokálna ukážka formulára. Použite iba testovacie údaje; nič sa neodosiela ani neukladá na server.',
    submit: 'Odoslať a ukončiť',
    unavailable: 'Odosielanie zatiaľ nie je napojené. Hlásenie ani kontaktné údaje neboli odoslané.'
  },
  fields: [
    {
      id: 'name',
      label: 'Meno a priezvisko (nepovinné)',
      placeholder: 'Zadajte meno a priezvisko',
      type: 'text',
      autocomplete: 'name',
      required: false,
      maxLength: 200
    },
    {
      id: 'phone',
      label: 'Telefónne číslo (nepovinné)',
      placeholder: '+421 xxx xxx xxx',
      type: 'tel',
      autocomplete: 'tel',
      required: false,
      maxLength: 40
    },
    {
      id: 'email',
      label: 'E-mail (nepovinné)',
      placeholder: 'email@email.sk',
      type: 'email',
      autocomplete: 'email',
      required: false,
      maxLength: 254
    }
  ],
  consents: [
    {
      id: 'share-contact',
      label:
        'Súhlasím s postúpením môjho kontaktu zasahujúcim orgánom (štátna veterina alebo iný štátny orgán). Môže to urýchliť riešenie prípadu.',
      required: false
    },
    {
      id: 'newsletter',
      label: 'Chcem dostávať pravidelné informácie o Zverolinke a o tom, ako pomáhať zvieratám.',
      required: false
    }
  ]
}
export const unsuccessfulThankYouFixture = createUnsuccessfulThankYou()
export const pendingThankYouFixture: ThankYouView = {
  ...thankYouFixture,
  screen: 'W26',
  copy: { ...thankYouFixture.copy, title: 'Uzatvorenie prípadu', description: '' },
  contactIntro: unsuccessfulThankYouFixture.contactIntro!,
  reasons: {
    title: 'Ako situácia dopadla?',
    options: [
      { id: 'resolved', label: 'Prípad sa podarilo úspešne vyriešiť' },
      { id: 'unresolved', label: 'Prípad sa nepodarilo vyriešiť' },
      {
        id: 'resolved-otherwise',
        label: 'Situácia sa vyriešila sama (zviera odišlo/pomohol niekto iný/zviera našlo majiteľa)'
      },
      {
        id: 'other',
        label: 'Iné',
        description: { placeholder: 'Opíšte, čo sa stalo', required: false, maxLength: 2000 }
      }
    ]
  }
}
export const helpThankYouFixture: ThankYouView = {
  ...thankYouFixture,
  screen: 'W38',
  copy: { ...thankYouFixture.copy, description: '' },
  contactIntro: unsuccessfulThankYouFixture.contactIntro!,
  help: {
    title: 'Zviera žije a potrebuje ošetrenie?',
    description: 'Ak zviera potrebuje záchranu či ošetrenie, pomôžeme vám nájsť správnu pomoc.',
    action: { label: 'Zobraziť možnosti pomoci', target: 'W14', enabled: true }
  }
}
export const noUpdateThankYouFixture: ThankYouView = {
  ...thankYouFixture,
  screen: 'W39',
  copy: { ...thankYouFixture.copy, description: '' },
  contactIntro: unsuccessfulThankYouFixture.contactIntro!
}
export const thankYouShowcaseFixture: ThankYouView = {
  ...thankYouFixture,
  copy: {
    ...thankYouFixture.copy,
    preview:
      'Lokálna ukážka všetkých blokov poďakovania. V reálnom hlásení server vyberie iba relevantný obsah. Použite testovacie údaje; nič sa neodosiela.'
  },
  contactIntro: noUpdateThankYouFixture.contactIntro!,
  help: helpThankYouFixture.help!,
  reasonGroups: [unsuccessfulThankYouFixture.reasons!, pendingThankYouFixture.reasons!].map((group, index) => ({
    ...group,
    options: group.options.map(option => ({ ...option, id: `${index}:${option.id}` }))
  }))
}
export const thankYouFixtures: ThankYouView[] = [
  thankYouShowcaseFixture,
  {
    ...thankYouShowcaseFixture,
    screen: 'W25',
    copy: { ...thankYouShowcaseFixture.copy, title: unsuccessfulThankYouFixture.copy.title }
  },
  pendingThankYouFixture,
  helpThankYouFixture,
  noUpdateThankYouFixture
]

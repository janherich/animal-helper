// Working presentation contract. Real instructions must be supplied and approved by the server.
export type HelpText = { text: string; emphasis?: 'strong' | 'em'; href?: string }[]
export type SelfHelpBlock =
  | { id: string; kind: 'section'; title: string; paragraphs: HelpText[] }
  | { id: string; kind: 'list'; title: string; ordered: boolean; items: { id: string; content: HelpText }[] }
  | { id: string; kind: 'notice'; tone: 'danger' | 'warning'; title: string; content: HelpText }
  | { id: string; kind: 'divider' }
export type SelfHelpView = {
  screen: 'W22'
  locale: string
  layout: { showMenu: boolean; adviceAction: { label: string } }
  backTarget: string
  actionTargets: { resolved: 'W24'; unresolved: 'W25' }
  allowedActions: ('back' | 'resolved' | 'unresolved')[]
  copy: {
    title: string
    description: string
    back: string
    preview: string
    resolved: string
    unresolved: string
    unavailable: string
  }
  blocks: SelfHelpBlock[]
}
export const selfHelpFixture: SelfHelpView = {
  screen: 'W22',
  locale: 'sk',
  layout: { showMenu: false, adviceAction: { label: 'Rady' } },
  backTarget: 'W15',
  actionTargets: { resolved: 'W24', unresolved: 'W25' },
  allowedActions: ['back', 'resolved', 'unresolved'],
  copy: {
    title: 'Pomôžte sami',
    description: 'Tu sa zobrazí postup pomoci prispôsobený vášmu hláseniu.',
    back: 'Späť',
    preview: 'Lokálna ukážka rozloženia. Texty nie sú pokynmi na ošetrenie ani manipuláciu so zvieraťom.',
    resolved: 'Podarilo sa pomôcť',
    unresolved: 'Nepodarilo sa pomôcť',
    unavailable: 'Nasledujúca stránka zatiaľ nie je pripravená. Žiadny výsledok sa neodoslal.'
  },
  blocks: [
    {
      id: 'warning',
      kind: 'notice',
      tone: 'danger',
      title: 'Ukážka dôležitého upozornenia',
      content: [{ text: 'Konkrétne upozornenie pre tento prípad dodá server.' }]
    },
    {
      id: 'preparation',
      kind: 'section',
      title: 'Príprava na pomoc',
      paragraphs: [
        [{ text: 'Na tomto mieste bude úvodný text postupu schváleného pre danú situáciu.' }],
        [{ text: 'Dôležité časti', emphasis: 'strong' }, { text: ' môžu byť zvýraznené priamo v odseku.' }]
      ]
    },
    {
      id: 'steps',
      kind: 'list',
      title: 'Postup pomoci',
      ordered: true,
      items: [
        { id: 'first', content: [{ text: 'Prvý krok doplní server podľa údajov z hlásenia.' }] },
        {
          id: 'second',
          content: [{ text: 'Ďalší krok môže obsahovať ' }, { text: 'doplňujúce vysvetlenie.', emphasis: 'em' }]
        }
      ]
    },
    { id: 'divider', kind: 'divider' },
    {
      id: 'notes',
      kind: 'list',
      title: 'Doplňujúce informácie',
      ordered: false,
      items: [{ id: 'note', content: [{ text: 'Počet, poradie aj obsah týchto bodov určuje server.' }] }]
    },
    {
      id: 'important',
      kind: 'notice',
      tone: 'warning',
      title: 'Ďalšie upozornenie',
      content: [{ text: 'Aj tento blok je iba ukážkou formátovania, nie konkrétnou radou.' }]
    }
  ]
}

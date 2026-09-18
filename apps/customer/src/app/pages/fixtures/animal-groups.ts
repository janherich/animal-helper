// Temporary presentation fixture, not a backend contract or a complete animal catalogue.
export type AnimalGroupsView = {
  screen: 'W06a'
  locale: string
  layout: { showMenu: boolean }
  backTarget: string
  allowedActions: ('back' | 'select-group' | 'search' | 'select-animal' | 'confirm')[]
  copy: {
    restart: string
    alternatives: string
    unknown: string
    description: string
    confirm: string
    completed: string
  }
  props: {
    back: string
    step: string
    progress: number
    title: string
    description: string
    search: string
    preview: string
    results: string
    empty: string
  }
  root: AnimalBranch
}

export type AnimalNode = AnimalBranch | { kind: 'animal'; id: string; label: string; detail: string; imageUrl?: string }

export type AnimalBranch = {
  kind: 'branch'
  id: string
  label: string
  otherLabel: string
  imageUrl?: string
  children: AnimalNode[]
}

const animal = (id: string, label: string, detail: string): AnimalNode => ({ kind: 'animal', id, label, detail })
const branch = (id: string, label: string, otherLabel: string, children: AnimalNode[]): AnimalBranch => ({
  kind: 'branch',
  id,
  label,
  otherLabel,
  children
})

// Deliberately small test tree: not a production taxonomy or exhaustive catalogue.
export const animalGroupsFixture: AnimalGroupsView = {
  screen: 'W06a',
  locale: 'sk',
  layout: { showMenu: false },
  backTarget: 'W04',
  allowedActions: ['back', 'select-group', 'search', 'select-animal', 'confirm'],
  copy: {
    restart: 'Začať výber odznova',
    alternatives: 'Ďalšie možnosti',
    unknown: 'Neviem identifikovať',
    description: 'Popis zvieraťa',
    confirm: 'Potvrdiť voľbu',
    completed: 'Výber je uložený iba v lokálnej ukážke. Krok 3 – Údaje o zvierati ešte pripravujeme.'
  },
  props: {
    back: 'Späť',
    step: 'Krok 2 z 4',
    progress: 50,
    title: 'O aké zviera ide?',
    description: 'Vyhľadajte zviera alebo ho nájdite postupným výberom.',
    search: 'Vyhľadať zviera',
    preview: 'Testovacia hierarchia, nie finálny číselník. Obrázky a ďalšie kroky doplníme neskôr.',
    results: 'Ukážkové zvieratá',
    empty: 'V ukážkovom číselníku sa nenašla zhoda.'
  },
  root: branch('root', 'O aké zviera ide?', 'Iné zviera', [
    branch('domestic', 'Domáce zvieratá', 'Iné domáce zviera', [
      branch('cats', 'Mačky', 'Iný druh mačky', [animal('cat-domestic', 'Mačka domáca', 'Domáce zvieratá · Mačky')]),
      branch('dogs', 'Psy', 'Iný druh psa', [animal('dog', 'Pes domáci', 'Domáce zvieratá · Psy')]),
      branch('small-pets', 'Drobné cicavce', 'Iný drobný cicavec', [
        animal('hamster', 'Škrečok zlatý', 'Domáce zvieratá · Drobné cicavce'),
        animal('guinea-pig', 'Morča domáce', 'Domáce zvieratá · Drobné cicavce')
      ]),
      branch('aquarium', 'Akváriové zvieratá', 'Iné akváriové zviera', [
        branch('fish', 'Ryby', 'Iný druh ryby', [
          branch('freshwater', 'Sladkovodné ryby', 'Iný druh sladkovodnej ryby', [
            animal('guppy', 'Gupka dúhová', 'Domáce zvieratá · Akváriové zvieratá · Ryby · Sladkovodné ryby'),
            animal('betta', 'Bojovnica pestrá', 'Domáce zvieratá · Akváriové zvieratá · Ryby · Sladkovodné ryby')
          ])
        ]),
        branch('invertebrates', 'Bezstavovce', 'Iný bezstavovec', [
          animal('shrimp', 'Krevetka čerešňová', 'Domáce zvieratá · Akváriové zvieratá · Bezstavovce')
        ])
      ]),
      branch('pet-birds', 'Chované vtáky', 'Iný chovaný vták', [
        animal('budgie', 'Andulka vlnkovaná', 'Domáce zvieratá · Chované vtáky'),
        animal('cockatiel', 'Korela chocholatá', 'Domáce zvieratá · Chované vtáky')
      ])
    ]),
    branch('farm', 'Hospodárske zvieratá', 'Iné hospodárske zviera', [
      branch('juvenile', 'Mláďa', 'Iné mláďa', [
        animal('calf', 'Teľa', 'Hospodárske zvieratá · Mláďa'),
        animal('lamb', 'Jahňa', 'Hospodárske zvieratá · Mláďa'),
        animal('foal', 'Žriebä', 'Hospodárske zvieratá · Mláďa')
      ]),
      branch('poultry', 'Hydina', 'Iný druh hydiny', [
        animal('chicken', 'Sliepka domáca', 'Hospodárske zvieratá · Hydina'),
        animal('duck', 'Kačica domáca', 'Hospodárske zvieratá · Hydina')
      ]),
      branch('livestock', 'Hospodárske cicavce', 'Iný hospodársky cicavec', [
        branch('small-livestock', 'Ovce a kozy', 'Iný druh ovce alebo kozy', [
          animal('sheep', 'Ovca domáca', 'Hospodárske zvieratá · Hospodárske cicavce · Ovce a kozy'),
          animal('goat', 'Koza domáca', 'Hospodárske zvieratá · Hospodárske cicavce · Ovce a kozy')
        ]),
        branch('large-livestock', 'Veľké hospodárske zvieratá', 'Iné veľké hospodárske zviera', [
          animal('horse', 'Kôň domáci', 'Hospodárske zvieratá · Hospodárske cicavce · Veľké hospodárske zvieratá'),
          animal('cattle', 'Tur domáci', 'Hospodárske zvieratá · Hospodárske cicavce · Veľké hospodárske zvieratá')
        ])
      ])
    ])
  ])
}

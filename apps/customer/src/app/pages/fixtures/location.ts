// Temporary presentation data. Neither these actions nor the transition are API contracts.
export type LocationPoint = { label: string; lat: number; lng: number; source: 'fixture' | 'device' }
export const locationFixture = {
  screen: 'W03a',
  locale: 'sk',
  allowedActions: ['back', 'confirm-location'],
  backTarget: 'W01',
  props: {
    back: 'Späť',
    step: 'Krok 1 z 4',
    progress: 25,
    title: 'Kde sa zviera nachádza?',
    description: 'Zadajte adresu alebo vyberte lokalitu na mape.',
    searchLabel: 'Vyhľadať lokalitu',
    placeholder: 'Mesto, PSČ, ulica…',
    locate: 'Použiť moju polohu',
    locating: 'Zisťujem polohu…',
    mapLabel: 'Ukážková mapa — vybrať Dolné Orešany',
    mapHint: 'Označte polohu',
    preview: 'Ukážková mapa a výsledky, nie živé Google Maps. Poloha sa nikam neodosiela.',
    results: 'Ukážkové lokality',
    empty: 'V ukážkových dátach sa nenašla zhoda.',
    selected: 'Vybraná poloha',
    deviceLabel: 'Moja poloha',
    denied: 'Prístup k polohe nebol povolený. Vyberte lokalitu vyhľadaním.',
    unavailable: 'Polohu sa nepodarilo zistiť. Skúste vyhľadávanie.',
    confirm: 'Potvrdiť polohu',
    confirmed: 'Poloha potvrdená iba v ukážke. Ďalší krok a uloženie na server ešte nie sú zapojené.'
  },
  places: [
    {
      label: 'Dolné Orešany',
      title: 'Dolné Orešany',
      detail: 'Okres Trnava • Slovensko',
      lat: 48.433,
      lng: 17.43,
      source: 'fixture'
    },
    {
      label: 'Bratislava, Hlavné námestie',
      title: 'Hlavné námestie',
      detail: 'Bratislava • Staré Mesto',
      lat: 48.1439,
      lng: 17.1086,
      source: 'fixture'
    },
    {
      label: 'Trnava, Trojičné námestie',
      title: 'Trojičné námestie',
      detail: 'Trnava • Centrum',
      lat: 48.3775,
      lng: 17.5872,
      source: 'fixture'
    }
  ] satisfies (LocationPoint & { title: string; detail: string })[]
}
export type LocationView = typeof locationFixture

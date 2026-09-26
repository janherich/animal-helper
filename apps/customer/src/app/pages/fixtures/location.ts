import type { LocationPoint, LocationView } from '../../contracts/forms'
export type { LocationPoint, LocationView } from '../../contracts/forms'
// Temporary presentation data. Neither these actions nor the transition are API contracts.
import mapImage from '@/assets/brand/location-preview.png'
export const locationFixture: LocationView = {
  screen: 'W03a',
  locale: 'sk',
  layout: { showMenu: false },
  allowedActions: ['back', 'confirm-location'],
  backTarget: 'W01',
  confirmTarget: 'W04',
  map: {
    imageUrl: mapImage,
    point: { label: 'Dolné Orešany', lat: 48.433, lng: 17.43, source: 'fixture' } satisfies LocationPoint
  },
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
    preview: 'Ukážková mapa a výsledky, nie živé Google Maps. Potvrdená poloha sa uloží k hláseniu.',
    results: 'Ukážkové lokality',
    empty: 'V ukážkových dátach sa nenašla zhoda.',
    selected: 'Vybraná poloha',
    deviceLabel: 'Moja poloha',
    denied: 'Prístup k polohe nebol povolený. Vyberte lokalitu vyhľadaním.',
    unavailable: 'Polohu sa nepodarilo zistiť. Skúste vyhľadávanie.',
    confirm: 'Potvrdiť polohu',
    confirmed: 'Poloha je uložená k hláseniu.'
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

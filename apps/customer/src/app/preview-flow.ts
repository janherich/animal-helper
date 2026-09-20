import { ref } from 'vue'
import type { AnimalIdentification } from './animal-identification'
import type { LocationPoint } from './pages/fixtures/location'

// In-memory fixture session only. Replace with a validated server view adapter.
export const previewSession = ref<{
  situation: string
  fromDraft: boolean
  otherSituation?: 'road' | 'human' | 'other'
  otherReport?: { reasons: string[]; description?: string }
  documentingOther?: boolean
  crueltyReport?: { outcome: 'reported' | 'not-reported'; reasons: string[]; description?: string }
  editingAnimal?: boolean
  identificationFailed?: boolean
  adviceReady?: boolean
  thankYouReturnTarget?: 'W15' | 'W18' | 'W20' | 'W21' | 'W36' | 'W22' | 'W09'
  animalDetails?: Record<string, string | string[]>
  location?: LocationPoint
  media?: File[]
  animalIdentification?: AnimalIdentification
} | null>(null)

export function beginPreview(situation: string, fromDraft = false) {
  previewSession.value = { situation, fromDraft }
}

export function finishPreview() {
  previewSession.value = null
}

export function confirmPreviewLocation(location: LocationPoint) {
  const session = previewSession.value
  if (!session) return
  if (session.location?.lat !== location.lat || session.location?.lng !== location.lng) {
    session.adviceReady = false
    delete session.thankYouReturnTarget
    delete session.otherReport
    delete session.documentingOther
    // Road contacts have their own availability guard, independent of adviceReady.
    if (session.animalDetails) delete session.animalDetails.road
  }
  session.location = { ...location }
}

export function confirmAnimalIdentification(identification: AnimalIdentification) {
  const session = previewSession.value
  if (!session) return
  session.animalIdentification = { ...identification, path: [...identification.path] }
  session.editingAnimal = false
  session.identificationFailed = false
  session.adviceReady = false
}

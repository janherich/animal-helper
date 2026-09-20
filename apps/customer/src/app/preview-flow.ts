import { ref } from 'vue'
import type { AdviceView } from './pages/fixtures/advice'
import type { LocationPoint } from './pages/fixtures/location'

// In-memory fixture session only. Replace with a validated server view adapter.
export const previewSession = ref<{
  situation: string
  fromDraft: boolean
  crueltyReport?: { outcome: 'reported' | 'not-reported'; reasons: string[]; description?: string }
  editingAnimal?: boolean
  identificationFailed?: boolean
  adviceReady?: boolean
  thankYouReturnTarget?: 'W15' | 'W18' | 'W20' | 'W21' | 'W36' | 'W22'
  adviceView?: AdviceView
  animalDetails?: Record<string, string | string[]>
  location?: LocationPoint
  media?: File[]
  animalGroup?: string
  animalSpecies?: string
  animalCategory?: string
  animalPath?: string[]
  animalIdentification?: {
    kind: 'species' | 'other' | 'unknown'
    groupId?: string
    path?: string[]
    categoryId?: string
    speciesId?: string
    description?: string
  }
} | null>(null)

export function beginPreview(situation: string, fromDraft = false) {
  previewSession.value = { situation, fromDraft }
}

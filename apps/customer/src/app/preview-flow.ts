import { ref } from 'vue'
import type { LocationPoint } from './pages/fixtures/location'

// In-memory fixture session only. Replace with a validated server view adapter.
export const previewSession = ref<{
  situation: string
  fromDraft: boolean
  location?: LocationPoint
} | null>(null)

export function beginPreview(situation: string, fromDraft = false) {
  previewSession.value = { situation, fromDraft }
}

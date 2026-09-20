import { afterEach, expect, it } from 'vitest'
import { beginPreview, confirmAnimalIdentification, previewSession } from '../preview-flow'

afterEach(() => {
  previewSession.value = null
})
it('replaces the complete result and copies its path only at confirmation', () => {
  beginPreview('injured')
  const path = ['domestic', 'cats']
  confirmAnimalIdentification({ kind: 'species', speciesId: 'cat-domestic', path })
  path.push('not-confirmed')
  expect(previewSession.value?.animalIdentification?.path).toEqual(['domestic', 'cats'])
  confirmAnimalIdentification({ kind: 'other', description: 'Another cat', path: ['domestic', 'cats'] })
  expect(previewSession.value?.animalIdentification?.speciesId).toBeUndefined()
  previewSession.value!.adviceReady = true
  previewSession.value!.editingAnimal = true
  confirmAnimalIdentification({ kind: 'unknown', path: ['domestic'] })
  expect(previewSession.value?.animalIdentification).toEqual({ kind: 'unknown', path: ['domestic'] })
  expect(previewSession.value?.editingAnimal).toBe(false)
  expect(previewSession.value?.adviceReady).toBe(false)
})

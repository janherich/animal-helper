import { afterEach, expect, it } from 'vitest'
import { previewAccess } from '../pages/fixtures/preview-server'
import {
  beginPreview,
  confirmAnimalIdentification,
  confirmPreviewLocation,
  finishPreview,
  previewSession
} from '../preview-flow'

afterEach(() => {
  previewSession.value = null
})
it('releases a completed session and blocks protected screens', () => {
  beginPreview('injured')
  previewSession.value!.media = [new File(['image'], 'test.png')]
  finishPreview()
  expect(previewSession.value).toBeNull()
  for (const screen of ['W04', 'W09', 'W15', 'W24', 'W36']) expect(previewAccess(screen)).toEqual({ name: 'W01' })
})
it('invalidates location-dependent results only when coordinates change', () => {
  beginPreview('other')
  const session = previewSession.value!
  session.otherSituation = 'road'
  const point = { lat: 48, lng: 17, label: 'A', source: 'fixture' as const }
  confirmPreviewLocation(point)
  confirmAnimalIdentification({ kind: 'unknown', path: ['domestic'] })
  session.animalDetails = { road: 'highway', notes: 'Retain' }
  session.adviceReady = true
  session.thankYouReturnTarget = 'W36'
  confirmPreviewLocation({ ...point, label: 'Renamed' })
  expect(session.adviceReady).toBe(true)
  confirmPreviewLocation({ ...point, lat: 49 })
  expect(session.adviceReady).toBe(false)
  expect(session.animalIdentification?.kind).toBe('unknown')
  expect(session.animalDetails).toEqual({ notes: 'Retain' })
  expect(session.thankYouReturnTarget).toBeUndefined()
  expect(previewAccess('W36')).toEqual({ name: 'W01' })
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

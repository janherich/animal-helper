import { createIdbRecordStore, type IdbRecordStore } from '@animal-helper/client/browser'
import type { WalkFacts } from '@animal-helper/guidance'
import type { AnimalIdentification } from '../animal-identification'
import type { LocationPoint } from '../contracts/forms'

export type WalkCheckpoint = {
  facts: WalkFacts
  location?: LocationPoint
  animalIdentification?: AnimalIdentification
  animalDetails?: Record<string, string | string[]>
  adviceReady?: boolean
}

export function createWalkCheckpoint(indexedDb: IDBFactory): IdbRecordStore<WalkCheckpoint> {
  return createIdbRecordStore<WalkCheckpoint>(indexedDb, 'animal-helper.walk', 'walk')
}

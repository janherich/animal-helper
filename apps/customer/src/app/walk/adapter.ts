import {
  createCaseSession,
  createFetchTransport,
  createMemoryCaseStore,
  type CaseSession,
  type ClientError
} from '@animal-helper/client'
import { createIdbCaseStore, type IdbRecordStore } from '@animal-helper/client/browser'
import {
  bundledPublicGuidance,
  findAnimalKind,
  parsePublicGuidance,
  resumeWalkView,
  walkViewAfterPath,
  type PublicGuidance,
  type WalkFacts
} from '@animal-helper/guidance'
import type { AnimalIdentification } from '../animal-identification'
import type { LocationPoint } from '../contracts/forms'
import { fixtureFlowActions } from '../pages/fixtures/flow-actions'
import { previewDraftProgress } from '../pages/fixtures/preview-server'
import { suspendedPreview } from '../pages/fixtures/preview-session'
import type { HomeView } from '../pages/home-view'
import { previewSession } from '../preview-flow'
import { notify } from '../toasts'
import { apiBaseUrl } from './api'
import { createWalkCheckpoint, type WalkCheckpoint } from './checkpoint'

type ServerSituation = 'injured' | 'stray'
type DetailAnswers = Record<string, string | string[]>
type ContactReport = {
  name?: string | undefined
  phone?: string | undefined
  email?: string | undefined
  shareWithAuthorities: boolean
  newsletter: boolean
}

const presentationRoutes: Record<string, string> = {
  '/w03': 'W03',
  '/w04': 'W04',
  '/w09': 'W09',
  '/w13': 'W13',
  '/w14': 'W14',
  '/w15': 'W15',
  '/w18': 'W18',
  '/w20': 'W20',
  '/w21': 'W21',
  '/w22': 'W22',
  '/w24': 'W24',
  '/w26': 'W26'
}

const symptoms = {
  bleeding: 'bleeding',
  poisoned: 'poison_suspected',
  foam: 'foam',
  collision: 'hit',
  vomiting: 'vomiting',
  unknown: 'unknown',
  other: 'other'
} as const

function initialFacts(): WalkFacts {
  return {
    situationType: 'injured',
    hasDraft: false,
    hasLocation: false,
    photoDone: false,
    hasFormSnapshot: false,
    hasContact: false,
    submitted: false
  }
}

function serverSituation(actionId: string): ServerSituation | undefined {
  if (actionId === 'start-injured') return 'injured'
  if (actionId === 'start-stray') return 'stray'
  return undefined
}

function selectedIds(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

function textValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value.trim() : ''
}

function ternary(value: string | string[] | undefined): 'yes' | 'no' | 'unknown' | undefined {
  return value === 'yes' || value === 'no' || value === 'unknown' ? value : undefined
}

function withPublicState(facts: WalkFacts, publicState: WalkFacts['publicState']): WalkFacts {
  if (publicState === undefined) return facts
  return { ...facts, publicState }
}

function failureText(error: ClientError) {
  return error.code === 'NETWORK_FAILURE'
    ? 'Server je teraz nedostupný. Skúste to znova.'
    : 'Server hlásenie neprijal. Skúste to znova.'
}

export type WalkDependencies = {
  session: CaseSession
  guidance: () => Promise<PublicGuidance>
  checkpoint?: IdbRecordStore<WalkCheckpoint>
  reportFailure?: (error: ClientError) => void
}

export function createWalkActions(dependencies: WalkDependencies) {
  let facts = initialFacts()
  let pending: Promise<unknown> | undefined

  function persisted() {
    return (
      facts.hasDraft &&
      (facts.situationType === 'injured' || facts.situationType === 'stray') &&
      previewSession.value?.situation === facts.situationType
    )
  }

  function report(error: ClientError) {
    if (dependencies.reportFailure) {
      dependencies.reportFailure(error)
      return
    }
    notify({
      title: 'Hlásenie sa neuložilo',
      text: failureText(error),
      kind: 'error',
      dismissLabel: 'Zavrieť oznámenie'
    })
  }

  async function exclusive<T>(run: () => Promise<T>) {
    if (pending) return undefined
    const current = run()
    pending = current
    try {
      return await current
    } finally {
      if (pending === current) pending = undefined
    }
  }

  let checkpointTail = Promise.resolve()

  function captureCheckpoint(): WalkCheckpoint {
    const session = previewSession.value
    const checkpoint: WalkCheckpoint = {
      facts: { ...facts },
      ...(session?.location ? { location: { ...session.location } } : {}),
      ...(session?.animalIdentification
        ? { animalIdentification: { ...session.animalIdentification, path: [...session.animalIdentification.path] } }
        : {}),
      ...(session?.animalDetails ? { animalDetails: { ...session.animalDetails } } : {}),
      ...(session?.adviceReady ? { adviceReady: true } : {})
    }
    // Vue proxies cannot be stored in IndexedDB.
    return JSON.parse(JSON.stringify(checkpoint)) as WalkCheckpoint
  }

  function persistCheckpoint() {
    const checkpoint = dependencies.checkpoint
    if (!checkpoint) return Promise.resolve()
    const saved = facts.hasDraft ? captureCheckpoint() : undefined
    const run = checkpointTail.then(async () => {
      if (!saved) return
      try {
        await checkpoint.save(saved)
      } catch {
        // The open tab still has the case when the browser refuses storage.
      }
    })
    checkpointTail = run
    return run
  }

  async function resetCase() {
    facts = initialFacts()
    await checkpointTail
    await dependencies.checkpoint?.clear()
    await dependencies.session.removeLocal()
  }

  async function restore() {
    const snapshot = await dependencies.session.snapshot()
    if (!snapshot?.mutationAllowed || snapshot.publicState === 'received' || snapshot.publicState === 'closed') {
      if (snapshot) await resetCase()
      return
    }
    const saved = await dependencies.checkpoint?.load()
    const restored =
      saved?.facts.hasDraft === true
        ? saved.facts
        : { ...initialFacts(), situationType: 'injured' as const, hasDraft: true }
    facts = withPublicState(restored, snapshot.publicState ?? restored.publicState)
    previewSession.value = {
      situation: facts.situationType,
      fromDraft: true,
      ...(saved?.location ? { location: saved.location } : {}),
      ...(saved?.animalIdentification ? { animalIdentification: saved.animalIdentification } : {}),
      ...(saved?.animalDetails ? { animalDetails: saved.animalDetails } : {}),
      ...(saved?.adviceReady ? { adviceReady: true } : {})
    }
    const guidance = await dependencies.guidance()
    const screen = presentationRoutes[resumeWalkView(facts, guidance).path] ?? 'W03'
    suspendedPreview.value = { session: previewSession.value, screen, progress: previewDraftProgress(screen) }
  }

  async function routeAfter(completedPath: string) {
    const guidance = await dependencies.guidance()
    let path = completedPath
    for (let step = 0; step < 12; step++) {
      const view = walkViewAfterPath(path, facts, guidance)
      if (!view) break
      const route = presentationRoutes[view.path]
      if (route) return route
      path = view.path
    }
    if (facts.hasFormSnapshot && !facts.submitted) return 'W24'
    return undefined
  }

  function formSnapshot(answers: DetailAnswers) {
    const identification = previewSession.value?.animalIdentification
    const chosen = selectedIds(answers.symptoms)
    const mapped = chosen.flatMap(id => {
      const symptom = symptoms[id as keyof typeof symptoms]
      return symptom ? [symptom] : []
    })
    const symptomList = [...(mapped.includes('unknown') ? ['unknown' as const] : new Set(mapped))]
    const otherText = textValue(answers['symptoms:other'])
    if (symptomList.includes('other') && !otherText) return undefined
    const conscious = ternary(answers.conscious)
    const isJuvenile = ternary(answers.juvenile)
    const species =
      identification?.kind === 'species'
        ? catalogueSpecies(identification)
        : { source: identification?.kind === 'unknown' ? ('failed' as const) : ('skipped' as const) }
    return {
      schemaVersion: 1 as const,
      situationType: facts.situationType,
      species,
      condition: {
        symptoms: [...symptomList],
        ...(symptomList.includes('other') ? { otherText } : {}),
        ...(conscious ? { conscious } : {}),
        ...(isJuvenile ? { isJuvenile } : {})
      },
      mediaRecordIds: []
    }
  }

  return {
    ...fixtureFlowActions,
    status: () => facts,
    restore,
    start(view: HomeView, id: string) {
      return exclusive(async () => {
        if (!view.allowedActions.includes(id) || id === 'draft-resume') return fixtureFlowActions.start(view, id)
        if (id === 'draft-complete') {
          const target = fixtureFlowActions.start(view, id)
          await resetCase()
          return target
        }
        const situation = serverSituation(id)
        if (situation) {
          await resetCase()
          const opened = await dependencies.session.openDraft()
          if (!opened.ok) {
            report(opened.error)
            return undefined
          }
          facts = withPublicState(
            { ...initialFacts(), situationType: situation, hasDraft: true },
            opened.value.publicState
          )
          const target = fixtureFlowActions.start(view, id)
          await persistCheckpoint()
          return target
        }
        if (view.previewActions[id]) await resetCase()
        return fixtureFlowActions.start(view, id)
      })
    },
    location(location: LocationPoint, target: string) {
      if (!persisted()) return fixtureFlowActions.location(location, target)
      return exclusive(async () => {
        const attached = await dependencies.session.attachLocation({
          schemaVersion: 1,
          address: location.label,
          coordinates: { latitude: location.lat, longitude: location.lng }
        })
        if (!attached.ok) {
          report(attached.error)
          return undefined
        }
        facts = withPublicState({ ...facts, hasLocation: true }, attached.value.publicState)
        const next = fixtureFlowActions.location(location, (await routeAfter('/w03')) ?? target)
        await persistCheckpoint()
        return next
      })
    },
    identify(identification: AnimalIdentification, target: string) {
      if (persisted()) {
        const { kindKey: _previousKind, ...withoutKind } = facts
        facts = {
          ...withoutKind,
          photoDone: true,
          ...(identification.kind === 'species' ? { kindKey: identification.speciesId } : {})
        }
      }
      const next = fixtureFlowActions.identify(identification, target)
      if (persisted()) void persistCheckpoint()
      return next
    },
    details(answers: DetailAnswers, scope: 'animalDetails' | 'roadDetails', target: string) {
      if (!persisted() || scope !== 'animalDetails') return fixtureFlowActions.details(answers, scope, target)
      return exclusive(async () => {
        const payload = formSnapshot(answers)
        if (!payload) {
          report({ code: 'INVALID_COMMAND', retryable: false })
          return undefined
        }
        const attached = await dependencies.session.attachFormSnapshot(payload)
        if (!attached.ok) {
          report(attached.error)
          return undefined
        }
        const kindKey = 'kindKey' in payload.species ? payload.species.kindKey : undefined
        const { kindKey: _previous, ...withoutKind } = facts
        facts = withPublicState(
          {
            ...withoutKind,
            hasFormSnapshot: true,
            photoDone: true,
            ...(kindKey ? { kindKey } : {})
          },
          attached.value.publicState
        )
        const next = fixtureFlowActions.details(answers, scope, (await routeAfter('/w09')) ?? target)
        await persistCheckpoint()
        return next
      })
    },
    async processMedia(duration: number, target: string, signal: AbortSignal) {
      const next = await fixtureFlowActions.processMedia(duration, target, signal)
      if (next && persisted()) {
        facts = { ...facts, photoDone: true }
        await persistCheckpoint()
      }
      return next
    },
    submitReport(reportInput: ContactReport) {
      if (!persisted()) return true
      return exclusive(async () => {
        if (!facts.hasContact) {
          const name = reportInput.name?.trim()
          const phone = reportInput.phone?.trim()
          const email = reportInput.email?.trim()
          const attached = await dependencies.session.attachContact({
            schemaVersion: 1,
            ...(name ? { name } : {}),
            ...(phone ? { phone } : {}),
            ...(email ? { email } : {}),
            shareWithAuthorities: reportInput.shareWithAuthorities,
            newsletter: reportInput.newsletter
          })
          if (!attached.ok) {
            report(attached.error)
            return false
          }
          facts = withPublicState({ ...facts, hasContact: true }, attached.value.publicState)
        }
        const submitted = await dependencies.session.submit()
        if (!submitted.ok) {
          report(submitted.error)
          return false
        }
        await resetCase()
        return true
      })
    }
  }
}

function catalogueSpecies(identification: Extract<AnimalIdentification, { kind: 'species' }>) {
  const kind = findAnimalKind(identification.speciesId)
  if (!kind) return { source: 'skipped' as const }
  return {
    source: 'manual' as const,
    groupKey: kind.groupKey,
    categoryKey: kind.categoryKey,
    kindKey: kind.key
  }
}

let cachedGuidance: Promise<PublicGuidance> | undefined

export function loadWalkGuidance(): Promise<PublicGuidance> {
  cachedGuidance ??= fetchPublishedGuidance()
  return cachedGuidance
}

async function fetchPublishedGuidance(): Promise<PublicGuidance> {
  try {
    const response = await fetch(`${apiBaseUrl()}/guidance`, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000)
    })
    if (!response.ok) return bundledPublicGuidance()
    return parsePublicGuidance(await response.json())
  } catch {
    return bundledPublicGuidance()
  }
}

const durableBrowser = import.meta.env.MODE !== 'test' && typeof indexedDB !== 'undefined'
const browserTransport = createFetchTransport({ baseUrl: apiBaseUrl() })

export const walkFlowActions = createWalkActions({
  session: createCaseSession({
    store: durableBrowser ? createIdbCaseStore(indexedDB) : createMemoryCaseStore(),
    transport: browserTransport
  }),
  guidance: loadWalkGuidance,
  ...(durableBrowser ? { checkpoint: createWalkCheckpoint(indexedDB) } : {})
})

export function restorePersistedWalk() {
  return walkFlowActions.restore()
}

import { createCaseSession, createMemoryCaseStore, type ApiTransport } from '@animal-helper/client'
import { bundledPublicGuidance } from '@animal-helper/guidance'
import { afterEach, expect, it } from 'vitest'
import { homeFixture } from '../../pages/fixtures/home'
import { finishPreview } from '../../preview-flow'
import { createWalkActions } from '../adapter'

afterEach(() => {
  finishPreview()
})

function harness(transport?: ApiTransport) {
  const commands: { type: string; kind?: string; privatePayload?: unknown }[] = []
  const failures: string[] = []
  const sessionTransport: ApiTransport = transport ?? {
    async sendCommand({ command }) {
      commands.push({
        type: command.type,
        ...('kind' in command ? { kind: command.kind, privatePayload: command.privatePayload } : {})
      })
      return {
        status: 200,
        body: {
          ok: true,
          value: {
            outcome: 'applied',
            committedVersion: command.expectedVersion + 1,
            publicState: command.type === 'submit_draft' ? 'received' : 'draft'
          }
        }
      }
    },
    async getStatus() {
      return { status: 404, body: undefined }
    }
  }
  const actions = createWalkActions({
    session: createCaseSession({ store: createMemoryCaseStore(), transport: sessionTransport }),
    guidance: async () => bundledPublicGuidance(),
    reportFailure: error => {
      failures.push(error.code)
    }
  })
  return { actions, commands, failures }
}

const place = { label: 'Dolné Orešany', lat: 48.433, lng: 17.43, source: 'fixture' as const }

it('persists an injured walk and takes the next screen from the walk view', async () => {
  const { actions, commands } = harness()
  expect(await actions.start(homeFixture, 'start-injured')).toBe('W03')
  expect(commands.map(command => command.type)).toEqual(['create_draft'])
  expect(actions.status().publicState).toBe('draft')

  expect(await actions.location(place, 'W99')).toBe('W04')
  expect(commands[1]).toMatchObject({
    kind: 'location',
    privatePayload: {
      address: 'Dolné Orešany',
      coordinates: { latitude: 48.433, longitude: 17.43 }
    }
  })

  actions.identify({ kind: 'species', speciesId: 'domestic_cat', path: ['domestic'] }, 'W09')
  expect(
    await actions.details(
      {
        symptoms: ['bleeding', 'limping', 'other'],
        'symptoms:other': 'Poranená labka',
        conscious: 'yes',
        juvenile: 'no'
      },
      'animalDetails',
      'W99'
    )
  ).toBe('W14')
  expect(commands[2]).toMatchObject({
    kind: 'form_snapshot',
    privatePayload: {
      situationType: 'injured',
      species: { source: 'manual', kindKey: 'domestic_cat', groupKey: 'domestic' },
      condition: {
        symptoms: ['bleeding', 'other'],
        otherText: 'Poranená labka',
        conscious: 'yes',
        isJuvenile: 'no'
      }
    }
  })

  expect(
    await actions.submitReport({
      name: 'Test',
      email: 'test@example.org',
      shareWithAuthorities: true,
      newsletter: false
    })
  ).toBe(true)
  expect(commands.at(-2)).toMatchObject({
    kind: 'contact',
    privatePayload: { name: 'Test', email: 'test@example.org', shareWithAuthorities: true, newsletter: false }
  })
  expect(commands.at(-1)?.type).toBe('submit_draft')
  expect(actions.status().hasDraft).toBe(false)
})

it('sends a stray report to contact when that walk has no guide screens', async () => {
  const { actions } = harness()
  await actions.start(homeFixture, 'start-stray')
  await actions.location(place, 'W04')
  expect(await actions.details({ symptoms: ['unknown'] }, 'animalDetails', 'W14')).toBe('W24')
})

it('leaves cruelty on the fixture provider', async () => {
  const { actions, commands } = harness()
  expect(await actions.start(homeFixture, 'start-cruelty')).toBe('W27')
  expect(commands).toEqual([])
  expect(actions.status().hasDraft).toBe(false)
})

it('stays on the current screen when the server rejects the draft', async () => {
  const rejected: ApiTransport = {
    async sendCommand() {
      return { status: 400, body: { ok: false, error: { code: 'INVALID_REQUEST' } } }
    },
    async getStatus() {
      return { status: 404, body: undefined }
    }
  }
  const { actions, failures } = harness(rejected)
  expect(await actions.start(homeFixture, 'start-injured')).toBeUndefined()
  expect(failures).toEqual(['API'])
  expect(actions.status().hasDraft).toBe(false)
})

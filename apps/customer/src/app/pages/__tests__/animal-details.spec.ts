import BaseExpander from '@/libs/components/base-expander.vue'
import BaseIcon from '@/libs/components/base-icon.vue'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { beginPreview, previewSession } from '../../preview-flow'
import { animalDetailsFixture } from '../fixtures/animal-details'
import { animalGroupsFixture } from '../fixtures/animal-groups'
import PageAnimalDetails from '../page-animal-details.vue'
const push = vi.hoisted(() => vi.fn())
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
afterEach(() => {
  previewSession.value = null
  push.mockClear()
})
function setup(view = structuredClone(animalDetailsFixture)) {
  beginPreview('injured')
  previewSession.value!.animalIdentification = {
    kind: 'species',
    speciesId: 'cat-domestic',
    path: ['domestic', 'cats']
  }
  return mount(PageAnimalDetails, {
    props: { view, catalogue: animalGroupsFixture.root },
    global: { components: { BaseIcon, BaseExpander } }
  })
}
it('renders supplied questions, validates answers and makes unknown exclusive', async () => {
  const wrapper = setup()
  expect(wrapper.text()).toContain('Mačka domáca')
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeDefined()
  await wrapper.get('input[value=bleeding]').setValue(true)
  await wrapper.get('input[name=symptoms][value=unknown]').setValue(true)
  expect(previewSession.value!.animalDetails!.symptoms).toEqual(['unknown'])
  await wrapper.get('input[value=other]').setValue(true)
  expect(previewSession.value!.animalDetails!.symptoms).toEqual(['other'])
  await wrapper.get('textarea').setValue('Opis')
  await wrapper.get('input[name=conscious][value=yes]').setValue()
  await wrapper.get('input[name=juvenile][value=no]').setValue()
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeUndefined()
  await wrapper.get('form').trigger('submit')
  expect(previewSession.value!.adviceReady).toBe(true)
  expect(push).toHaveBeenCalledWith({ name: 'W14' })
  await wrapper.get('input[value=other]').setValue(false)
  expect(previewSession.value!.animalDetails!['symptoms:other']).toBeUndefined()
})
it('supports text-only and empty server-shaped forms', async () => {
  const view = structuredClone(animalDetailsFixture)
  view.values = { notes: 'Prefilled by fixture' }
  view.questions = [
    { id: 'notes', label: 'Server label', kind: 'text', placeholder: 'Server placeholder', required: true, options: [] }
  ]
  const wrapper = setup(view)
  expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Prefilled by fixture')
  expect(wrapper.findAll('input')).toHaveLength(0)
  await wrapper.get('textarea').setValue('   ')
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeDefined()
  await wrapper.get('textarea').setValue('Something')
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeUndefined()
  await wrapper.setProps({ view: { ...view, questions: [] } })
  expect(wrapper.findAll('fieldset')).toHaveLength(0)
  expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeUndefined()
})
it('replaces the form with manual recovery after a simulated failure', async () => {
  const wrapper = setup()
  previewSession.value!.identificationFailed = true
  await wrapper.vm.$nextTick()
  expect(wrapper.find('form').exists()).toBe(false)
  expect(wrapper.text()).toContain(animalDetailsFixture.copy.failedPreview)
  await wrapper
    .findAll('button')
    .find(button => button.text() === animalDetailsFixture.copy.manual)!
    .trigger('click')
  expect(push).toHaveBeenCalledWith({ name: 'W06' })
})

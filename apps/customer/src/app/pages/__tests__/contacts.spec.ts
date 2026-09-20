import BaseIcon from '@/libs/components/base-icon.vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import {
  clinicFixture,
  contactFixtures,
  municipalityFixture,
  policeFixture,
  safeContactHref
} from '../fixtures/contacts'
import { selfHelpFixture } from '../fixtures/self-help'
import PageContacts from '../page-contacts.vue'
import PageInstructions from '../page-instructions.vue'
const push = vi.hoisted(() => vi.fn())
it('ships complete page-owned advice in every contact and self-help fixture', () => {
  for (const view of [...contactFixtures, selfHelpFixture]) {
    expect(view.advice?.triggerLabel).toBe('Rady')
    expect(view.advice?.copy.drawerTitle).toBeTruthy()
    expect(view.advice?.copy.closeAdvice).toBeTruthy()
    expect(view.advice?.copy.acknowledge).toBeTruthy()
    expect(view.advice?.blocks.length).toBeGreaterThan(0)
  }
})
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

it('renders every fixture variant and repeated cards without live example links', async () => {
  const wrapper = mount(PageContacts, { props: { view: municipalityFixture }, global: { components: { BaseIcon } } })
  for (const view of contactFixtures) {
    await wrapper.setProps({ view })
    expect(wrapper.get('h1').text()).toBe(view.copy.title)
    expect(wrapper.findAll('.customer-contact-card')).toHaveLength(
      view.blocks.filter(block => block.kind === 'contact').length
    )
    expect(wrapper.findAll('a[href^="tel:"]')).toHaveLength(0)
  }
  await wrapper.setProps({ view: clinicFixture })
  expect(wrapper.findAll('.customer-contact-card')).toHaveLength(3)
  expect(wrapper.find('.text-success').exists()).toBe(true)
  expect(wrapper.find('.text-accent').exists()).toBe(true)
  expect(wrapper.find('.text-danger').exists()).toBe(true)
  await wrapper.setProps({ view: policeFixture })
  expect(wrapper.find('.bg-warning-light').exists()).toBe(true)
  expect(wrapper.find('.bg-warning').exists()).toBe(true)
  expect(wrapper.findAll('li')).toHaveLength(2)
  await wrapper.get('footer button').trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W24' })
  await wrapper.setProps({ view: { ...municipalityFixture, allowedActions: [] } })
  expect(wrapper.find('[role=status]').exists()).toBe(false)
  expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
})

it('combines all instruction blocks and renders only the ordered footer actions supplied by data', async () => {
  const wrapper = mount(PageInstructions, {
    props: {
      view: {
        ...contactFixtures[0]!,
        blocks: [...contactFixtures[0]!.blocks, ...selfHelpFixture.blocks],
        footerActions: [{ id: 'unresolved', label: 'Custom next step', appearance: 'secondary', target: 'W25' }],
        allowedActions: ['back', 'unresolved']
      }
    },
    global: { components: { BaseIcon } }
  })
  expect(wrapper.findAll('.customer-contact-card')).toHaveLength(6)
  expect(wrapper.findAll('figure')).toHaveLength(4)
  expect(wrapper.find('ol').exists()).toBe(true)
  expect(wrapper.find('.bg-danger-light').exists()).toBe(true)
  expect(wrapper.find('.bg-warning').exists()).toBe(true)
  expect(wrapper.findAll('footer button')).toHaveLength(1)
  expect(wrapper.get('footer button').text()).toBe('Custom next step')
  await wrapper.get('footer button').trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W25' })
  await wrapper.setProps({ view: { ...municipalityFixture, footerActions: [] } })
  expect(wrapper.findAll('footer button')).toHaveLength(0)
})

it('supports localized, ordered server content and safe links', () => {
  const wrapper = mount(PageContacts, {
    props: {
      view: {
        ...municipalityFixture,
        locale: 'en',
        blocks: [
          {
            id: 'link',
            kind: 'link',
            description: 'Contact',
            link: { label: 'Volunteers', href: 'https://example.org/help' }
          },
          {
            id: 'contact',
            kind: 'contact',
            title: 'Contact title',
            phone: { label: 'Call', href: 'tel:+421123456789' }
          }
        ]
      }
    },
    global: { components: { BaseIcon } }
  })
  expect(wrapper.attributes('lang')).toBe('en')
  expect(wrapper.findAll('a').map(link => link.attributes('href'))).toEqual([
    'https://example.org/help',
    'tel:+421123456789'
  ])
  expect(wrapper.get('h2').text()).toBe('Contact title')
  for (const href of [
    'javascript:alert(1)',
    'data:text/html,test',
    '//example.org',
    'https://user:password@example.org'
  ])
    expect(safeContactHref(href, 'web')).toBeUndefined()
  expect(safeContactHref('https://example.org', 'phone')).toBeUndefined()
  expect(safeContactHref('tel:123?body=test', 'phone')).toBeUndefined()
})

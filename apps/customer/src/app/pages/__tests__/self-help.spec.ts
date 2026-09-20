import BaseIcon from '@/libs/components/base-icon.vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import HelpText from '../../components/help-text.vue'
import { previewSession } from '../../preview-flow'
import { municipalityFixture } from '../fixtures/contacts'
import { selfHelpFixture } from '../fixtures/self-help'
import PageContacts from '../page-contacts.vue'
import PageSelfHelp from '../page-self-help.vue'
const push = vi.hoisted(() => vi.fn())
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

it('opens self help through a data-defined action and returns to the source', async () => {
  previewSession.value = { situation: 'test', fromDraft: false }
  const contacts = mount(PageContacts, {
    props: { view: { ...municipalityFixture, screen: 'W18' } },
    global: { components: { BaseIcon } }
  })
  await contacts.findAll('footer button')[1]!.trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W22' })
  const page = mount(PageSelfHelp, { props: { view: selfHelpFixture }, global: { components: { BaseIcon } } })
  expect(page.get('h1').text()).toBe('Pomôžte sami')
  expect(page.findAll('ol li')).toHaveLength(2)
  expect(page.findAll('ul li')).toHaveLength(1)
  expect(page.find('.bg-danger-light').exists()).toBe(true)
  expect(page.find('.bg-warning-light').exists()).toBe(true)
  await page.get('button').trigger('click')
  expect(push).toHaveBeenLastCalledWith({ name: 'W18' })
  await page.get('footer button').trigger('click')
  expect(page.get('[role=status]').text()).toBe(selfHelpFixture.copy.unavailable)
  await page.setProps({ view: { ...selfHelpFixture, allowedActions: [] } })
  expect(page.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  previewSession.value = null
})

it('renders formatted text without interpreting HTML or unsafe URLs', () => {
  const text = mount(HelpText, {
    props: {
      content: [
        { text: '<img src=x onerror=alert(1)>', href: 'javascript:alert(1)' },
        { text: 'Bold', emphasis: 'strong' },
        { text: 'Emphasis', emphasis: 'em' },
        { text: 'Source', href: 'https://example.org/help' }
      ]
    }
  })
  expect(text.find('img').exists()).toBe(false)
  expect(text.text()).toContain('<img src=x onerror=alert(1)>')
  expect(text.get('strong').text()).toBe('Bold')
  expect(text.get('em').text()).toBe('Emphasis')
  expect(text.findAll('a')).toHaveLength(1)
  expect(text.get('a').attributes('href')).toBe('https://example.org/help')
})

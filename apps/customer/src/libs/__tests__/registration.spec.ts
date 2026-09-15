import { describe, expect, it } from 'vitest'
import { createApp, defineComponent } from 'vue'
import { attachLibs } from '../index'
import { registerModules } from '../registration'

describe('global library registration', () => {
  it('discovers base components', () => {
    const app = createApp({})
    attachLibs(app)
    expect(app.component('BaseIcon')).toBeDefined()
  })
  it('registers kebab-case directives', () => {
    const app = createApp({})
    const directive = { mounted: () => undefined }
    registerModules(app, {}, { './directives/click-outside.ts': { default: directive } })
    expect(app.directive('click-outside')).toBe(directive)
  })
  it('rejects duplicate component names', () => {
    const component = { default: defineComponent({}) }
    expect(() =>
      registerModules(createApp({}), { 'a/base-icon.vue': component, 'b/base-icon.vue': component }, {})
    ).toThrow('Duplicate component')
  })
  it('rejects duplicate directive names', () => {
    const directive = { default: {} }
    expect(() => registerModules(createApp({}), {}, { 'a/focus.ts': directive, 'b/focus.ts': directive })).toThrow(
      'Duplicate directive'
    )
  })
})

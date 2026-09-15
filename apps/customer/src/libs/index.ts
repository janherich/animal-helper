import type { App, Component, Directive } from 'vue'
import { registerModules } from './registration'

export function attachLibs(app: App): void {
  const components = import.meta.glob<{ default: Component }>(
    ['./components/**/base-*.vue', '!**/__tests__/**', '!**/*.test.vue', '!**/*.spec.vue'],
    { eager: true }
  )
  const directives = import.meta.glob<{ default: Directive }>(
    ['./directives/**/*.ts', '!**/__tests__/**', '!**/*.test.ts', '!**/*.spec.ts', '!**/*.d.ts'],
    { eager: true }
  )
  registerModules(app, components, directives)
}

import type { App } from 'vue'
import { router } from './router'
export function attachProviders(app: App): void {
  app.use(router)
}

// Library styles/configuration; component-bound integrations own their lifecycle.
import { configureScrollbars } from './overlay-scrollbars'
export function attachPlugins(): void {
  configureScrollbars()
}

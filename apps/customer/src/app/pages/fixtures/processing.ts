// Presentation-only fixture; replace the simulated operation when the API is ready.
import type { ProcessingView } from '../../contracts/forms'
export const processingFixture: ProcessingView = {
  screen: 'W41',
  thresholdMs: 600,
  demoDurationMs: 4000,
  title: 'Spracovávam údaje',
  preview: 'Lokálna ukážka čakania. Súbory sa neodosielajú a AI spracovanie zatiaľ nie je zapojené.'
}

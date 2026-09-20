// Compatibility entry point for the fixture-backed draft. Business state and
// lifecycle rules live with the mock server, not in application components.
export {
  beginPreview,
  confirmAnimalIdentification,
  confirmPreviewLocation,
  finishPreview,
  previewSession
} from './pages/fixtures/preview-session'

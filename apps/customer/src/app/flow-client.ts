// Composition boundary for the current fixture-backed workflow provider.
// Replace this provider with an API implementation when the backend is ready.
// Draft UI state, router history, animations and focus remain on the client.
export { fixtureFlowActions as flowActions } from './pages/fixtures/flow-actions'
export {
  previewAccess,
  previewContactView,
  previewDetailsView,
  previewHomeView,
  previewLocationView,
  previewMediaView,
  previewPageAdvice,
  previewThankYouView
} from './pages/fixtures/preview-server'

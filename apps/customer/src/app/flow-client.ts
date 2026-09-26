// Injured and stray reports go through the walk adapter, which persists case
// status with the command client. Other situations stay on the fixture provider.
// Draft UI state, router history, animations and focus remain on the client.
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
export { walkFlowActions as flowActions } from './walk/adapter'

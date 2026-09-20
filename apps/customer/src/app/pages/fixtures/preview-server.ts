// TEMPORARY SERVER SIMULATOR, not production client business rules.
// Replace these functions with validated API responses (view + next action).
// Routes register renderers; only this fixture adapter selects scenario variants.
import { previewSession } from '../../preview-flow'
import { animalDetailsFixture } from './animal-details'
import type { ContactsView } from './contacts'
import { crueltyDetailsFixture } from './cruelty'
import { locationFixture } from './location'
import { mediaFixture } from './media'
import { humanDetailsFixture, otherDetailsFixture, roadInstructionsFixture } from './other-situations'

function isRoadFlow() {
  return previewSession.value?.situation === 'other' && previewSession.value.otherSituation === 'road'
}
export function previewLocationView() {
  const situation = previewSession.value?.situation
  return {
    ...locationFixture,
    confirmTarget: isRoadFlow() ? 'W33' : locationFixture.confirmTarget,
    backTarget: situation === 'cruelty' ? 'W27' : situation === 'other' ? 'W32' : locationFixture.backTarget,
    backHistoryTargets: situation === 'cruelty' ? ['W27', 'W29', 'W30'] : situation === 'other' ? ['W32'] : []
  }
}
export function previewMediaView() {
  return { ...mediaFixture, backTarget: previewSession.value?.documentingOther ? 'W37' : mediaFixture.backTarget }
}
export function previewDetailsView() {
  const session = previewSession.value
  if (session?.situation === 'other')
    return session.otherSituation === 'human' ? humanDetailsFixture : otherDetailsFixture
  return session?.situation === 'cruelty' ? crueltyDetailsFixture : animalDetailsFixture
}
export function previewContactView(view: ContactsView) {
  return isRoadFlow() && view.screen === 'W36' ? roadInstructionsFixture : view
}

// Simulates server availability/redirects for the current in-memory draft. This
// is not authorization; a real backend must validate the request independently.
export function previewAccess(screen: string): true | { name: string } {
  const session = previewSession.value
  const home = { name: 'W01' }
  if (!session) return home
  const located = !!session.location
  const identified = !!session.animalIdentification
  const ready = located && identified && !!session.adviceReady
  switch (screen) {
    case 'W32':
      return session.situation === 'other' || home
    case 'W33':
      return (isRoadFlow() && located) || home
    case 'W37':
      return (isRoadFlow() && located && !!session.roadDetails?.road) || home
    case 'W27':
    case 'W28':
      return session.situation === 'cruelty' || home
    case 'W29':
    case 'W30':
      if (session.situation !== 'cruelty') return home
      return session.crueltyReport?.outcome === (screen === 'W29' ? 'reported' : 'not-reported') || { name: 'W28' }
    case 'W03':
      return session.situation === 'other' && !session.otherSituation ? { name: 'W32' } : true
    case 'W04':
    case 'W06':
      return located || home
    case 'W09':
      return (located && (identified || !!session.identificationFailed)) || home
    case 'W40':
      return (located && identified) || home
    case 'W24':
      return (located && (identified || isRoadFlow()) && !!session.adviceReady) || home
    case 'W36':
      return (isRoadFlow() && located && !!session.roadDetails?.road) || ready || home
    default:
      return ready || home
  }
}

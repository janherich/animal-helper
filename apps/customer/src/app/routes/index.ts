import type { RouteRecordRaw } from 'vue-router'
import { adviceFixture, warningsOnlyFixture } from '../pages/fixtures/advice'
import { animalDetailsFixture, editAnimalFixture } from '../pages/fixtures/animal-details'
import { animalGroupsFixture } from '../pages/fixtures/animal-groups'
import { contactFixtures } from '../pages/fixtures/contacts'
import { homeDraftFixture, homeFixture } from '../pages/fixtures/home'
import { locationFixture } from '../pages/fixtures/location'
import { mediaFixture } from '../pages/fixtures/media'
import { selfHelpFixture } from '../pages/fixtures/self-help'
import { thankYouFixtures } from '../pages/fixtures/thank-you'
import { previewSession } from '../preview-flow'
export const routes: RouteRecordRaw[] = [
  ...thankYouFixtures.map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: { view },
    meta: view.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location &&
        !!previewSession.value.animalIdentification &&
        !!previewSession.value.adviceReady) || { name: 'W01' },
    component: () => import('../pages/page-thank-you.vue')
  })),
  {
    path: '/w22',
    name: 'W22',
    props: { view: selfHelpFixture },
    meta: selfHelpFixture.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location &&
        !!previewSession.value.animalIdentification &&
        !!previewSession.value.adviceReady) || { name: 'W01' },
    component: () => import('../pages/page-self-help.vue')
  },
  {
    path: '/',
    name: 'W01',
    meta: homeFixture.layout,
    // Development preview selector only; never grants access to an actual case.
    props: route => ({
      view: import.meta.env.DEV && route.query.fixture === 'draft' ? homeDraftFixture : homeFixture
    }),
    component: () => import('../pages/page-home.vue')
  },
  {
    path: '/w03',
    name: 'W03',
    props: { view: locationFixture },
    meta: locationFixture.layout,
    beforeEnter: () => previewSession.value !== null || { name: 'W01' },
    component: () => import('../pages/page-location.vue')
  },
  {
    path: '/w04',
    name: 'W04',
    props: { view: mediaFixture },
    meta: mediaFixture.layout,
    beforeEnter: () => !!previewSession.value?.location || { name: 'W01' },
    component: () => import('../pages/page-media.vue')
  },
  {
    path: '/w06',
    name: 'W06',
    props: { view: animalGroupsFixture },
    meta: animalGroupsFixture.layout,
    beforeEnter: () => !!previewSession.value?.location || { name: 'W01' },
    component: () => import('../pages/page-animal-groups.vue')
  },
  {
    path: '/w09',
    name: 'W09',
    props: { view: animalDetailsFixture, catalogue: animalGroupsFixture.root },
    meta: animalDetailsFixture.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location &&
        (!!previewSession.value.animalIdentification || previewSession.value.identificationFailed)) || { name: 'W01' },
    component: () => import('../pages/page-animal-details.vue')
  },
  {
    path: '/w40',
    name: 'W40',
    props: { view: editAnimalFixture, catalogue: animalGroupsFixture.root },
    meta: editAnimalFixture.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location && !!previewSession.value.animalIdentification) || { name: 'W01' },
    component: () => import('../pages/page-edit-animal.vue')
  },
  ...[warningsOnlyFixture, adviceFixture].map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: { view },
    meta: view.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location &&
        !!previewSession.value.animalIdentification &&
        !!previewSession.value.adviceReady) || { name: 'W01' },
    component: () => import('../pages/page-advice.vue')
  })),
  ...contactFixtures.map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: { view },
    meta: view.layout,
    beforeEnter: () =>
      (!!previewSession.value?.location &&
        !!previewSession.value.animalIdentification &&
        !!previewSession.value.adviceReady) || { name: 'W01' },
    component: () => import('../pages/page-contacts.vue')
  })),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/page-not-found.vue')
  }
]

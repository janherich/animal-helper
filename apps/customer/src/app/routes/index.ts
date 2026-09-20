import type { RouteRecordRaw } from 'vue-router'
import { adviceFixture, warningsOnlyFixture } from '../pages/fixtures/advice'
import { animalDetailsFixture, editAnimalFixture } from '../pages/fixtures/animal-details'
import { animalGroupsFixture } from '../pages/fixtures/animal-groups'
import { contactFixtures } from '../pages/fixtures/contacts'
import { crueltyFixture } from '../pages/fixtures/cruelty'
import { homeDraftFixture, homeFixture } from '../pages/fixtures/home'
import { locationFixture } from '../pages/fixtures/location'
import { mediaFixture } from '../pages/fixtures/media'
import { otherSituationFixture } from '../pages/fixtures/other-situations'
import {
  previewAccess,
  previewContactView,
  previewDetailsView,
  previewLocationView,
  previewMediaView
} from '../pages/fixtures/preview-server'
import { selfHelpFixture } from '../pages/fixtures/self-help'
import { thankYouFixtures } from '../pages/fixtures/thank-you'
export const routes: RouteRecordRaw[] = [
  {
    path: '/w32',
    name: 'W32',
    props: { view: otherSituationFixture },
    meta: otherSituationFixture.layout,
    beforeEnter: () => previewAccess('W32'),
    component: () => import('../pages/page-other-situation.vue')
  },
  {
    path: '/w33',
    name: 'W33',
    meta: { showMenu: false },
    beforeEnter: () => previewAccess('W33'),
    component: () => import('../pages/page-road-details.vue')
  },
  {
    path: '/w37',
    name: 'W37',
    meta: { showMenu: false },
    beforeEnter: () => previewAccess('W37'),
    component: () => import('../pages/page-other-failed.vue')
  },
  {
    path: '/w27',
    name: 'W27',
    props: { view: crueltyFixture },
    meta: crueltyFixture.layout,
    beforeEnter: () => previewAccess('W27'),
    component: () => import('../pages/page-cruelty.vue')
  },
  {
    path: '/w28',
    name: 'W28',
    meta: { showMenu: false },
    beforeEnter: () => previewAccess('W28'),
    component: () => import('../pages/page-police-result.vue')
  },
  {
    path: '/w29',
    name: 'W29',
    meta: { showMenu: false },
    beforeEnter: () => previewAccess('W29'),
    component: () => import('../pages/page-police-reported.vue')
  },
  {
    path: '/w30',
    name: 'W30',
    meta: { showMenu: false },
    beforeEnter: () => previewAccess('W30'),
    component: () => import('../pages/page-police-failed.vue')
  },
  ...thankYouFixtures.map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: { view },
    meta: view.layout,
    beforeEnter: () => previewAccess(view.screen),
    component: () => import('../pages/page-thank-you.vue')
  })),
  {
    path: '/w22',
    name: 'W22',
    props: { view: selfHelpFixture },
    meta: selfHelpFixture.layout,
    beforeEnter: () => previewAccess('W22'),
    component: () => import('../pages/page-self-help.vue')
  },
  {
    path: '/',
    name: 'W01',
    meta: homeFixture.layout,
    // Development preview selector only; never grants access to an actual case.
    props: route => ({
      view: import.meta.env.DEV && route.query.fixture !== 'clean' ? homeDraftFixture : homeFixture
    }),
    component: () => import('../pages/page-home.vue')
  },
  {
    path: '/w03',
    name: 'W03',
    props: () => ({ view: previewLocationView() }),
    meta: locationFixture.layout,
    beforeEnter: () => previewAccess('W03'),
    component: () => import('../pages/page-location.vue')
  },
  {
    path: '/w04',
    name: 'W04',
    props: () => ({ view: previewMediaView() }),
    meta: mediaFixture.layout,
    beforeEnter: () => previewAccess('W04'),
    component: () => import('../pages/page-media.vue')
  },
  {
    path: '/w06',
    name: 'W06',
    props: { view: animalGroupsFixture },
    meta: animalGroupsFixture.layout,
    beforeEnter: () => previewAccess('W06'),
    component: () => import('../pages/page-animal-groups.vue')
  },
  {
    path: '/w09',
    name: 'W09',
    props: () => ({
      view: previewDetailsView(),
      catalogue: animalGroupsFixture.root
    }),
    meta: animalDetailsFixture.layout,
    beforeEnter: () => previewAccess('W09'),
    component: () => import('../pages/page-animal-details.vue')
  },
  {
    path: '/w40',
    name: 'W40',
    props: { view: editAnimalFixture, catalogue: animalGroupsFixture.root },
    meta: editAnimalFixture.layout,
    beforeEnter: () => previewAccess('W40'),
    component: () => import('../pages/page-edit-animal.vue')
  },
  ...[warningsOnlyFixture, adviceFixture].map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: { view },
    meta: view.layout,
    beforeEnter: () => previewAccess(view.screen),
    component: () => import('../pages/page-advice.vue')
  })),
  ...contactFixtures.map(view => ({
    path: '/' + view.screen.toLowerCase(),
    name: view.screen,
    props: () => ({ view: previewContactView(view) }),
    meta: view.layout,
    beforeEnter: () => previewAccess(view.screen),
    component: () => import('../pages/page-contacts.vue')
  })),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/page-not-found.vue')
  }
]

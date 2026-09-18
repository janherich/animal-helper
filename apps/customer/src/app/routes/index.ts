import type { RouteRecordRaw } from 'vue-router'
import { animalDetailsFixture, editAnimalFixture } from '../pages/fixtures/animal-details'
import { animalGroupsFixture } from '../pages/fixtures/animal-groups'
import { homeDraftFixture, homeFixture } from '../pages/fixtures/home'
import { locationFixture } from '../pages/fixtures/location'
import { mediaFixture } from '../pages/fixtures/media'
import { previewSession } from '../preview-flow'
export const routes: RouteRecordRaw[] = [
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
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/page-not-found.vue')
  }
]

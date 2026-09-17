import type { RouteRecordRaw } from 'vue-router'
import { homeDraftFixture, homeFixture } from '../pages/fixtures/home'
import { locationFixture } from '../pages/fixtures/location'
import { previewSession } from '../preview-flow'
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'W01',
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
    meta: { showMenu: false },
    beforeEnter: () => previewSession.value !== null || { name: 'W01' },
    component: () => import('../pages/page-location.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/page-not-found.vue')
  }
]

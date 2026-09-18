import { routes } from '@/app/routes'
import { createRouter, createWebHistory } from 'vue-router'
import { beginScreenNavigation, setScreenScroll } from './transition-scroll'
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, savedPosition) => {
    const position = savedPosition ?? { top: 0, left: 0 }
    return setScreenScroll(position) ? false : position
  }
})
router.afterEach((to, from, failure) => {
  if (
    !failure &&
    from.matched.length &&
    to.matched.at(-1)?.components?.default !== from.matched.at(-1)?.components?.default
  ) {
    beginScreenNavigation()
  }
})

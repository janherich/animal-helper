<script setup lang="ts">
import { usePreferredReducedMotion, useScrollLock, useElementSize, useMediaQuery } from '@vueuse/core'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { homeDraftFixture, homeFixture } from './pages/fixtures/home'
import { shellFixture as shell } from './pages/fixtures/shell'
import { beginPreview, previewSession } from './preview-flow'
import AdviceDrawer from './components/advice-drawer.vue'
import { adviceFixture } from './pages/fixtures/advice'
import ManagerToasts from './components/manager-toasts.vue'
import { clearToasts } from './toasts'
import logoOrange from '@/assets/brand/logo-orange.svg'
import logoYellow from '@/assets/brand/logo-yellow.svg'
import { usePageScrollbars } from '@/plugins/overlay-scrollbars'
import { computed, watch } from 'vue'
import { contactFixtures } from './pages/fixtures/contacts'
import { selfHelpFixture } from './pages/fixtures/self-help'
import { holdScreenHeight, screenEntered, clearScreenScroll } from '@/providers/router/transition-scroll'
onUnmounted(clearScreenScroll)

usePageScrollbars()
const route = useRoute()
const router = useRouter()
const adviceAction = computed(
  () => [...contactFixtures, selfHelpFixture].find(view => view.screen === route.name)?.layout.adviceAction
)
const adviceDrawer = ref<InstanceType<typeof AdviceDrawer>>()
const desktopAdvice = useMediaQuery('(min-width: 768px)')
watch(desktopAdvice, desktop => {
  if (desktop) adviceDrawer.value?.close(true)
})
function openAdvice(event: MouseEvent) {
  if (desktopAdvice.value) void router.push({ name: previewSession.value?.adviceView?.screen ?? adviceFixture.screen })
  else void adviceDrawer.value?.open(event.currentTarget)
}
const appHeader = ref<HTMLElement>()
const { height: headerHeight } = useElementSize(appHeader, { width: 0, height: 80 }, { box: 'border-box' })
const stopToastNavigation = router.afterEach((to, from, failure) => {
  if (!failure && to.fullPath !== from.fullPath) {
    clearToasts()
    adviceDrawer.value?.close(true)
  }
})
onUnmounted(stopToastNavigation)
function handlePageAction(id: string) {
  if (route.name !== 'W01') return
  const view = import.meta.env.DEV && route.query.fixture === 'draft' ? homeDraftFixture : homeFixture
  if (!view.allowedActions.includes(id)) return
  const action = view.previewActions[id]
  if (action) {
    beginPreview(action.situation, action.fromDraft)
    void router.push({ name: action.target })
  }
}
const reducedMotion = usePreferredReducedMotion()
const starting = ref(true)
const menu = ref<HTMLDialogElement>()
const menuTrigger = ref<HTMLButtonElement>()
const menuOpen = ref(false)
const notice = ref('')
const body = ref<HTMLElement | null>(null)
const scrollLocked = useScrollLock(body)
let splashTimer: ReturnType<typeof setTimeout> | undefined
function openMenu() {
  menu.value?.showModal()
  menuOpen.value = true
  scrollLocked.value = true
}
function closeMenu() {
  menu.value?.close()
}
function onMenuKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const controls = menu.value?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
  if (!controls?.length) return
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
function onMenuClosed() {
  menuOpen.value = false
  scrollLocked.value = false
  menuTrigger.value?.focus({ preventScroll: true })
}
async function showUnavailable(label: string) {
  closeMenu()
  notice.value = ''
  await nextTick()
  notice.value = shell.props.unavailable.replace('{label}', label)
}
onMounted(() => {
  body.value = document.body
  // Temporary brand introduction, independent of future API loading state.
  splashTimer = setTimeout(
    () => {
      starting.value = false
    },
    reducedMotion.value === 'reduce' ? 0 : 700
  )
})
onUnmounted(() => {
  clearTimeout(splashTimer)
  menu.value?.close()
  scrollLocked.value = false
})
</script>

<template lang="pug">
.customer-app(
  class="relative min-h-dvh w-full bg-canvas",
  :lang="shell.locale"
)
  ManagerToasts
  AdviceDrawer(
    ref="adviceDrawer",
    :view="previewSession?.adviceView ?? adviceFixture",
    :style="{ '--advice-header-height': headerHeight + 'px' }"
  )
  .customer-app__content(
    class="flex min-h-dvh flex-col",
    :inert="starting"
  )
    a.customer-app__skip(
      class="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-surface focus:p-4",
      href="#main-content"
    ) {{ shell.props.skip }}
    header.customer-app__header(
      ref="appHeader",
      class="sticky top-0 z-30 shrink-0 bg-surface px-[15px] pt-[max(16px,env(safe-area-inset-top))] pb-5 shadow-[0_2px_8px_rgb(37_42_49/8%)] supports-backdrop-filter:bg-surface/80 supports-backdrop-filter:backdrop-blur-md"
    )
      .customer-app__header-row(class="flex min-h-11 items-center justify-between")
        RouterLink(
          :to="shell.homeTarget",
          :aria-label="shell.props.home"
        )
          img(
            :src="logoOrange",
            :alt="shell.props.brand",
            width="62",
            height="40",
            class="h-10 w-[62px]"
          )
        button(
          v-if="adviceAction",
          type="button",
          :aria-haspopup="desktopAdvice ? undefined : 'dialog'",
          class="rounded-control bg-accent-gradient px-6 py-3 text-button text-white",
          @click="openAdvice"
        ) {{ adviceAction.label }}
        button.customer-app__menu-trigger(
          v-if="route.meta.showMenu !== false",
          ref="menuTrigger",
          class="flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-canvas",
          type="button",
          :aria-label="shell.props.openMenu",
          aria-haspopup="dialog",
          aria-controls="app-menu",
          :aria-expanded="menuOpen",
          @click="openMenu"
        )
          base-icon(name="menu")
    main#main-content.customer-app__main(
      class="mx-auto flex w-full max-w-[640px] flex-1 flex-col",
      tabindex="-1"
    )
      RouterView(v-slot="{ Component }")
        Transition(
          name="screen",
          mode="out-in",
          @before-leave="holdScreenHeight",
          @enter="screenEntered"
        )
          component(
            :is="Component",
            @action="handlePageAction"
          )
    p.customer-app__notice(
      class="px-5 text-body text-primary empty:hidden",
      role="status",
      aria-live="polite"
    ) {{ notice }}
  dialog#app-menu.customer-app__menu(
    ref="menu",
    class="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-ink",
    :aria-label="shell.props.menu",
    @click.self="closeMenu",
    @keydown="onMenuKeydown",
    @close="onMenuClosed"
  )
    .customer-app__drawer(class="flex h-full w-[calc(100%-48px)] max-w-[324px] flex-col overflow-hidden bg-surface")
      .customer-app__drawer-header(
        class="flex shrink-0 items-center justify-between border-b border-primary-light px-[15px] pt-[max(16px,env(safe-area-inset-top))] pb-5"
      )
        img(
          :src="logoOrange",
          :alt="shell.props.brand",
          width="62",
          height="40",
          class="h-10 w-[62px]"
        )
        button(
          class="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-lg text-primary hover:bg-canvas",
          type="button",
          :aria-label="shell.props.closeMenu",
          autofocus,
          @click="closeMenu"
        )
          base-icon(name="close")
      OverlayScrollbarsComponent.customer-app__drawer-scroll(
        class="min-h-0 flex-1 overflow-auto",
        :defer="true"
      )
        nav(
          class="flex flex-col gap-3 py-3",
          :aria-label="shell.props.navigation"
        )
          template(
            v-for="item in shell.menuItems",
            :key="item.label"
          )
            RouterLink(
              v-if="item.target",
              class="flex min-h-14 items-center gap-3 px-4 py-4 text-body-strong hover:bg-canvas",
              :to="item.target",
              @click="closeMenu"
            )
              base-icon(:name="item.icon")
              span {{ item.label }}
            button(
              v-else,
              class="flex min-h-14 cursor-not-allowed items-center gap-3 px-4 py-4 text-left text-body-strong opacity-50",
              type="button",
              disabled
            )
              base-icon(:name="item.icon")
              span {{ item.label }}
      .customer-app__drawer-footer(
        class="flex shrink-0 justify-center gap-2 border-t border-primary-light bg-canvas px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] text-primary"
      )
        button(
          v-for="social in shell.socials",
          :key="social.icon",
          class="flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-primary-light",
          type="button",
          :aria-label="social.name",
          @click="showUnavailable(social.name)"
        )
          base-icon(
            :name="social.icon",
            class="size-7"
          )
  .customer-app__splash(
    v-if="starting",
    class="fixed inset-0 z-50 flex items-center justify-center bg-primary",
    role="status",
    :aria-label="shell.props.welcome"
  )
    img(
      :src="logoYellow",
      :alt="shell.props.brand",
      width="207",
      height="134",
      class="h-[134px] w-[207px] max-w-[70%] object-contain"
    )
</template>

<style scoped>
.customer-app__menu::backdrop {
  background: rgb(37 42 49 / 80%);
}
@media (prefers-reduced-motion: no-preference) {
  .screen-enter-active {
    transition:
      opacity 250ms ease-out,
      transform 250ms ease-out;
  }
  .screen-leave-active {
    transition: opacity 100ms ease-out;
    pointer-events: none;
  }
  .screen-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .screen-leave-to {
    opacity: 0;
  }
  .customer-app__menu[open] .customer-app__drawer {
    animation: drawer-enter 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .customer-app__menu[open]::backdrop {
    animation: backdrop-enter 150ms ease-out;
  }
  @keyframes backdrop-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes drawer-enter {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
}
</style>

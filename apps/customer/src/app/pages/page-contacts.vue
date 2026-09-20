<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { previewSession } from '../preview-flow'
import { safeContactHref, type ContactsView } from './fixtures/contacts'
const props = defineProps<{ view: ContactsView }>()
const router = useRouter()
const notice = ref('')
watch(
  () => props.view,
  () => {
    notice.value = ''
  }
)
const tones = { open: 'text-success', closing: 'text-accent', closed: 'text-danger' }
function act(action: 'resolved' | 'alternatives') {
  if (!props.view.allowedActions.includes(action)) return
  if (action === 'resolved' && props.view.actionTargets?.resolved) {
    if (previewSession.value) previewSession.value.thankYouReturnTarget = props.view.screen
    void router.push({ name: props.view.actionTargets.resolved })
    return
  }
  if (action === 'alternatives' && props.view.actionTargets?.alternatives) {
    if (previewSession.value) previewSession.value.selfHelpReturnTarget = props.view.screen
    void router.push({ name: props.view.actionTargets.alternatives })
    return
  }
  notice.value = props.view.copy.unavailable
}
</script>

<template lang="pug">
.customer-contacts(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: view.backTarget })"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p {{ view.copy.description }}
  p(class="px-4 text-center text-small text-primary") {{ view.copy.preview }}
  .customer-contacts__blocks(class="flex flex-col gap-4 p-4")
    template(
      v-for="block in view.blocks",
      :key="block.id"
    )
      section.customer-contact-card(
        v-if="block.kind === 'contact'",
        class="overflow-hidden rounded-control bg-surface shadow-[0_2px_6px_rgb(37_42_49/16%)]",
        :aria-labelledby="'contact-' + block.id"
      )
        header(class="flex items-center gap-2 bg-accent-light px-5 pt-5 pb-4")
          h2(
            :id="'contact-' + block.id",
            class="min-w-0 flex-1 text-heading-2"
          ) {{ block.title }}
          span(
            v-if="block.distance",
            class="shrink-0"
          ) {{ block.distance }}
        div(
          v-if="block.address || block.availability",
          class="flex flex-col gap-4 px-5 py-5"
        )
          p(v-if="block.address") {{ block.address }}
          p(
            v-if="block.availability",
            class="text-body-strong",
            :class="tones[block.availability.tone]"
          ) {{ block.availability.label }}
        div(
          v-if="block.phone || block.navigation",
          class="flex items-center justify-between gap-2 border-t border-line px-5 pt-4 pb-5"
        )
          component(
            :is="safeContactHref(block.phone.href, 'phone') ? 'a' : 'span'",
            v-if="block.phone",
            :href="safeContactHref(block.phone.href, 'phone')",
            class="flex min-h-11 items-center gap-1 text-button text-primary"
          )
            base-icon(name="phone")
            span {{ block.phone.label }}
          component(
            :is="safeContactHref(block.navigation.href, 'web') ? 'a' : 'button'",
            v-if="block.navigation",
            :href="safeContactHref(block.navigation.href, 'web')",
            :disabled="!safeContactHref(block.navigation.href, 'web')",
            :aria-label="block.navigation.label",
            class="flex size-11 shrink-0 items-center justify-center rounded-control border border-primary text-primary disabled:opacity-40"
          )
            base-icon(name="navigation")
      section.customer-contact-notice(
        v-else-if="block.kind === 'notice'",
        class="rounded-control border border-warning px-5 py-4",
        :class="block.emphasis === 'critical' ? 'bg-warning border-2' : 'bg-warning-light'"
      )
        div(class="mb-2 flex items-center gap-2")
          base-icon(name="important")
          h2(class="text-heading-3") {{ block.title }}
        p {{ block.description }}
      section(v-else-if="block.kind === 'instructions'")
        h2(class="mb-3 text-heading-3 text-primary") {{ block.title }}
        ul(class="list-disc space-y-3 pl-5 marker:text-primary")
          li(
            v-for="item in block.items",
            :key="item.id"
          ) {{ item.text }}
      p(
        v-else-if="block.kind === 'link'",
        class="px-1 py-5"
      )
        | {{ block.description }}
        | {{ ' ' }}
        component(
          :is="safeContactHref(block.link.href, 'web') ? 'a' : 'span'",
          :href="safeContactHref(block.link.href, 'web')",
          class="text-body-strong text-accent underline"
        ) {{ block.link.label }}
  footer(class="sticky bottom-0 z-20 mt-auto flex flex-col gap-4 bg-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]")
    div(
      aria-hidden="true",
      class="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-linear-to-b from-transparent to-canvas"
    )
    button(
      type="button",
      class="w-full rounded-control bg-primary-gradient p-4 text-button text-white shadow-brand disabled:opacity-40",
      :disabled="!view.allowedActions.includes('resolved')",
      @click="act('resolved')"
    ) {{ view.copy.resolved }}
    button(
      type="button",
      class="w-full rounded-control border border-primary bg-surface p-4 text-button text-primary disabled:opacity-40",
      :disabled="!view.allowedActions.includes('alternatives')",
      @click="act('alternatives')"
    ) {{ view.copy.alternatives }}
    p(
      v-if="notice",
      role="status",
      class="text-center text-primary"
    ) {{ notice }}
</template>

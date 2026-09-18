<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { HomeView } from './home-view'

const props = defineProps<{ view: HomeView }>()
const emit = defineEmits<{ action: [id: string] }>()
const notice = ref('')
const gradients = ['bg-primary-gradient', 'bg-primary-gradient-1', 'bg-primary-gradient-2', 'bg-primary-gradient-3']
async function requestAction(id: string) {
  if (!props.view.allowedActions.includes(id)) return
  emit('action', id)
  notice.value = ''
  await nextTick()
  notice.value = props.view.props.actionNotice
}
</script>

<template lang="pug">
.customer-home(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  header.customer-home__intro(class="px-5 pt-[30px] pb-3")
    h1(class="mb-1 text-heading-1") {{ view.props.title }}
    p(class="text-body") {{ view.props.description }}
  section.customer-home__draft(
    v-if="view.props.draft",
    class="mx-4 mt-2 border-y border-primary-light pt-2 pb-6"
  )
    h2(class="px-2 py-3 text-heading-1") {{ view.props.draft.heading }}
    .customer-home__draft-card(
      class="mt-2 flex flex-col gap-6 rounded-control bg-surface px-4 pt-6 pb-4 shadow-[0_2px_6px_rgb(37_42_49/16%)]"
    )
      .customer-home__progress(
        class="h-2 overflow-hidden rounded bg-primary-light shadow-[inset_0_2px_4px_rgb(83_71_155/16%)]",
        role="progressbar",
        :aria-label="view.props.draft.progressLabel",
        :aria-valuenow="Math.max(0, Math.min(100, view.props.draft.progress))",
        :aria-valuemin="0",
        :aria-valuemax="100"
      )
        .customer-home__progress-fill(
          class="h-full rounded bg-primary-gradient",
          :style="{ width: `${Math.max(0, Math.min(100, view.props.draft.progress))}%` }"
        )
      .customer-home__draft-info(class="flex flex-col gap-4")
        h3(class="text-heading-2") {{ view.props.draft.title }}
        ul(class="flex flex-wrap items-center gap-2")
          li(
            v-for="(part, index) in view.props.draft.summary",
            :key="index",
            class="flex items-center gap-2"
          )
            span(
              v-if="index",
              class="size-2 shrink-0 rounded-full bg-accent",
              aria-hidden="true"
            )
            span {{ part }}
      .customer-home__draft-actions(class="flex gap-4")
        button(
          v-for="action in view.props.draft.actions",
          :key="action.id",
          type="button",
          class="min-h-13 min-w-0 flex-1 cursor-pointer rounded-control p-4 text-button disabled:cursor-not-allowed disabled:opacity-50",
          :class="action.appearance === 'primary' ? 'bg-primary-gradient text-white shadow-brand' : 'border border-primary bg-surface text-primary'",
          :disabled="!view.allowedActions.includes(action.id)",
          @click="requestAction(action.id)"
        ) {{ action.label }}
  section.customer-home__situations(
    class="flex flex-col gap-5 p-4",
    :aria-label="view.props.situationsLabel"
  )
    .customer-home__choices(class="flex flex-col gap-4")
      button.customer-home__choice(
        v-for="(item, index) in view.props.situations",
        :key="item.id",
        type="button",
        class="flex w-full cursor-pointer items-center gap-4 rounded-control px-6 py-4 text-left text-button disabled:cursor-not-allowed disabled:opacity-50",
        :class="item.appearance === 'secondary' ? 'border border-primary bg-surface text-primary' : [gradients[index % gradients.length], 'text-white shadow-brand']",
        :disabled="!view.allowedActions.includes(item.action)",
        @click="requestAction(item.action)"
      )
        base-icon(
          :name="item.icon",
          class="size-8"
        )
        span {{ item.label }}
    .customer-home__anonymous(
      class="flex items-center gap-3 rounded-control bg-primary-light px-5 py-4 text-body-strong text-primary"
    )
      base-icon(name="notice-info")
      p {{ view.props.anonymousNotice }}
    p.customer-home__preview(class="text-center text-small text-primary") {{ view.props.previewNotice }}
    p(
      class="text-center text-body text-primary empty:hidden",
      role="status",
      aria-live="polite"
    ) {{ notice }}
  section.customer-home__about(class="pt-5 pb-4")
    header(class="bg-surface px-5 pt-5 pb-3 [@media(width>640px)]:rounded-t-control")
      h2(class="mb-1 text-heading-1") {{ view.props.about.title }}
      p {{ view.props.about.description }}
    .customer-home__sections(class="bg-surface px-4 pb-2 [@media(width>640px)]:rounded-b-control")
      details.customer-home__section(
        v-for="section in view.props.sections",
        :key="section.id",
        class="group border-t border-primary-light py-2"
      )
        summary(
          class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-2 px-1 text-heading-1 [&::-webkit-details-marker]:hidden"
        )
          span {{ section.title }}
          base-icon(
            name="chevron-down",
            class="size-10 group-open:rotate-180"
          )
        .customer-home__section-content(class="px-1 pt-2 pb-4")
          p(
            v-for="(paragraph, index) in section.paragraphs",
            :key="index",
            class="mb-2 last:mb-0"
          ) {{ paragraph }}
  footer.customer-home__footer(class="mt-auto px-4 pt-6 pb-[max(24px,env(safe-area-inset-bottom))] text-center text-primary")
    .customer-home__socials(class="mb-4 flex justify-center gap-2")
      button(
        v-for="social in view.props.socials",
        :key="social.action",
        class="flex size-11 items-center justify-center rounded-lg disabled:cursor-not-allowed",
        type="button",
        :aria-label="social.label",
        :disabled="!view.allowedActions.includes(social.action)",
        @click="requestAction(social.action)"
      )
        base-icon(
          :name="social.icon",
          class="size-7"
        )
    p(class="text-small text-primary") {{ view.props.copyright }}
</template>

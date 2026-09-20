<script setup lang="ts">
import { useRouter } from 'vue-router'
import HelpText from '../components/help-text.vue'
import { previewSession } from '../preview-flow'
import type { SelfHelpView } from './fixtures/self-help'
const props = defineProps<{ view: SelfHelpView }>()
const router = useRouter()
function act(action: 'resolved' | 'unresolved') {
  if (!props.view.allowedActions.includes(action)) return
  if (previewSession.value) previewSession.value.thankYouReturnTarget = props.view.screen
  void router.push({ name: props.view.actionTargets[action] })
}
</script>

<template lang="pug">
.customer-self-help(
  class="flex flex-1 flex-col",
  :lang="view.locale"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 text-heading-2 text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="router.push({ name: previewSession?.selfHelpReturnTarget ?? view.backTarget })"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p {{ view.copy.description }}
  p(class="px-4 text-center text-small text-primary") {{ view.copy.preview }}
  div(class="flex flex-col gap-4 p-4")
    template(
      v-for="block in view.blocks",
      :key="block.id"
    )
      hr(
        v-if="block.kind === 'divider'",
        class="border-primary-light"
      )
      section(
        v-else-if="block.kind === 'notice'",
        class="rounded-control border px-5 py-4",
        :class="block.tone === 'danger' ? 'border-danger bg-danger-light' : 'border-warning bg-warning-light'"
      )
        div(
          class="mb-2 flex items-center gap-2",
          :class="block.tone === 'danger' ? 'text-danger' : 'text-ink'"
        )
          base-icon(:name="block.tone === 'danger' ? 'attention' : 'important'")
          h2(class="text-heading-3") {{ block.title }}
        p
          HelpText(:content="block.content")
      section(
        v-else,
        class="space-y-2 px-1 py-1"
      )
        h2(class="text-heading-3") {{ block.title }}
        template(v-if="block.kind === 'section'")
          p(
            v-for="(paragraph, index) in block.paragraphs",
            :key="index"
          )
            HelpText(:content="paragraph")
        component(
          :is="block.ordered ? 'ol' : 'ul'",
          v-else,
          class="space-y-3 pl-5",
          :class="block.ordered ? 'list-decimal' : 'list-disc'"
        )
          li(
            v-for="item in block.items",
            :key="item.id"
          )
            HelpText(:content="item.content")
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
      :disabled="!view.allowedActions.includes('unresolved')",
      @click="act('unresolved')"
    ) {{ view.copy.unresolved }}
</template>

<script setup lang="ts">
import PageActions from '../components/page-actions.vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HelpText from '../components/help-text.vue'
import HelpImage from '../components/help-image.vue'
import { previewSession } from '../preview-flow'
import { backWithinFlow, contactScreens } from '../instruction-navigation'
import { safeContactHref } from './fixtures/contacts'
import type { InstructionsView, InstructionAction } from './fixtures/instructions'
const props = defineProps<{ view: InstructionsView }>()
const router = useRouter()
const notice = ref('')
watch(
  () => props.view,
  () => {
    notice.value = ''
  }
)
const tones = { open: 'text-success', closing: 'text-accent', closed: 'text-danger' }
function goBack() {
  if (!props.view.allowedActions.includes('back')) return
  backWithinFlow(router, props.view.backTarget, props.view.screen === 'W22' ? contactScreens : [props.view.backTarget])
}
function act(action: InstructionAction) {
  if (!props.view.allowedActions.includes(action.id)) return
  if (!['W22', 'W24', 'W25', 'W37'].includes(action.target)) {
    notice.value = props.view.copy.unavailable
    return
  }
  if (previewSession.value) {
    if (action.target === 'W24' || action.target === 'W25')
      previewSession.value.thankYouReturnTarget = props.view.screen
  }
  void router.push({ name: action.target })
}
</script>

<template lang="pug">
.customer-instructions(
  class="flex flex-1 flex-col",
  :lang="view.locale",
  :class="view.screen === 'W22' ? 'customer-self-help' : 'customer-contacts'"
)
  div(class="px-4 pt-5 pb-1")
    button(
      type="button",
      class="mb-4 flex min-h-11 items-center gap-1 font-form text-back text-primary",
      :disabled="!view.allowedActions.includes('back')",
      @click="goBack"
    )
      base-icon(name="back")
      span {{ view.copy.back }}
    hr(class="border-primary-light")
  header(class="px-5 pt-5 pb-3")
    h1(class="mb-1 text-heading-1") {{ view.copy.title }}
    p {{ view.copy.description }}
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
        v-else-if="block.kind === 'notice' && 'emphasis' in block",
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
      hr(
        v-else-if="block.kind === 'divider'",
        class="border-primary-light"
      )
      section(
        v-else-if="block.kind === 'notice' && 'tone' in block",
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
        v-else-if="block.kind === 'images'",
        class="space-y-3"
      )
        h2(
          v-if="block.title",
          class="text-heading-3"
        ) {{ block.title }}
        div(class="grid grid-cols-2 gap-4")
          HelpImage(
            v-for="item in block.items",
            :key="item.id",
            :image="item"
          )
      section(
        v-else-if="block.kind === 'section' || block.kind === 'list'",
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
  PageActions(
    v-if="view.footerActions.length",
    class="flex flex-col gap-4"
  )
    button(
      v-for="action in view.footerActions",
      :key="action.id",
      type="button",
      class="ui-button w-full rounded-control p-4 text-button disabled:opacity-40",
      :class="action.appearance === 'primary' ? 'bg-primary-gradient text-white shadow-brand' : 'border border-primary bg-surface text-primary'",
      :disabled="!view.allowedActions.includes(action.id)",
      @click="act(action)"
    ) {{ action.label }}
    p(
      v-if="notice",
      role="status",
      class="text-center text-primary"
    ) {{ notice }}
</template>

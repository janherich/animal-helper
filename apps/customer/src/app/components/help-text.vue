<script setup lang="ts">
import { safeContactHref } from '../pages/fixtures/contacts'
import type { HelpText } from '../pages/fixtures/self-help'
defineProps<{ content: HelpText }>()
</script>

<template lang="pug">
template(
  v-for="(part, index) in content",
  :key="index"
)
  component(
    :is="safeContactHref(part.href, 'web') ? 'a' : 'span'",
    :href="safeContactHref(part.href, 'web')",
    :class="safeContactHref(part.href, 'web') ? 'text-primary underline' : undefined"
  )
    component(:is="part.emphasis === 'strong' ? 'strong' : part.emphasis === 'em' ? 'em' : 'span'") {{ part.text }}
</template>

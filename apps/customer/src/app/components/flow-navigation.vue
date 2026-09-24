<script setup lang="ts">
import { inject } from 'vue'
import BaseIcon from '@/libs/components/base-icon.vue'
import { requestFlowExit } from '../flow-exit'

defineProps<{ back: string; backDisabled?: boolean }>()
defineEmits<{ back: [] }>()
const requestExit = inject(requestFlowExit, undefined)
</script>

<template lang="pug">
div(class="px-4 pt-5 pb-1")
  div(class="mb-4 flex min-h-11 items-center justify-between gap-4")
    button(
      type="button",
      class="flex min-h-11 items-center gap-1 font-form text-back text-primary",
      :disabled="backDisabled",
      @click="$emit('back')"
    )
      BaseIcon(name="back")
      span {{ back }}
    button(
      v-if="requestExit",
      type="button",
      class="-mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary-light",
      aria-label="Opustiť hlásenie prípadu",
      aria-haspopup="dialog",
      @click="requestExit($event.currentTarget)"
    )
      BaseIcon(name="close")
  hr(class="border-primary-light")
</template>

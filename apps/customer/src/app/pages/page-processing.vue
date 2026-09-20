<script setup lang="ts">
import search from '@/assets/brand/processing-search.svg'
import eye from '@/assets/brand/processing-eye.svg'
import pupil from '@/assets/brand/processing-pupil.svg'
import closedEye from '@/assets/brand/processing-eye-closed.svg'

defineProps<{ title: string; preview?: string }>()
</script>

<template lang="pug">
section.customer-processing(class="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center")
  .customer-processing__graphic(
    class="relative size-[120px] shrink-0 overflow-hidden",
    aria-hidden="true"
  )
    div(class="absolute inset-[15%_13.33%_14.17%_15%]")
      img(
        :src="search",
        alt="",
        class="size-full"
      )
    div(class="absolute top-7 left-[23.33%] size-12 overflow-hidden")
      .customer-processing__eye(class="absolute inset-[18.75%_7.52%_22.92%_7.52%]")
        img(
          :src="eye",
          alt="",
          class="size-full"
        )
      .customer-processing__closed(class="absolute inset-[47.1%_7.52%_22.92%_7.52%]")
        img(
          :src="closedEye",
          alt="",
          class="size-full"
        )
      .customer-processing__pupil(class="absolute inset-[31.25%_33.01%_34.77%_33.01%]")
        img(
          :src="pupil",
          alt="",
          class="size-full"
        )
  h1(
    class="pt-5 pb-3 text-heading-1",
    aria-live="polite"
  ) {{ title }}
</template>

<style scoped>
.customer-processing__closed {
  opacity: 0;
}
/* Figma poses with approved local timing; the magnifier itself never moves. */
@media (prefers-reduced-motion: no-preference) {
  .customer-processing__pupil {
    animation: processing-look 3s ease-in-out infinite;
  }
  .customer-processing__eye {
    animation: processing-blink 3s ease-in-out infinite;
    transform-origin: center bottom;
  }
  .customer-processing__closed {
    animation: processing-lid 3s ease-in-out infinite;
  }
}
@keyframes processing-look {
  0%,
  12%,
  100% {
    transform: translate(-10px, 0);
    opacity: 1;
  }
  32%,
  44% {
    transform: translate(10px, 0);
    opacity: 1;
  }
  56%,
  66% {
    transform: translate(0, 0);
    opacity: 1;
  }
  72% {
    transform: translate(0, 5px);
    opacity: 1;
  }
  76%,
  80% {
    transform: translate(0, 5px);
    opacity: 0;
  }
  86%,
  90% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
@keyframes processing-blink {
  0%,
  66%,
  86%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
  72% {
    transform: scaleY(0.68);
    opacity: 1;
  }
  76%,
  80% {
    transform: scaleY(0.5);
    opacity: 0;
  }
}
@keyframes processing-lid {
  0%,
  72%,
  86%,
  100% {
    opacity: 0;
  }
  76%,
  80% {
    opacity: 1;
  }
}
</style>

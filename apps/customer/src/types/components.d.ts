import type BaseExpander from '../libs/components/base-expander.vue'
import type BaseIcon from '../libs/components/base-icon.vue'
declare module 'vue' {
  // Vue's public registry uses interface augmentation.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface GlobalComponents {
    BaseIcon: typeof BaseIcon
    BaseExpander: typeof BaseExpander
  }
}
export {}

import { shallowRef } from 'vue'

// App-owned so the closing animation survives replacement of the submitted page.
export const completion = shallowRef<{ label: string; target: string } | null>(null)

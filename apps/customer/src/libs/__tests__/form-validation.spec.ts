import type { FormValidation } from '@/app/contracts/validation'
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useFormValidation } from '../use-form-validation'

it('copies response errors, links messages and clears only edited fields', async () => {
  const response = ref<FormValidation>({
    formErrors: ['Rejected'],
    fieldErrors: { email: ['Invalid'], name: ['Required'] }
  })
  let validation!: ReturnType<typeof useFormValidation>
  const wrapper = mount(
    defineComponent({
      setup() {
        validation = useFormValidation(() => response.value)
        return () => null
      }
    })
  )
  expect(validation.attrs('email')['aria-describedby']).toBe(validation.errorId('email'))
  expect(validation.messages('toString')).toEqual([])
  validation.clear('email')
  expect(validation.attrs('email')['aria-invalid']).toBeUndefined()
  expect(validation.messages('name')).toEqual(['Required'])
  expect(validation.formErrors.value).toEqual([])
  expect(response.value.fieldErrors!.email).toEqual(['Invalid'])
  expect(validation.hasFieldErrors.value).toBe(true)
  validation.clear('name')
  expect(validation.hasFieldErrors.value).toBe(false)
  response.value = { fieldErrors: { email: ['Rejected again'] } }
  await nextTick()
  expect(validation.messages('email')).toEqual(['Rejected again'])
  wrapper.unmount()
})

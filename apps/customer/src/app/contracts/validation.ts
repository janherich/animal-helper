// Presentation of a rejected submission, not client-side business validation.
export type FormValidation = {
  formErrors?: string[]
  fieldErrors?: Record<string, string[]>
}

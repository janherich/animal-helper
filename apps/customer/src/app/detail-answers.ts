import type { DetailQuestion } from './contracts/forms'

export type DetailAnswers = Record<string, string | string[]>

// Retain drafts only for compatible fields. New/retyped fields use supplied defaults.
export function reconcileDetailAnswers(
  questions: DetailQuestion[],
  draft: DetailAnswers,
  defaults: DetailAnswers,
  previous?: DetailQuestion[]
): DetailAnswers {
  const result: DetailAnswers = {}
  for (const question of questions) {
    const compatible = !previous || previous.some(old => old.id === question.id && old.kind === question.kind)
    const source = compatible && Object.hasOwn(draft, question.id) ? draft : defaults
    const value = source[question.id]
    if (question.kind === 'text') {
      if (typeof value === 'string') result[question.id] = value
      continue
    }
    const ids = new Set(question.options.map(option => option.id))
    if (question.kind === 'single' && typeof value === 'string' && ids.has(value)) result[question.id] = value
    if (question.kind === 'multiple' && Array.isArray(value)) {
      const selected = [...new Set(value.filter(id => ids.has(id)))]
      const exclusive = selected.find(id => question.options.find(option => option.id === id)?.exclusive)
      result[question.id] = exclusive ? [exclusive] : selected
    }
    for (const option of question.options) {
      const selection = result[question.id]
      const selected = Array.isArray(selection) ? selection.includes(option.id) : selection === option.id
      const key = `${question.id}:${option.id}`
      if (selected && option.description && typeof source[key] === 'string') result[key] = source[key]
    }
  }
  return result
}

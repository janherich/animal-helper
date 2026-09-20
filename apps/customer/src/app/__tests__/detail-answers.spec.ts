import { expect, it } from 'vitest'
import type { DetailQuestion } from '../contracts/forms'
import { reconcileDetailAnswers } from '../detail-answers'

it('uses defaults for retyped fields and removes obsolete option descriptions', () => {
  const previous: DetailQuestion[] = [{ id: 'a', kind: 'text', label: 'A', required: false, options: [] }]
  const questions: DetailQuestion[] = [
    {
      ...previous[0]!,
      kind: 'multiple',
      options: [
        { id: 'yes', label: 'Yes' },
        { id: 'unknown', label: 'Unknown', exclusive: true }
      ]
    }
  ]
  expect(
    reconcileDetailAnswers(
      questions,
      { a: 'Old text', 'a:yes': 'Stale', removed: 'Old' },
      { a: ['yes', 'unknown'] },
      previous
    )
  ).toEqual({ a: ['unknown'] })
})

import { describe, expect, it } from 'vitest'
import { catalogueAnimals, searchAnimals } from '../animal-catalogue'
import { animalGroupsFixture } from '../pages/fixtures/animal-groups'

describe('shared animal search', () => {
  const animals = catalogueAnimals(animalGroupsFixture.root)
  it.each(['mačka', 'MACKA', '  mač  '])('matches word prefixes without case or diacritics: %s', query => {
    expect(searchAnimals(animals, query).some(animal => animal.id === 'domestic_cat')).toBe(true)
  })
  it('does not suggest branches or all animals for an empty query', () => {
    expect(searchAnimals(animals, 'Hospodárske zvieratá')).toEqual([])
    expect(searchAnimals(animals, '   ')).toEqual([])
    expect(searchAnimals(animals, 'čka')).toEqual([])
    expect(searchAnimals(animals, 'mac').map(animal => animal.id)).toContain('domestic_cat')
  })
})

it('includes every shared catalogue identity exactly once with a navigable path', async () => {
  const { animalKinds } = await import('@animal-helper/guidance/catalog')
  const animals = catalogueAnimals(animalGroupsFixture.root)
  expect(animals.map(animal => animal.id).sort()).toEqual(animalKinds.map(animal => animal.key).sort())
  for (const animal of animals) {
    let parent = animalGroupsFixture.root
    for (const id of animal.path) {
      const next = parent.children.find(node => node.id === id)
      expect(next?.kind).toBe('branch')
      if (next?.kind === 'branch') parent = next
    }
    expect(parent.children.some(node => node.id === animal.id)).toBe(true)
  }
})

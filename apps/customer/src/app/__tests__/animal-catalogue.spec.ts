import { describe, expect, it } from 'vitest'
import { catalogueAnimals, searchAnimals } from '../animal-catalogue'
import { animalGroupsFixture } from '../pages/fixtures/animal-groups'

describe('shared animal search', () => {
  const animals = catalogueAnimals(animalGroupsFixture.root)
  it.each(['mačka', 'MACKA', '  mač  '])('matches word prefixes without case or diacritics: %s', query => {
    expect(searchAnimals(animals, query).some(animal => animal.id === 'cat-domestic')).toBe(true)
  })
  it('does not suggest branches or all animals for an empty query', () => {
    expect(searchAnimals(animals, 'Hospodárske zvieratá')).toEqual([])
    expect(searchAnimals(animals, '   ')).toEqual([])
    expect(searchAnimals(animals, 'čka')).toEqual([])
    expect(searchAnimals(animals, 'mac').map(animal => animal.id)).toEqual(['cat-domestic'])
  })
})

import type { AnimalBranch, AnimalNode } from './pages/fixtures/animal-groups'
export type CatalogueAnimal = Extract<AnimalNode, { kind: 'animal' }> & { path: string[] }
export const normalizeAnimalSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function searchAnimals(animals: CatalogueAnimal[], query: string): CatalogueAnimal[] {
  const needle = normalizeAnimalSearch(query.trim())
  if (!needle) return []
  return animals.filter(animal => {
    const words = normalizeAnimalSearch(animal.label).split(/\s+/)
    return words.some((_, index) => words.slice(index).join(' ').startsWith(needle))
  })
}

export function catalogueAnimals(root: AnimalBranch): CatalogueAnimal[] {
  const animals: CatalogueAnimal[] = []
  function visit(branch: AnimalBranch, path: string[]) {
    for (const node of branch.children) {
      if (node.kind === 'branch') visit(node, [...path, node.id])
      else animals.push({ ...node, path })
    }
  }
  visit(root, [])
  return animals
}

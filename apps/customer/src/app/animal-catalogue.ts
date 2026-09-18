import type { AnimalBranch, AnimalNode } from './pages/fixtures/animal-groups'
export type CatalogueAnimal = Extract<AnimalNode, { kind: 'animal' }> & { path: string[] }
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

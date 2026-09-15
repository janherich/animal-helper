import type { App, Component, Directive } from 'vue'

export function registerModules(
  app: App,
  components: Record<string, { default: Component }>,
  directives: Record<string, { default: Directive }>
): void {
  const componentNames = new Set<string>()
  const directiveNames = new Set<string>()
  for (const [path, module] of Object.entries(components)) {
    const filename =
      path
        .split('/')
        .pop()
        ?.replace(/\.vue$/, '') ?? ''
    if (!/^base-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(filename)) throw new Error(`Invalid base component filename: ${path}`)
    const name = filename
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    if (componentNames.has(name) || app.component(name)) throw new Error(`Duplicate component: ${name}`)
    componentNames.add(name)
    app.component(name, module.default)
  }
  for (const [path, module] of Object.entries(directives)) {
    const name = path.split('/').pop()?.replace(/\.ts$/, '') ?? ''
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid directive filename: ${path}`)
    if (directiveNames.has(name) || app.directive(name)) throw new Error(`Duplicate directive: ${name}`)
    directiveNames.add(name)
    app.directive(name, module.default)
  }
}

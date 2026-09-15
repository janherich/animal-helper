// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { format, resolveConfig, resolveConfigFile } from 'prettier'
import { expect, it } from 'vitest'

it('shares the root config while keeping backend formatting unchanged', async () => {
  const customerPath = fileURLToPath(new URL('../../main.ts', import.meta.url))
  const backendPath = fileURLToPath(new URL('../../../../api/src/main.ts', import.meta.url))
  const configPath = fileURLToPath(new URL('../../../../../prettier.config.mjs', import.meta.url))
  expect(await resolveConfigFile(customerPath)).toBe(configPath)
  expect(await resolveConfigFile(backendPath)).toBe(configPath)
  const options = { ...(await resolveConfig(backendPath)), filepath: backendPath }
  expect(options.trailingComma).toBe('all')
  expect(await format("export const label = 'hello'", options)).toBe('export const label = "hello";\n')
})

it('uses B2B script formatting and sorts imports without removing unused ones', async () => {
  const filepath = fileURLToPath(new URL('../../main.ts', import.meta.url))
  const options = { ...(await resolveConfig(filepath)), filepath }
  const source = `import { ref } from "vue";
import { fileURLToPath } from "node:url";
export const label = (value: string) => ({ text: "hello", value, });
`
  const result = await format(source, options)
  expect(result).toContain("import { fileURLToPath } from 'node:url'")
  expect(result).toContain("import { ref } from 'vue'")
  expect(result.indexOf("from 'node:url'")).toBeLessThan(result.indexOf("from 'vue'"))
  expect(result).toContain("text: 'hello', value }")
  expect(result).not.toContain(';')
  expect(options.printWidth).toBe(120)
  expect(await format('export const identity = (value) => value;', options)).toBe(
    'export const identity = value => value\n'
  )
  expect(await format(result, options)).toBe(result)
})

it('preserves semantic Pug classes and utility attributes idempotently', async () => {
  const filepath = fileURLToPath(new URL('../../app/pages/page-home.vue', import.meta.url))
  const options = { ...(await resolveConfig(filepath)), filepath }
  const source =
    '<template lang="pug">\nsection.report-location(class="p-4 flex gap-6")\n  base-icon.report-location__icon(name="search" class="size-6")\n</template>\n'
  const result = await format(source, options)
  expect(result).toContain('section.report-location')
  expect(result).toContain('base-icon.report-location__icon')
  expect(result).toContain('class="flex gap-6 p-4"')
  expect(await format(result, options)).toBe(result)
})

/**
 * Node --experimental-strip-types loads .ts files but does not remap the
 * TypeScript ESM convention of importing ./file.js to ./file.ts.
 */
export const resolve = async (specifier, context, nextResolve) => {
  const parent = context.parentURL ?? "";

  if (specifier.endsWith(".js") && parent.endsWith(".ts")) {
    try {
      return await nextResolve(`${specifier.slice(0, -3)}.ts`, context);
    } catch {
      return nextResolve(specifier, context);
    }
  }

  return nextResolve(specifier, context);
};

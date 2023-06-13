import { defineConfig } from 'tsup'

const baseConfig = {
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
}

export default defineConfig([
  { ...baseConfig, format: ['cjs', 'esm'], treeshake: true },
  {
    ...baseConfig,
    format: ['iife'],
    globalName: 'SearchApplicationClientDefault',
    footer: {
      js: 'var SearchApplicationClient = SearchApplicationClientDefault.default',
    },
  },
])

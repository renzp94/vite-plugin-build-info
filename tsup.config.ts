import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm'],
  clean: true,
  sourcemap: true,
  dts: './src/index.ts',
  entry: ['src/index.ts'],
  target: 'esnext',
  outDir: 'dist',
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { build as esbuildBundle } from 'esbuild'
import path from 'path'
import fs from 'fs'

// Pre-bundle recharts with esbuild so Rollup never sees its circular ESM deps.
const prebuilt = path.resolve('./node_modules/.recharts-prebuilt.js')
if (!fs.existsSync(prebuilt)) {
  await esbuildBundle({
    entryPoints: ['recharts'],
    bundle: true,
    format: 'esm',
    outfile: prebuilt,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    platform: 'browser',
  })
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { recharts: prebuilt },
  },
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        // /try is the try-it install script, not a page; it does not exist yet.
        filter: (page) => page.path !== '/try',
      },
      pages: [{ path: '/404', prerender: { outputPath: '/404.html' } }],
    }),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
})

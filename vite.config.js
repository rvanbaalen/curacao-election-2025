import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  base: "/curacao-election-2025/",
  plugins: [
    tailwindcss(),
  ],
})

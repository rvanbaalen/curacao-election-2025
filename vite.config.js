import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  base: "/curacao-election-2025/",
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@js": resolve(__dirname, "js"),
      "~": resolve(__dirname, "node_modules"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        en: resolve(__dirname, "en/index.html"),
        es: resolve(__dirname, "es/index.html"),
        pa: resolve(__dirname, "pa/index.html"),
      },
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}))

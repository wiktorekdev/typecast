import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("@phosphor-icons")) return "icons"
          if (
            id.includes("react-dom") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules\\react\\")
          ) {
            return "react"
          }
        },
      },
    },
  },
})

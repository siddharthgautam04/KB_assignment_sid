// scheduler_frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
// import { componentTagger } from "lovable-tagger"; // ⟵ disable

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // was "::", both work
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // mode === "development" && componentTagger(), // ⟵ disable
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
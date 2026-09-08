import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const apiProxy = {
  "/commands": {
    target: "http://127.0.0.1:8787",
    changeOrigin: false,
  },
  "/status": {
    target: "http://127.0.0.1:8787",
    changeOrigin: false,
  },
  "/guidance": {
    target: "http://127.0.0.1:8787",
    changeOrigin: false,
  },
} as const;

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
  },
});

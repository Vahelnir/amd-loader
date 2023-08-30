import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

const MINIFY = !!process.env.MINIFY;

export default defineConfig({
  build: {
    minify: MINIFY,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "amd_loader",
      fileName: () => (MINIFY ? "amd-loader.min.js" : "amd-loader.js"),
      formats: ["iife"],
    },
    rollupOptions: {
      external: ["appContext"],
      output: {
        globals: { appContext: "this || globalThis" },
      },
    },
  },
  plugins: [],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

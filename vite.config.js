import { defineConfig } from "vite";
import { resolve } from "node:path";

const MINIFY = !!process.env.MINIFY;

export default defineConfig({
  build: {
    minify: MINIFY,
    lib: {
      entry: resolve(__dirname, "src/main.js"),
      name: "amd_loader",
      fileName: () => (MINIFY ? "amd-loader.min.js" : "amd-loader.js"),
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        globals: { global: "global" },
      },
      external: ["global"],
    },
  },
  plugins: [],
});

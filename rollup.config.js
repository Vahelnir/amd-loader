import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";

const MINIFY = !!process.env.MINIFY;

export default defineConfig({
  input: "src/main.js",
  output: {
    file: MINIFY ? "dist/amd-loader.min.js" : "dist/amd-loader.js",
    format: "iife",
    globals: { global: "global" },
  },
  external: ["global"],
  plugins: [MINIFY && terser()],
});

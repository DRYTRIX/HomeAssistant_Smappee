import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../static"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/main.ts"),
      output: {
        entryFileNames: "panel.js",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
});

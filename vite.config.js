import react from "@vitejs/plugin-react";
import fs from "fs";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  // GitHub Pages deployment path
  base: "/cx-one/",

  esbuild: {
    tsconfigRaw: fs.readFileSync(
      "./tsconfig.app.json"
    ),
  },
});
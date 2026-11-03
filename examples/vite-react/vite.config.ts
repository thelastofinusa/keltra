import react from "@vitejs/plugin-react";
import keltra from "keltra/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), keltra()],
});

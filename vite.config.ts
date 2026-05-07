import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 9560,
    host: true,
    // Allow Tailscale hostname when accessing from another device (e.g. headless Nvidia Spark)
    allowedHosts: ["cobec-spark"],
  },
});

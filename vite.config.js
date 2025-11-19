import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allows access from external devices
    allowedHosts: true, // Accepts ngrok domain
    cors: true, // Prevents asset loading issues
    strictPort: true, // Ensures Vite always uses the same port
  },
});

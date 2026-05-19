import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // Disable HMR overlay to prevent infinite loop issues
    },
  },
  define: {
    'process.env': {}, // Fix for process is not defined
  },
});
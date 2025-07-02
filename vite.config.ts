import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Ians-Parser/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
});

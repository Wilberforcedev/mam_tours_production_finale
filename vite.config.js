import { defineConfig } from 'vite';

// The static homepage is Vite's entry point; no Laravel resources are present.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

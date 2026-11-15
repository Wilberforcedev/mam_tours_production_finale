import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Build each public route as a standalone HTML entry point.
const pages = [
  'index',
  'destinations',
  'journeys',
  'offers',
  'about',
  'help',
  'contact',
  'tour-kenya',
  'tour-japan',
  'tour-italy',
  'tour-peru',
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(process.cwd(), `${page}.html`)]),
      ),
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});

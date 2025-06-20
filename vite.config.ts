import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Use legacy build for better compatibility
    target: 'es2015',
    // Ensure proper module format
    rollupOptions: {
      output: {
        // Use .js extension for all JavaScript files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Ensure ES modules format
        format: 'es'
      }
    },
    // Minify for production
    minify: 'terser',
    // Source maps for debugging
    sourcemap: false
  },
  // Use relative paths for deployment
  base: './',
  // Ensure proper server configuration
  server: {
    headers: {
      'Content-Type': 'application/javascript'
    }
  }
});
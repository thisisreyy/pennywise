import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Target modern browsers for better performance
    target: 'es2020',
    // Ensure proper module format
    rollupOptions: {
      output: {
        // Use .js extension for all JavaScript files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Use ES modules format but ensure compatibility
        format: 'es',
        // Add explicit module markers
        banner: '/* ES Module */',
        // Ensure proper exports
        exports: 'auto'
      }
    },
    // Enable Terser minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true
      },
      format: {
        comments: false
      }
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Force proper file extensions
    outDir: 'dist',
    emptyOutDir: true
  },
  // Use absolute paths for production
  base: '/',
  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    // Add MIME type handling for dev server
    middlewareMode: false,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  // Preview configuration
  preview: {
    port: 4173,
    open: true,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  }
});
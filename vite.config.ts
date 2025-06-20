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
        // Use .js extension for all JavaScript files (critical for MIME type)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Use ES modules format (works better with modern hosting)
        format: 'es'
        // Removed manualChunks - conflicts with inlineDynamicImports
      }
    },
    // Enable Terser minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Source maps for debugging (disable for production)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Use relative paths for deployment
  base: './'
});
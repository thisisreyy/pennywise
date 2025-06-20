import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Use legacy build for better hosting compatibility
    target: 'es2015',
    // Ensure proper module format
    rollupOptions: {
      output: {
        // CRITICAL: Use .js extension for all JavaScript files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Use IIFE format for better hosting compatibility
        format: 'iife',
        // Ensure proper globals for IIFE
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    // Enable Terser minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    },
    // Disable source maps for production
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Use relative paths
    base: './'
  },
  // Server configuration for development
  server: {
    port: 3000,
    open: true
  },
  // Preview configuration
  preview: {
    port: 4173,
    open: true
  }
});
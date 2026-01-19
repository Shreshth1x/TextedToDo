import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'date-fns',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'lucide-react',
    ],
    // Exclude heavy deps from pre-bundling - let them be lazy-loaded
    exclude: ['recharts'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  esbuild: {
    target: 'esnext',
    legalComments: 'none',
  },

  server: {
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/layouts/AppLayout.tsx',
        './src/components/NewHeader.tsx',
        './src/components/timeline/TimelineView.tsx',
        './src/components/timeline/TimelineGrid.tsx',
        './src/components/classes/ClassesSidebar.tsx',
        './src/hooks/useTodos.ts',
        './src/hooks/useClasses.ts',
        './src/hooks/useTimelineTodos.ts',
        './src/lib/supabase.ts',
      ],
    },
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})

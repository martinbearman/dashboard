import { readFileSync } from 'fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';

/** Match Next webpack `asset/source` so `import x from '*.properties'` resolves to the file text in Vitest. */
function propertiesAsString(): Plugin {
  return {
    name: 'properties-as-string',
    load(id) {
      if (id.endsWith('.properties')) {
        const content = readFileSync(id, 'utf-8');
        return `export default ${JSON.stringify(content)}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [propertiesAsString(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});


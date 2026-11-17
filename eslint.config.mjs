import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Domain rules stay pure: no React, Next, store, UI or browser code (docs/adr/0003-domain-rules-as-pure-functions.md).
    files: ['src/lib/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'next', 'next/*', '@/*', '../*'],
              message: 'Domain files import only other domain files.',
            },
          ],
        },
      ],
    },
  },
  {
    // Playwright fixtures call a function named `use`; that is Playwright's API, not a React hook.
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'e2e/report/**', 'e2e/test-results/**']),
]);

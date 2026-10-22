import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import testingLibrary from 'eslint-plugin-testing-library';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      prettier,
      'testing-library': testingLibrary,
    },
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        project: ['tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  globalIgnores([
    '**/jest.config.js',
    '**/jest.setup.js',
    '**/lint-staged.config.js',
    '**/next.config.js',
    '**/prettier.config.js',
    '**/eslint.config.mjs',
    'postcss.config.mjs',
    '.next',
    '.yarn',
    '.swc',
    'node_modules',
  ]),
  nextCoreWebVitals,
  nextTypescript,
]);

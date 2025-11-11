import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import { ESLint } from 'eslint';

// Filter out the config that defines @typescript-eslint plugin to avoid redefinition
const filteredNextConfig = nextCoreWebVitals.filter(
  (config) => !(config.plugins && config.plugins['@typescript-eslint'])
);

/** @type {ESLint.ConfigData[]} */
export default [
  ...filteredNextConfig,
  {
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {},
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'testing-library': testingLibrary,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
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
  {
    ignores: [
      '**/jest.config.js',
      '**/jest.setup.js',
      '**/lint-staged.config.js',
      '**/next.config.js',
      '**/prettier.config.js',
      '**/eslint.config.mjs',
      '.next',
      '.yarn',
      '.swc',
      'node_modules',
    ],
  },
];

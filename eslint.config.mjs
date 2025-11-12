import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import { ESLint } from 'eslint';

// Fix for globals@16.4.0 whitespace bug in Next.js 16.0.2
// See: https://github.com/sindresorhus/globals/issues/239
function fixGlobalsWhitespace(globalsObj) {
  if (!globalsObj) return globalsObj;

  const fixed = { ...globalsObj };

  // Fix known globals with trailing whitespace
  if ('AudioWorkletGlobalScope ' in fixed) {
    fixed.AudioWorkletGlobalScope = fixed['AudioWorkletGlobalScope '];
    delete fixed['AudioWorkletGlobalScope '];
  }

  return fixed;
}

// Filter out the config that defines @typescript-eslint plugin to avoid redefinition
const filteredNextConfig = nextCoreWebVitals
  .filter((config) => !(config.plugins && config.plugins['@typescript-eslint']))
  .map((config) => {
    if (config.languageOptions?.globals) {
      return {
        ...config,
        languageOptions: {
          ...config.languageOptions,
          globals: fixGlobalsWhitespace(config.languageOptions.globals),
        },
      };
    }
    return config;
  });

/** @type {ESLint.ConfigData[]} */
export default [
  ...filteredNextConfig,
  {
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {},
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

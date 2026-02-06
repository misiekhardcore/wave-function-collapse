import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-plugin-prettier';
import testingLibrary from 'eslint-plugin-testing-library';

// Modify the Next.js config to add custom TypeScript rules
const config = nextCoreWebVitals.map((cfg, index) => {
  // The TypeScript plugin is in config index 1
  if (index === 1 && cfg.plugins?.['@typescript-eslint']) {
    return {
      ...cfg,
      rules: {
        ...cfg.rules,
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
    };
  }
  return cfg;
});

export default [
  ...config,
  {
    plugins: {
      'testing-library': testingLibrary,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
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

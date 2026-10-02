import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

// ----------------------------------------------------------------------
// Minimal ESLint flat config focused on ONE job: surface references to
// variables / JSX components that are used but never imported or defined,
// and imports whose path does not resolve.
//
// It deliberately does NOT turn on the full recommended rule sets so the
// output stays limited to "missing import / undefined reference" problems.
// ----------------------------------------------------------------------

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/**',
      'eslint.config.js',
      '*.config.js',
      '*.config.mjs',
      'generate-rtk.mjs',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        // Matches the `src/*` alias declared in jsconfig.json / vite.config.js
        alias: {
          map: [['src', './src']],
          extensions: ['.js', '.jsx', '.json', '.mjs'],
        },
        node: {
          extensions: ['.js', '.jsx', '.json', '.mjs'],
        },
      },
    },
    rules: {
      // --- undefined variables -------------------------------------------
      'no-undef': 'error',

      // --- undefined JSX components -------------------------------------
      'react/jsx-no-undef': 'error',
      // keep these on so React / JSX-only components are not treated as unused
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // --- imports that do not resolve --------------------------------
      'import/no-unresolved': ['error', { ignore: ['\\.(svg|png|jpe?g|gif|css|scss|md)$'] }],
      'import/named': 'error',

      // Everything else is intentionally left off. Flip `no-unused-vars`
      // to 'warn' if you also want the reverse (imported but never used).
      'no-unused-vars': 'off',

      // Registered only so the many inline `// eslint-disable ... react-hooks/*`
      // directives already in the codebase don't error as "rule not found".
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

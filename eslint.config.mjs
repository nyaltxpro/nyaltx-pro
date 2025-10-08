// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import { FlatCompat } from '@eslint/eslintrc';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
//   {
//     rules: {
//       // Prettier will handle formatting, so disable conflicting ESLint rules
//       'prettier/prettier': 'error',
//       '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//       '@typescript-eslint/no-explicit-any': 'warn',
//       'react/no-unescaped-entities': 'off',
//       '@next/next/no-page-custom-font': 'off',
//     },
//     ignores: [
//       'node_modules/**',
//       '.next/**',
//       'out/**',
//       'build/**',
//       'dist/**',
//       'next-env.d.ts',
//       '*.config.js',
//       '*.config.mjs',
//       '*.config.ts',
//       '.prettierrc',
//       '.prettierignore',
//     ],
//   },
// ];

// export default eslintConfig;

// @ts-check
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      '*.config.*',
      'prisma/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]

import lightwing from '@lightwing/eslint-config'

export default lightwing(
  {
    ignores: [
      'dist',
      'node_modules',
      '*.svelte',
      '*.snap',
      '*.d.ts',
      'coverage',
      'js_test',
      'local-data',
    ],
  },
  {
    'env': {
      'browser': true,
      'es6': true,
      'node': true
    },
    'extends': [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/electron',
      'plugin:import/typescript',
      './.eslintrc-auto-import.json'
    ],
    'parser': '@typescript-eslint/parser'
  }
)

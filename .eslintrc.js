module.exports = {
  root: true,
  env: {
    browser: true,
    amd: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/restrict-template-expressions': [0],
    '@typescript-eslint/semi': [0],
    '@typescript-eslint/space-before-function-paren': [0],
    '@typescript-eslint/strict-boolean-expressions': [0],
    '@typescript-eslint/quotes': [1],
    'comma-dangle': [1, 'always-multiline'],
    'padded-blocks': [0]
  },
  extends: 'standard-with-typescript',
}

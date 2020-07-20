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
    '@typescript-eslint/explicit-function-return-type': [0],
    'comma-dangle': [1, 'always-multiline'],
    'key-spacing': [0, { 'align': 'colon', 'mode': 'minimum' }],
    'no-multi-spaces': [1, {
      exceptions: {
        'AssignmentExpression': true,
        'CallExpression': true,
        'ConditionalExpression': true,
        'ImportDeclaration': true,
        'Property': true,
        'VariableDeclarator': true,
      }
    }],
    'padded-blocks': [0],
    'space-in-parens': [0],
  },
  extends: 'standard-with-typescript',
}

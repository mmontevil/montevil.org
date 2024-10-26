module.exports = {
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
  },
  rules: { 'prettier/prettier': 'error' },
  settings: {},
};

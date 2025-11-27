// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat')

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'android/*',
      'ios/*',
      '*.config.js',
      '*.config.ts',
      'metro.config.js',
      'scripts/*.js',
    ],
  },
]

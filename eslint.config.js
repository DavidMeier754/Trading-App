// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'web-build/*', '.expo/*', 'node_modules/*', '.claude/*', '.agents/*'],
  },
  {
    // These three rules are written for the React Compiler, which this app does
    // not use. They misread Reanimated's shared values and gesture callbacks as
    // refs read during render. Warnings for now, so they stay visible without
    // blocking CI; the clean-up belongs to a later stage.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]);

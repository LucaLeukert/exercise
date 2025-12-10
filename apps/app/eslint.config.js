/* eslint-env node */
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const reactCompiler = require('eslint-plugin-react-compiler')

module.exports = defineConfig([
    expoConfig,
    reactCompiler.configs.recommended,
    {
        ignores: ['dist/*', '**/.expo/*', '**/.expo-shared/*', '**/node_modules/*']
    },
    {
        rules: {
            'react/display-name': 'off',
            // Workspace aliases (e.g. @acme/validators) resolve via pnpm links/TS, so disable import/no-unresolved here.
            'import/no-unresolved': 'off'
        }
    }
])

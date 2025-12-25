const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
    {
        ignores: ['dist/*', '**/node_modules/*']
    },
    {
        rules: {
            'import/no-unresolved': 'off'
        }
    }
])

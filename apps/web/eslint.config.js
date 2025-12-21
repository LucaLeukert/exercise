const { defineConfig } = require('eslint/config')
const nextPlugin = require('@next/eslint-plugin-next')
const tseslint = require('typescript-eslint')

module.exports = defineConfig([
    {
        ignores: [
            'dist/*',
            '.next/*',
            '**/node_modules/*',
            '**/.next/**',
            '**/build/**',
            '**/*.config.*'
        ]
    },
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.ts', '**/*.tsx']
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.ts', '**/*.tsx']
    })),
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@next/next': nextPlugin
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname
            }
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules
        }
    }
])

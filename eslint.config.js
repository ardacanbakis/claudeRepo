import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist/', '_site/', 'node_modules/'] },
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        extends: [...tseslint.configs.strictTypeChecked],
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        },
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            // node:test's describe/it return promises that the runner tracks itself.
            '@typescript-eslint/no-floating-promises': [
                'error',
                {
                    allowForKnownSafeCalls: [
                        { from: 'package', package: 'node:test', name: ['describe', 'it', 'test', 'beforeEach'] },
                    ],
                },
            ],
        },
    },
    {
        files: ['scripts/**/*.mjs', 'eslint.config.js'],
        languageOptions: {
            globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
        },
    },
);

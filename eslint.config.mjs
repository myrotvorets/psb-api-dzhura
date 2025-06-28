import MyrotvoretsConfig from '@myrotvorets/eslint-config-myrotvorets-ts';
import MochaPlugin from 'eslint-plugin-mocha';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['coverage/**', 'dist/**', '**/*.cjs', '**/*.mjs', '**/*.js'],
    },
    ...MyrotvoretsConfig,
    MochaPlugin.configs.recommended,
];

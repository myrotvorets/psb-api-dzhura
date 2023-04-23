import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.mjs$': '$1.mts',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.m?[jt]s$': [
            'ts-jest',
            {
                isolatedModules: true,
                useESM: true,
            },
        ],
    },
    collectCoverage: process.env.COLLECT_COVERAGE !== '0',
    collectCoverageFrom: ['src/**/*.mts'],
    clearMocks: true,
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    testResultsProcessor: 'jest-sonar-reporter',
    reporters: ['default', process.env.GITHUB_ACTIONS === 'true' ? 'jest-github-actions-reporter' : null].filter(
        Boolean,
    ),
    testLocationInResults: true,
};

export default config;

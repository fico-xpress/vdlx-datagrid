module.exports = {
    setupFilesAfterEnv: [
        './test/jest/mocks/index.js'
    ],
    coverageReporters: process.env.CI ? ['text'] : ['text', 'lcov'],
};

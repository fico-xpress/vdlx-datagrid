module.exports = {
    setupFilesAfterEnv: [
        "./test/jest/mocks/insight-globals.js"
    ],
    coverageReporters: process.env.CI ? ['text'] : ['text', 'lcov'],
};

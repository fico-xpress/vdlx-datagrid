module.exports = {
    setupFilesAfterEnv: [
        "./test/jest/mocks/insight-globals.js",
        "./test/jest/mocks/console-globals.js"
    ],
    coverageReporters: process.env.CI ? ['text'] : ['text', 'lcov'],
};

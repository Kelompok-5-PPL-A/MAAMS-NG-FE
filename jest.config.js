module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    coverageReporters: ['html', 'text', 'lcov', 'cobertura'],
    transform: {
      '^.+\\.(ts|tsx)$': 'babel-jest'
    },
    setupFiles: ['dotenv/config']
}
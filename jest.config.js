module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ['html', 'text', 'lcov', 'cobertura'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['./node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts']
}
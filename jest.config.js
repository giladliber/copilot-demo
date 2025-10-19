module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'snake_game.html',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
};

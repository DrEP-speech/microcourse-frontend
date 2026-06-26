/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/",
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["<rootDir>/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)"],
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", { presets: ["next/babel"] }],
  },
};
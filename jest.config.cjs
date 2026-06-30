/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["<rootDir>/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)"],
  modulePathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/_ARCHIVED_20260624/",
    "<rootDir>/speech-assess-api/",
    "<rootDir>/coverage/",
    "<rootDir>/playwright-report/",
    "<rootDir>/test-results/",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", { presets: ["next/babel"] }],
  },
};

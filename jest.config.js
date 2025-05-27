export default {
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/__tests__/**/*.test.ts",
    "**/*.spec.ts",
  ],
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  testEnvironment: "node",
  rootDir: "./",
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.spec.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
};

export default config;

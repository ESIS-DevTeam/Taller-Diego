export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.stryker-tmp/", "/reports/"]
};

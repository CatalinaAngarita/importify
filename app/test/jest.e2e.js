module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "..",
  testMatch: ["<rootDir>/test/*.e2e-spec.ts"],
  testTimeout: 120000,
  maxWorkers: 1,
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json", diagnostics: false }],
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\](?!(@nestjs|jose|@panva|uuid)([/\\\\]))"],
};

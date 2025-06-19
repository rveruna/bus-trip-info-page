// jest.config.mjs
import { readFileSync } from "fs";
import { pathsToModuleNameMapper } from "ts-jest";
import { parse } from "jsonc-parser";

const tsconfig = parse(readFileSync("./tsconfig.json", "utf8"));

export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/config/setupGlobals.ts"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions?.paths || {}, {
      prefix: "<rootDir>/",
    }),
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
};

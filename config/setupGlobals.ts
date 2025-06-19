// config/setupGlobals.ts
import { jest } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
globalThis.jest = jest;

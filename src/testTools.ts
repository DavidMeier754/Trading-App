/**
 * docs/UI.md §11.5: the testing tools (Skip ahead, Refill hearts, the
 * all-screens test bench) exist only in test builds. A test build sets
 * `EXPO_PUBLIC_TEST_TOOLS=1`; Expo inlines the value at build time, so a
 * release build carries `false` here and the tools are gone from it.
 */
export const TEST_TOOLS = process.env.EXPO_PUBLIC_TEST_TOOLS === '1';

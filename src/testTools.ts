/**
 * docs/UI.md §11.5: the testing tools (Skip ahead, Refill hearts, the
 * all-screens test bench, the design pages, the Animations page) exist only in
 * test builds. A test build is a development run -- `npx expo start`, which is
 * what Expo Go opens, so the tools are there without any setting -- or an
 * export with `EXPO_PUBLIC_TEST_TOOLS=1` (the web preview, the render test).
 * Expo inlines both at build time, so a release build carries `false` here and
 * the tools are gone from it.
 */
export const TEST_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_TEST_TOOLS === '1';

/** The pages of the design prototype (src/prototype) a testing tool opens directly. */
export type PrototypePage = 'suggestions' | 'streak' | 'lost' | 'complete';

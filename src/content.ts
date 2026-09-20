// The one sub-level this player plays, plus the market profile used for §9 tokens.
// Both are the repo's own YAML, parsed at build time by metro/yaml-transformer.js.
// Nothing under content/ is copied or rewritten.
import levelYaml from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
import profilesYaml from '../content/market_profiles.yaml';

import type { Level, MarketProfile } from './types';

export const level = levelYaml as unknown as Level;

const profiles = profilesYaml as unknown as Record<string, MarketProfile>;

/** docs/UI.md §11.5 makes this a Settings choice; this player has no settings, so US. */
export const ACTIVE_PROFILE = 'US';
export const market: MarketProfile = profiles[ACTIVE_PROFILE];

import type { ImageSourcePropType } from 'react-native';

/** docs/UI.md §6.9 — the mascot and the recurring characters. */
export type Character =
  | 'foxy'
  | 'bull'
  | 'bear'
  | 'retail-trader'
  | 'market-maker'
  | 'institution';

/** docs/UI.md §6.9 — the poses the mascot needs. */
export type Pose = 'idle' | 'nod' | 'hm' | 'cheer' | 'point' | 'sleep';

/**
 * Real artwork goes here, and nowhere else.
 *
 * Drop the files into `assets/mascots/` and point at them, e.g.
 *
 *   'foxy:idle': require('../../assets/mascots/foxy-idle.png'),
 *   'foxy:nod':  require('../../assets/mascots/foxy-nod.png'),
 *
 * Any key left out falls back to the built-in placeholder drawing, so the app
 * runs with a partial set and characters can be replaced one at a time.
 * Metro needs a literal path in `require`, which is why this is a hand-written
 * map rather than a loop over a folder.
 */
export const ART: Partial<Record<`${Character}:${Pose}`, ImageSourcePropType>> = {};

export function artFor(character: Character, pose: Pose): ImageSourcePropType | undefined {
  return ART[`${character}:${pose}`] ?? ART[`${character}:idle`];
}

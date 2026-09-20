# Mascot artwork

Drop the real files here, then point at them in `src/mascots/registry.ts`:

```ts
export const ART: Partial<Record<`${Character}:${Pose}`, ImageSourcePropType>> = {
  'foxy:idle':  require('../../assets/mascots/foxy-idle.png'),
  'foxy:nod':   require('../../assets/mascots/foxy-nod.png'),
  'foxy:hm':    require('../../assets/mascots/foxy-hm.png'),
  'foxy:cheer': require('../../assets/mascots/foxy-cheer.png'),
  'foxy:point': require('../../assets/mascots/foxy-point.png'),
  'bull:idle':  require('../../assets/mascots/bull-idle.png'),
  // ...
};
```

Characters: `foxy`, `bull`, `bear`, `retail-trader`, `market-maker`, `institution`
(docs/UI.md §6.9).

Poses: `idle`, `nod` (correct), `hm` (wrong), `cheer` (perfect / badge),
`point` (walkthrough spotlight), `sleep` (streak reminder).

Any key left out falls back to the built-in placeholder drawing, so a partial set
works and characters can be replaced one at a time. `foxy:idle` also backs any
missing pose of a character that has one.

Sizes used in the app: 34 pt in the reveal slot, 40 pt on a walkthrough,
88-112 pt on intro, story, badge, tier-up and lesson-complete. Square, transparent
background, and legible at 34 pt — that last one is the real constraint.

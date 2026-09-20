# Mascot artwork

Six characters (docs/UI.md §6.9), each shipped three ways:

- `<name>.svg` — the flattened vector, for design tools
- `<name>.png` — 600 x 720, transparent background, 3x
- `src/mascots/art.ts` — the same art split into `back` / `body` / `head` layers,
  which is what the app renders

Foxy is drawn from the reference: orange `#FA742D`, cream `#FDF5EA`, hoodie
`#333333`, candlestick chest print in the app's own up/down greens and reds. The
other five follow his proportions and flat, outline-free style, each with a
signature hoodie colour and motif:

| Character | Hoodie | Motif |
|---|---|---|
| `foxy` | black | three candles |
| `bull` | green | up arrow, wide horns |
| `bear` | red | down arrow, round ears |
| `retail-trader` | blue | phone with a chart, cap |
| `market-maker` | purple | two-faced, green eye and red eye, headset |
| `institution` | slate | columns |

## Editing

The art is generated. Edit `tools/gen_mascots.py`, then:

```bash
python3 tools/gen_mascots.py /tmp/mascots          # svg + layers.json
node tools/raster_mascots.mjs /tmp/mascots assets/mascots 3   # png
```

and re-emit `src/mascots/art.ts` (the `emit_ts` function at the bottom of the
generator).

## Replacing with commissioned art

Drop files here and point at them in `src/mascots/registry.ts`:

```ts
export const ART: Partial<Record<`${Character}:${Pose}`, ImageSourcePropType>> = {
  'foxy:idle':  require('../../assets/mascots/foxy-idle.png'),
  'foxy:nod':   require('../../assets/mascots/foxy-nod.png'),
};
```

A key that is present wins over the generated vector. Note the trade-off: a flat
image can only be slid and scaled as one piece, so it loses the per-layer tail
sway, breathing and head nod. Supply layered art (one file per part) if you want
to keep those.

Poses: `idle`, `nod` (correct), `hm` (wrong), `cheer` (perfect / badge),
`point` (walkthrough spotlight), `sleep` (streak reminder).

Sizes in use: 34 pt in the reveal slot, 40 pt on a walkthrough, 88-112 pt on
intro, story, badge, tier-up and lesson-complete. Legibility at 34 pt is the real
constraint.

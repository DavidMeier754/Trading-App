import fs from 'fs';
import path from 'path';

import {
  chartExplain,
  chipTerm,
  knowsFor,
  levelTerm,
  PILL_LINE,
  scannerExplain,
} from '../components/explain';
import { localClock, marketMinutes, nowOnRibbon, spanOf } from '../components/data/sessionClock';
import { ICON_NAMES, isIconName } from '../home/icons';
import { ALIASES, SYMBOLS } from '../home/symbols';
import { LESSONS } from '../content';
import { knowsTerm, TERMS } from '../skills';
import * as opener from '../home/screenOpener';

/** Stage LOOK-COMPONENTS, session 2 (docs/plan/06-phase-1-app-look.md). */

describe('icons: the mapping table (home/symbols.tsx)', () => {
  const root = path.join(__dirname, '..', '..');
  const yaml = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) return yaml(p);
      return d.name.endsWith('.yaml') ? [p] : [];
    });
  const names = new Set<string>();
  for (const file of [...yaml(path.join(root, 'content')), ...yaml(path.join(root, 'demo'))]) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\bicon: *["']?([a-z0-9-]+)/g)) {
      names.add(m[1]);
    }
  }

  it('draws every icon name the content uses', () => {
    expect(names.size).toBeGreaterThan(60);
    expect([...names].filter((n) => !isIconName(n))).toEqual([]);
  });

  it('points every alias at an icon drawn by hand', () => {
    for (const to of Object.values(ALIASES)) expect(ICON_NAMES as readonly string[]).toContain(to);
  });

  it('gives no name two meanings', () => {
    const drawn = new Set<string>(ICON_NAMES);
    for (const n of [...Object.keys(ALIASES), ...Object.keys(SYMBOLS)]) {
      expect(drawn.has(n)).toBe(false);
    }
    for (const n of Object.keys(ALIASES)) expect(n in SYMBOLS).toBe(false);
  });
});

describe('level icons on the map', () => {
  it('every level of lessons on every chapter names one', () => {
    const levels = new Map<string, boolean>();
    for (const e of LESSONS) {
      const lvl = e.level;
      if (e.testBench || !['new-theory', 'repetition'].includes(lvl.category)) continue;
      if (lvl.screens[lvl.screens.length - 1]?.type === 'path-choice') continue;
      const key = `${lvl.path}-${lvl.chapter}-${lvl.id.split('-')[0]}`;
      levels.set(key, (levels.get(key) ?? false) || !!lvl.icon);
    }
    expect(levels.size).toBeGreaterThan(80);
    expect([...levels].filter(([, has]) => !has).map(([k]) => k)).toEqual([]);
  });
});

describe('the session ribbon (docs/ui/09-order-tools-and-other-visuals.md §6.5)', () => {
  it('reads the profile spans, notes and all', () => {
    expect(spanOf('04:00–09:30')).toEqual({ from: 240, to: 570, note: '' });
    expect(spanOf('17:30–22:00 (limited venues)')).toEqual({
      from: 1050,
      to: 1320,
      note: '(limited venues)',
    });
    expect(spanOf('not a span')).toBeNull();
  });

  it("finds the market's clock in its own zone", () => {
    // 14:00 UTC in July is 10:00 in New York (EDT) and 16:00 in Berlin (CEST).
    const at = new Date(Date.UTC(2026, 6, 15, 14, 0));
    expect(marketMinutes(at, 'ET')).toBe(600);
    expect(marketMinutes(at, 'CET')).toBe(960);
    expect(marketMinutes(at, 'Mars')).toBeNull();
  });

  it('places now on the ribbon, and at an end when closed', () => {
    expect(nowOnRibbon(570, 240, 1200)).toEqual({ at: (570 - 240) / 960, closed: false });
    expect(nowOnRibbon(100, 240, 1200)).toEqual({ at: 0, closed: true });
    expect(nowOnRibbon(1300, 240, 1200)).toEqual({ at: 1, closed: true });
  });

  it("writes the learner's clock in 24 hours", () => {
    expect(localClock(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
  });
});

describe('the "?" key (docs/ui/08-quotes-and-charts.md §6.4a)', () => {
  const all = knowsFor(null, {}, true);
  const none = knowsFor(null, {}, false);

  it('names a level by its label, else by its side of the price', () => {
    expect(levelTerm('VWAP', 10, 11)).toBe('VWAP');
    expect(levelTerm('Pre-market high', 12, 11)).toBe('Pre-market');
    expect(levelTerm('Floor', 10, 11)).toBe('Support');
    expect(levelTerm('Ceiling', 12, 11)).toBe('Resistance');
  });

  it('reads what a state chip stands for', () => {
    expect(chipTerm('Size: 400 shares')).toBe('Position size');
    expect(chipTerm('Day: −1.5R')).toBe('R');
    expect(chipTerm('Limit: −3R')).toBe('Daily loss limit');
  });

  it('labels only what is taught, in reading order, with the skills’ own lines', () => {
    const spec = {
      chips: ['Size: 400 shares'],
      pill: 'Next 5 candles',
      vwap: true,
      levels: [{ price: 12, label: 'Ceiling' }],
      last: 11,
      volume: true,
      plan: true,
      ruler: true,
    };
    const items = chartExplain(spec, all);
    expect(items.map((i) => i.key)).toEqual([
      'chip:0',
      'pill',
      'vwap',
      'level:0',
      'volume',
      'stop',
      'target',
      'ruler',
    ]);
    expect(items.find((i) => i.key === 'vwap')?.line).toBe(TERMS.get('vwap')?.info);
    // Nothing taught yet: the pill alone, which is the app's own.
    expect(chartExplain(spec, none)).toEqual([
      { key: 'pill', name: 'Next 5 candles', line: PILL_LINE },
    ]);
  });

  it('does not label a VWAP level twice', () => {
    const items = chartExplain(
      { vwap: true, levels: [{ price: 10, label: 'VWAP' }], last: 10.5 },
      all,
    );
    expect(items.map((i) => i.key)).toEqual(['vwap']);
  });

  it('follows the R ruler’s rule: taught before this lesson, or a lesson played', () => {
    const r = TERMS.get('r');
    expect(r).toBeDefined();
    expect(knowsTerm('R', r!.lessonId, {})).toBeNull();
    expect(knowsTerm('R', null, { [r!.lessonId]: { perfect: true } })?.name).toBe('R');
    const later = LESSONS.find((e) => e.level.chapter === 7 && e.level.path === 'scalping');
    expect(knowsTerm('R', later!.id, {})?.name).toBe('R');
  });

  it('labels a scanner’s columns by their terms', () => {
    expect(scannerExplain(['ticker', 'rvol', 'float'], all).map((i) => i.name)).toEqual([
      'Ticker',
      'Relative volume',
      'Float',
    ]);
  });
});

describe('Settings → Testing → Open a screen (home/screenOpener.ts)', () => {
  it('keeps the part after the #, without the preview address or ?test=1', () => {
    expect(opener.cleanLink('#level-09-2/3')).toBe('level-09-2/3');
    expect(opener.cleanLink('  level-09-2/3 ')).toBe('level-09-2/3');
    expect(
      opener.cleanLink(
        'https://look-components-2-nutrade.david-meier.workers.dev/#all-screens/34?test=1',
      ),
    ).toBe('all-screens/34');
    expect(opener.cleanLink('#scalping-ch4-level-02-1/5?look=neoMono&test=1')).toBe(
      'scalping-ch4-level-02-1/5?look=neoMono',
    );
  });

  it('hands the link to the app, and keeps the ones that opened, newest first', () => {
    const seen: string[] = [];
    const stop = opener.setScreenOpener((link) => {
      seen.push(link);
      return link !== 'nothing-here';
    });
    expect(opener.openScreen('#level-01-1/6')).toBe(true);
    expect(opener.openScreen('#nothing-here')).toBe(false);
    expect(opener.openScreen('home/settings')).toBe(true);
    expect(seen).toEqual(['level-01-1/6', 'nothing-here', 'home/settings']);
    expect(opener.recentLinks()).toEqual(['home/settings', 'level-01-1/6']);
    opener.openScreen('level-01-1/6');
    expect(opener.recentLinks()).toEqual(['level-01-1/6', 'home/settings']);
    stop();
    expect(opener.openScreen('level-01-1/6')).toBe(false);
    opener.clearRecent();
    expect(opener.recentLinks()).toEqual([]);
  });
});

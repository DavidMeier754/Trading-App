import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { emitMood } from '../lesson/look';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { CALM } from './Calm';
import {
  DIRECTION_ORDER,
  DIRECTIONS,
  isDirection,
  isMixLook,
  isScreen,
  MIX_LOOK_ORDER,
  MIX_LOOKS,
  mixDirection,
  SCREENS,
  type DirectionId,
  type LayoutId,
  type MixLookId,
  type ScreenId,
  type ThemeId,
} from './directions';
import { ProtoProvider, type Proto } from './kit';
import { PLAYFUL } from './Playful';
import { PRECISE } from './Precise';
import { MixGround } from './skin';
import TypeSheet from './TypeSheet';

/**
 * Stage LOOK-BRIEF: the design directions, one at a time, full size, behind a
 * picker (skill `prototype`, PICKER.md). Reached by
 * `#prototype/<direction>/<screen>?theme=dark&layout=today` in a test build,
 * or from Settings → Testing → Design directions. The mix takes
 * `&design=neoMono` or `&design=classicContrast` for its other two looks (not
 * `look=`, which the app reads as the lesson design to switch to). Nothing
 * outside src/prototype imports from here except the two ways in, and it is
 * deleted once the mix has been built into the app (stage LOOK-SYSTEM).
 */

export type ProtoLink = {
  dir: DirectionId;
  screen: ScreenId;
  theme: ThemeId;
  layout: LayoutId;
  /** The mix's look: one of the three designs that ship. */
  look: MixLookId;
};

/** What Settings → Testing → Design directions opens: David's mix, in Neo, dark. */
export const DEFAULT_LINK: ProtoLink = {
  dir: 'mix',
  screen: 'theory',
  theme: 'dark',
  layout: 'thumb',
  look: 'neo',
};

/** `prototype/playful/chart` + `theme=dark` → a link, or null for anything else. */
export function parsePrototypeLink(path: string, query: string): ProtoLink | null {
  const [head, dir, screen] = path.split('/');
  if (head !== 'prototype') return null;
  const q = new URLSearchParams(query);
  const look = q.get('design');
  return {
    dir: isDirection(dir) ? dir : DEFAULT_LINK.dir,
    screen: isScreen(screen) ? screen : DEFAULT_LINK.screen,
    theme: q.get('theme') === 'dark' ? 'dark' : 'light',
    layout: q.get('layout') === 'today' ? 'today' : 'thumb',
    look: isMixLook(look) ? look : 'neo',
  };
}

/**
 * Every route the render test opens: the mix in each look × screen × theme,
 * each of the three directions × screen × theme, and their layout variant.
 */
export function prototypeRoutes(): string[] {
  const out: string[] = [];
  for (const look of MIX_LOOK_ORDER)
    for (const s of SCREENS)
      for (const theme of ['light', 'dark'] as const)
        out.push(`prototype/mix/${s.id}?theme=${theme}${look === 'neo' ? '' : `&design=${look}`}`);
  const three = DIRECTION_ORDER.filter((d) => d !== 'mix');
  for (const dir of three)
    for (const s of SCREENS)
      for (const theme of ['light', 'dark'] as const)
        out.push(`prototype/${dir}/${s.id}?theme=${theme}`);
  for (const dir of three)
    for (const s of ['choice', 'match', 'chart']) out.push(`prototype/${dir}/${s}?layout=today`);
  return out;
}

/** The mix is Calm's screens in a skin (Calm.tsx). */
const SETS = { mix: CALM, calm: CALM, playful: PLAYFUL, precise: PRECISE };
/** The design button's short names. */
const LOOK_SHORT: Record<MixLookId, string> = {
  neo: 'Neo',
  neoMono: 'Mono',
  classicContrast: 'Contrast',
};

export default function Prototype({
  initial,
  width,
  height,
  onExit,
}: {
  initial: ProtoLink;
  width: number;
  height: number;
  onExit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const [link, setLink] = useState(initial);
  const [mount, setMount] = useState(0);
  const [open, setOpen] = useState(true);

  // The URL follows the picker, so a reload or a shared link opens the same
  // variant (PICKER.md: "selection persists across reload").
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    q.delete('theme');
    q.delete('layout');
    q.delete('design');
    if (link.theme === 'dark') q.set('theme', 'dark');
    if (link.layout === 'today' && link.dir !== 'mix') q.set('layout', 'today');
    if (link.dir === 'mix' && link.look !== 'neo') q.set('design', link.look);
    const qs = q.toString();
    const hash = `#prototype/${link.dir}/${link.screen}${qs ? `?${qs}` : ''}`;
    if (window.location.hash !== hash)
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search + hash,
      );
  }, [link]);

  const set = useCallback((patch: Partial<ProtoLink>) => {
    setLink((l) => ({ ...l, ...patch }));
    setMount((m) => m + 1);
  }, []);
  const step = useCallback(
    (by: number) =>
      setLink((l) => {
        const i = SCREENS.findIndex((s) => s.id === l.screen);
        setMount((m) => m + 1);
        return { ...l, screen: SCREENS[(i + by + SCREENS.length) % SCREENS.length].id };
      }),
    [],
  );

  // Keys on the web, as PICKER.md: 1–4 and ←/→ switch direction, R replays.
  // Here ↑/↓ step through the screens and D flips light and dark.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      const i = DIRECTION_ORDER.indexOf(link.dir);
      const all = DIRECTION_ORDER.length;
      if (n >= 1 && n <= all) set({ dir: DIRECTION_ORDER[n - 1] });
      else if (e.key === 'ArrowRight') set({ dir: DIRECTION_ORDER[(i + 1) % all] });
      else if (e.key === 'ArrowLeft') set({ dir: DIRECTION_ORDER[(i + all - 1) % all] });
      else if (e.key === 'ArrowDown') step(1);
      else if (e.key === 'ArrowUp') step(-1);
      else if (e.key === 'd' || e.key === 'D')
        set({ theme: link.theme === 'dark' ? 'light' : 'dark' });
      else if (e.key === 'r' || e.key === 'R') setMount((m) => m + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [link, set, step]);

  // A screen change settles the light at the bottom edge of the mix's
  // ground, as a new screen does in a lesson; so does leaving.
  useEffect(() => {
    emitMood('calm');
  }, [link, mount]);
  useEffect(() => () => emitMood('calm'), []);

  const isMix = link.dir === 'mix';
  const d = useMemo(
    () => (link.dir === 'mix' ? mixDirection(link.look) : DIRECTIONS[link.dir]),
    [link.dir, link.look],
  );
  const p = d.palettes[link.theme];
  const skin = isMix ? MIX_LOOKS[link.look].theme[link.theme].skin : undefined;
  // David chose the thumb zone; the mix has no other layout.
  const layout: LayoutId = isMix ? 'thumb' : link.layout;
  const chromeH = open ? 88 : 36;
  const stageH = height - insets.top - chromeH;
  const ctx: Proto = useMemo(
    () => ({
      d,
      p,
      theme: link.theme,
      layout,
      reduced,
      width,
      height: stageH,
      next: () => step(1),
      skin,
    }),
    [d, p, link.theme, layout, reduced, width, stageH, step, skin],
  );
  const Body = link.screen === 'type' ? TypeSheet : SETS[link.dir][link.screen];
  const screenName = SCREENS.find((s) => s.id === link.screen)!.name;
  const n = SCREENS.findIndex((s) => s.id === link.screen) + 1;

  return (
    <View style={{ flex: 1, backgroundColor: p.ground }} testID="prototype">
      <StatusBar style={link.theme === 'dark' ? 'light' : 'dark'} />
      <View
        style={{
          paddingTop: insets.top,
          height: insets.top + chromeH,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: p.ground,
        }}
      >
        {open ? (
          <>
            <Pill
              items={DIRECTION_ORDER.map((id) => DIRECTIONS[id].name)}
              active={DIRECTION_ORDER.indexOf(link.dir)}
              onPick={(i) => set({ dir: DIRECTION_ORDER[i] })}
              trailing={[{ label: '▴', a11y: 'Hide the picker', onPress: () => setOpen(false) }]}
            />
            <Pill
              items={[]}
              active={-1}
              onPick={() => {}}
              trailing={[
                { label: '‹', a11y: 'Previous screen', onPress: () => step(-1) },
                { label: `${n}/7 ${screenName}`, a11y: 'Screen', onPress: () => step(1) },
                { label: '›', a11y: 'Next screen', onPress: () => step(1) },
                {
                  label: link.theme === 'dark' ? 'Dark' : 'Light',
                  a11y: 'Light or dark',
                  onPress: () => set({ theme: link.theme === 'dark' ? 'light' : 'dark' }),
                },
                isMix
                  ? {
                      label: LOOK_SHORT[link.look],
                      a11y: 'Design: Neo, Neo Mono or Classic Contrast',
                      onPress: () =>
                        set({
                          look: MIX_LOOK_ORDER[
                            (MIX_LOOK_ORDER.indexOf(link.look) + 1) % MIX_LOOK_ORDER.length
                          ],
                        }),
                    }
                  : {
                      label: link.layout === 'thumb' ? 'Thumb' : 'Today',
                      a11y: 'Answers in the thumb zone or as today',
                      onPress: () => set({ layout: link.layout === 'thumb' ? 'today' : 'thumb' }),
                    },
                { label: '↻', a11y: 'Replay animation', onPress: () => setMount((m) => m + 1) },
                { label: '✕', a11y: 'Leave the prototypes', onPress: onExit },
              ]}
            />
          </>
        ) : (
          <Pill
            items={[]}
            active={-1}
            onPick={() => {}}
            trailing={[
              {
                label: `▾ ${d.name}${skin ? ` ${skin.name}` : ''} · ${screenName} · ${link.theme === 'dark' ? 'Dark' : 'Light'}`,
                a11y: 'Show the picker',
                onPress: () => setOpen(true),
              },
            ]}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        {skin ? <MixGround skin={skin} color={p.ground} width={width} height={stageH} /> : null}
        <ProtoProvider value={ctx}>
          {Body ? (
            <Body
              key={`${link.dir}/${link.look}/${link.screen}/${link.theme}/${layout}/${mount}`}
            />
          ) : null}
        </ProtoProvider>
      </View>
    </View>
  );
}

/**
 * The picker from PICKER.md, in React Native: a dark glass pill, its look not
 * part of any direction. The highlight slides between items (250 ms, strong
 * ease-out); the variant under it switches instantly.
 */
function Pill({
  items,
  active,
  onPick,
  trailing,
}: {
  items: string[];
  active: number;
  onPick: (i: number) => void;
  trailing: { label: string; a11y: string; onPress: () => void }[];
}) {
  const reduced = useReduceMotion();
  const [boxes, setBoxes] = useState<Record<number, { x: number; w: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const ready = useRef(false);
  useEffect(() => {
    const b = boxes[active];
    if (!b) return;
    const cfg = { duration: ready.current && !reduced ? 250 : 0 };
    x.set(withTiming(b.x, cfg));
    w.set(withTiming(b.w, cfg));
    ready.current = true;
  }, [active, boxes, reduced, x, w]);
  const hl = useAnimatedStyle(() => ({ width: w.get(), transform: [{ translateX: x.get() }] }));
  return (
    <View
      accessibilityRole="toolbar"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        borderRadius: 999,
        backgroundColor: 'rgba(10,10,10,0.82)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {items.length > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              left: 0,
              height: 28,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.12)',
            },
            hl,
          ]}
        />
      )}
      {items.map((label, i) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityState={{ selected: i === active }}
          onPress={() => onPick(i)}
          onLayout={(e) => {
            const { x: bx, width: bw } = e.nativeEvent.layout;
            setBoxes((prev) =>
              prev[i]?.x === bx && prev[i]?.w === bw ? prev : { ...prev, [i]: { x: bx, w: bw } },
            );
          }}
          style={{ height: 28, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center' }}
        >
          <Text style={{ color: i === active ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            {label}
          </Text>
        </Pressable>
      ))}
      {items.length > 0 && trailing.length > 0 && (
        <View
          style={{
            width: 1,
            height: 16,
            marginHorizontal: 4,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
      )}
      {trailing.map((t) => (
        <Pressable
          key={t.a11y}
          accessibilityRole="button"
          accessibilityLabel={t.a11y}
          onPress={t.onPress}
          hitSlop={6}
          style={{ height: 28, paddingHorizontal: 9, borderRadius: 999, justifyContent: 'center' }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

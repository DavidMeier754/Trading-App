// The measured half of the UI check (docs/ui/15-theming-and-accessibility.md §10, stage LOOK-SYSTEM): run
// in the page on a rendered screen, it reads every piece of text as the
// browser drew it and reports
//   - small:    text below 13 px (MIN_FONT, src/themeTokens.ts);
//   - contrast: text below 4.5 : 1 against what is behind it (3 : 1 for large
//               text: 24 px, or 18.5 px bold);
//   - target:   a button smaller than 48 x 48 (TAP_TARGET) as laid out;
//   - key:      a key's label (a view with testID "key") on two lines or cut
//               off: a key keeps its label on one line (docs/ui/15-theming-and-accessibility.md §10).
//   - overlap:  text or a button drawn over another piece of text or button
//               it is not part of: a START tag on a side stop, two level
//               labels on one line, a number run into the next column
//               (docs/ui/15-theming-and-accessibility.md §10; David, 2026-10-04: "the Start Box over the
//               level overlaps the optional side levels");
//   - offscreen: a button that runs past the screen's side (outside a row
//               that scrolls sideways).
//
// What is behind a text is found by walking up from it: each ancestor's
// background is laid over the ones above it until one is opaque. The ground
// under everything is the frame's own colour (src/App.tsx), which is the
// look's ground. Opacity on the way (a dimmed row, a fading panel) is laid
// onto the text's colour, so text that is drawn faint is measured faint. A
// chart label's halo -- the same words drawn underneath as a thick rim in the
// page's colour -- is not measured: it is there so the label reads.
// Text that is not drawn -- zero size, hidden, opacity near 0 -- is skipped,
// and so is text inside `aria-disabled` or `aria-hidden` parts: a key that
// cannot be pressed yet is exempt, as WCAG exempts inactive controls.
//
// `auditScreen` is passed to page.evaluate as it is, so it may use nothing
// from this module's scope.

export const MIN_FONT = 13;
export const TAP_TARGET = 48;

/**
 * Buttons that are narrower than 48 on purpose. A candle on a `chart-tap`
 * screen is a target as wide as its bar's slot and as tall as the chart: eight
 * of them cannot each be 48 wide on a phone, and a candle is what the question
 * asks the learner to point at.
 */
const NARROW = ['^Candle \\d+ of \\d+$'];

/**
 * Buttons that are words in a line of text. A `spot-mistake` statement is one
 * sentence whose parts are each a tap (docs/ui/04-question-types.md §4.1): a part is as
 * tall as its line (40 pt), and a part on a line of its own as wide as its
 * words. The Check step stands behind a mis-tap.
 */
const INLINE = ['^Part \\d+ of \\d+: '];

/** The options `auditScreen` takes. */
export const AUDIT = { minFont: MIN_FONT, tapTarget: TAP_TARGET, narrow: NARROW, inline: INLINE };

export function auditScreen({ minFont, tapTarget, narrow, inline = [], only = null }) {
  const parse = (value) => {
    const m = /rgba?\(([^)]+)\)/.exec(value || '');
    if (!m) return null;
    const p = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
  };
  const lum = (c) => {
    const ch = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const hidden = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      if (e.getAttribute?.('aria-hidden') === 'true') return true;
      if (e.getAttribute?.('aria-disabled') === 'true') return true;
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none') return true;
    }
    return false;
  };
  const opacityOf = (el) => {
    let o = 1;
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      o *= Number(getComputedStyle(e).opacity);
    }
    return o;
  };
  const backgroundOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const bg = parse(getComputedStyle(e).backgroundColor);
      if (bg && bg[3] > 0) {
        layers.push(bg);
        if (bg[3] >= 1) break;
      }
    }
    let color = [0, 0, 0, 1];
    for (let i = layers.length - 1; i >= 0; i--) color = over(layers[i], color);
    return color;
  };
  const label = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);

  const findings = [];
  const root = document.getElementById('root');
  if (!root) return findings;

  // `only`: the kinds to look for (the render test asks for the overlaps alone).
  const wants = (kind) => !only || only.includes(kind);

  // Text: every element with text of its own, HTML or SVG.
  for (const el of wants('small') || wants('contrast') ? root.querySelectorAll('*') : []) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    if (hidden(el)) continue;
    const opacity = opacityOf(el);
    if (opacity < 0.2) continue;
    const cs = getComputedStyle(el);
    // The style's size. A screen the fitter scales (lesson/fit.tsx, at most to
    // 85 %) draws it smaller; that shrink is the fitter's own rule.
    const size = parseFloat(cs.fontSize);
    if (size < minFont - 0.01) {
      findings.push({ kind: 'small', detail: `${size.toFixed(1)} px "${label(el)}"` });
    }
    const svg = el instanceof SVGElement;
    const ink = parse(svg ? cs.fill : cs.color);
    if (!ink) continue;
    // A chart label's halo (ChartPlan, HaloText): the same text drawn first
    // as a rim of the page's colour -- fill and a thick stroke alike -- for
    // its ink to sit on. It is a rim, not a word to read.
    const rim = parse(cs.stroke);
    if (svg && rim && parseFloat(cs.strokeWidth) >= 2 && rim.every((v, i) => v === ink[i])) {
      continue;
    }
    const bg = backgroundOf(svg ? el.ownerSVGElement || el : el);
    const text = over([ink[0], ink[1], ink[2], ink[3] * opacity], bg);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.5 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(text, bg);
    if (r < need - 0.005) {
      findings.push({ kind: 'contrast', detail: `${r.toFixed(2)} : 1 "${label(el)}"` });
    }
  }

  // Buttons: what a finger can press.
  for (const el of wants('target')
    ? root.querySelectorAll('[role="button"], [role="radio"], [role="switch"], button')
    : []) {
    if (hidden(el) || opacityOf(el) < 0.2) continue;
    // The laid-out size, before any transform: the fitter's scale (at most to
    // 85 %) shrinks a whole screen, and that is its own rule.
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    const w = el.offsetWidth ?? box.width;
    const h = el.offsetHeight ?? box.height;
    const name = el.getAttribute('aria-label') || '';
    if (h >= tapTarget && narrow.some((re) => new RegExp(re).test(name))) continue;
    if (inline.some((re) => new RegExp(re).test(name))) continue;
    if (w < tapTarget - 0.5 || h < tapTarget - 0.5) {
      findings.push({
        kind: 'target',
        detail: `${Math.round(w)} x ${Math.round(h)} "${label(el) || el.getAttribute('aria-label') || ''}"`,
      });
    }
  }
  // Keys: the label stays on one line, whole. On a phone a long label shrinks
  // to fit (adjustsFontSizeToFit), which a browser does not do, so here it
  // shows as cut off -- a label that long needs shorter words either way.
  for (const el of wants('key') ? root.querySelectorAll('[data-testid="key"]') : []) {
    if (hidden(el) || opacityOf(el) < 0.2) continue;
    for (const t of el.querySelectorAll('*')) {
      const own = [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own || !t.offsetHeight) continue;
      const cs = getComputedStyle(t);
      const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
      if (t.offsetHeight > line * 1.5) {
        findings.push({ kind: 'key', detail: `two lines "${label(t)}"` });
      } else if (t.scrollWidth > t.clientWidth + 1) {
        findings.push({ kind: 'key', detail: `cut off "${label(t)}"` });
      }
    }
  }

  // Overlaps. Text is measured as drawn, line by line; buttons as laid out.
  // A view that is clipped (a scroller, a card with overflow hidden) counts
  // only as far as it shows. A backdrop the size of the screen is not a
  // button anyone aims at; a chart label drawn twice on purpose -- its halo,
  // then its ink -- is one label.
  if (!wants('overlap') && !wants('offscreen')) return findings;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // `self`: a text that clips itself (numberOfLines, ending in "…") shows no
  // further than its own box, whatever lines it holds past it.
  const clipOf = (el, self = false) => {
    let r = { l: 0, t: 0, r: vw, b: vh };
    for (let e = self ? el : el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const b = e.getBoundingClientRect();
        r = {
          l: Math.max(r.l, b.left),
          t: Math.max(r.t, b.top),
          r: Math.min(r.r, b.right),
          b: Math.min(r.b, b.bottom),
        };
      }
    }
    return r;
  };
  const cut = (a, c) => ({
    l: Math.max(a.l, c.l),
    t: Math.max(a.t, c.t),
    r: Math.min(a.r, c.r),
    b: Math.min(a.b, c.b),
  });
  const area = (a) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t);
  const parts = [];
  for (const el of root.querySelectorAll('*')) {
    const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!texts.length || hidden(el) || opacityOf(el) < 0.2) continue;
    const clip = clipOf(el, true);
    for (const n of texts) {
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        const b = cut({ l: r.left, t: r.top, r: r.right, b: r.bottom }, clip);
        if (area(b) >= 4) parts.push({ el, b, name: `"${label(el)}"`, text: n.textContent.trim() });
      }
    }
  }
  const pressables = [
    ...root.querySelectorAll(
      '[role="button"], [role="radio"], [role="switch"], [role="tab"], button',
    ),
  ].filter(
    (el) => !hidden(el) && opacityOf(el) >= 0.2 && getComputedStyle(el).pointerEvents !== 'none',
  );
  for (const el of pressables) {
    const r = el.getBoundingClientRect();
    if (r.width * r.height > 0.5 * vw * vh) continue;
    const b = cut({ l: r.left, t: r.top, r: r.right, b: r.bottom }, clipOf(el));
    if (area(b) >= 4) {
      parts.push({ el, b, name: `button "${el.getAttribute('aria-label') || label(el)}"` });
    }
  }
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const A = parts[i];
      const B = parts[j];
      if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const x = cut(A.b, B.b);
      if (x.r - x.l <= 1.5 || x.b - x.t <= 1.5) continue;
      if (A.text && A.text === B.text && area(x) > 0.8 * Math.min(area(A.b), area(B.b))) continue;
      findings.push({ kind: 'overlap', detail: `${A.name} on ${B.name}` });
    }
  }
  for (const el of pressables) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || (r.left >= -1 && r.right <= vw + 1)) continue;
    let sideways = false;
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (/auto|scroll/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) sideways = true;
    }
    if (!sideways) {
      findings.push({
        kind: 'offscreen',
        detail: `${Math.round(Math.max(-r.left, r.right - vw))} pt past the side "${el.getAttribute('aria-label') || label(el)}"`,
      });
    }
  }
  return findings;
}

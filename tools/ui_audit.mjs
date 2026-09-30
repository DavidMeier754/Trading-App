// The measured half of the UI check (docs/UI.md §10, stage LOOK-SYSTEM): run
// in the page on a rendered screen, it reads every piece of text as the
// browser drew it and reports
//   - small:    text below 13 px (MIN_FONT, src/themeTokens.ts);
//   - contrast: text below 4.5 : 1 against what is behind it (3 : 1 for large
//               text: 24 px, or 18.5 px bold);
//   - target:   a button smaller than 48 x 48 (TAP_TARGET) as laid out.
//
// What is behind a text is found by walking up from it: each ancestor's
// background is laid over the ones above it until one is opaque. The ground
// under everything is the frame's own colour (src/App.tsx), which is the
// look's ground. Opacity on the way (a dimmed row, a fading panel) is laid
// onto the text's colour, so text that is drawn faint is measured faint.
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

/** The options `auditScreen` takes. */
export const AUDIT = { minFont: MIN_FONT, tapTarget: TAP_TARGET, narrow: NARROW };

export function auditScreen({ minFont, tapTarget, narrow }) {
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

  // Text: every element with text of its own, HTML or SVG.
  for (const el of root.querySelectorAll('*')) {
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
  for (const el of root.querySelectorAll(
    '[role="button"], [role="radio"], [role="switch"], button',
  )) {
    if (hidden(el) || opacityOf(el) < 0.2) continue;
    // The laid-out size, before any transform: the fitter's scale (at most to
    // 85 %) shrinks a whole screen, and that is its own rule.
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    const w = el.offsetWidth ?? box.width;
    const h = el.offsetHeight ?? box.height;
    const name = el.getAttribute('aria-label') || '';
    if (h >= tapTarget && narrow.some((re) => new RegExp(re).test(name))) continue;
    if (w < tapTarget - 0.5 || h < tapTarget - 0.5) {
      findings.push({
        kind: 'target',
        detail: `${Math.round(w)} x ${Math.round(h)} "${label(el) || el.getAttribute('aria-label') || ''}"`,
      });
    }
  }
  return findings;
}

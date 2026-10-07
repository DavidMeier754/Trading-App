/**
 * docs/ui/09-order-tools-and-other-visuals.md §6.5 [v4]: the session ribbon is drawn to scale in
 * hours, with "now" in the learner's own time zone. These are the sums behind
 * it, kept apart from the drawing so they can be tested.
 */

/** A market profile's zone token (content/market_profiles.yaml) as a zone the clock knows. */
const ZONES: Record<string, string> = {
  ET: 'America/New_York',
  CET: 'Europe/Berlin',
  GMT: 'Europe/London',
  UK: 'Europe/London',
  JST: 'Asia/Tokyo',
};

/** Minutes after midnight of "09:30". */
function minutesOf(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * "04:00–09:30" or "17:30–22:00 (limited venues)" as minutes after midnight,
 * and what follows the times. Null when the text holds no span.
 */
export function spanOf(text: string): { from: number; to: number; note: string } | null {
  const m = /^\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*(.*)$/.exec(text);
  if (!m) return null;
  const from = minutesOf(m[1]);
  const to = minutesOf(m[2]);
  if (from === null || to === null || to <= from) return null;
  return { from, to, note: m[3].trim() };
}

/** The time of day in a market's zone, in minutes after midnight; null if the zone is unknown. */
export function marketMinutes(now: Date, zone: string | undefined): number | null {
  const iana = zone ? ZONES[zone.trim()] : undefined;
  if (!iana) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: iana,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return (hour % 24) * 60 + minute;
  } catch {
    return null;
  }
}

/** "15:42", the learner's own clock. */
export function localClock(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Where "now" falls on a ribbon from `start` to `end` (minutes): 0 at its left
 * end, 1 at its right, and whether the market is shut then (before the first
 * session or after the last, the marker waits at the nearer end).
 */
export function nowOnRibbon(
  minutes: number,
  start: number,
  end: number,
): { at: number; closed: boolean } {
  if (minutes < start) {
    // Overnight: after midnight it waits for the morning, at the left end.
    return { at: 0, closed: true };
  }
  if (minutes >= end) return { at: 1, closed: true };
  return { at: (minutes - start) / (end - start), closed: false };
}

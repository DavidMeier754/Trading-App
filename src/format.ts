import { market } from './content';

const TOKEN = /\{\{\s*market\.([a-z_]+)\s*\}\}/g;

/**
 * docs/ui/14-glossary-and-copy.md §9: `{{market.*}}` tokens resolve from the active profile and a literal
 * `$` in content is replaced by the profile's currency symbol.
 */
export function copy(input: string): string {
  return input
    .replace(TOKEN, (_m, key: string) => String(market[key] ?? `{{market.${key}}}`))
    .split('$')
    .join(market.currency_symbol);
}

const THIN_SPACE = ' ';

export function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
}

/** Prices: two decimals, thin-space thousands, profile currency symbol. */
export function price(value: number): string {
  const sign = value < 0 ? '-' : '';
  const [int, frac] = Math.abs(value).toFixed(2).split('.');
  return `${sign}${market.currency_symbol}${groupThousands(int)}.${frac}`;
}

/** A signed price move, e.g. "+$0.30". */
export function signedPrice(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const [int, frac] = Math.abs(value).toFixed(2).split('.');
  return `${sign}${market.currency_symbol}${groupThousands(int)}.${frac}`;
}

/** A bare price with no currency symbol, for chart axes. */
export function axisPrice(value: number): string {
  return value.toFixed(2);
}

/** Percentages: one decimal. */
export function signedPercent(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

/**
 * Share counts. docs/ui/14-glossary-and-copy.md §9 fixes thin-space thousands for *prices* and is silent
 * on counts; the content writes them with commas ("1,200 shares"), and a strip that
 * reads "1 200" next to prose reading "1,200" looks like a bug. Commas it is.
 */
export function count(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Volume on the chart strip: 96000 -> "96K", 1_200_000 -> "1.2M". */
export function volume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return count(value);
}

import { tint } from '../lesson/look';

/**
 * docs/ui/03-screen-types.md §3 `walkthrough`: one field of a mock component is spotlighted and
 * the rest of it is dimmed, so the eye lands on the field without hunting for a
 * thin outline. `focus` is the spotlighted target id; the colour is the one the
 * walkthrough highlights it with.
 */
export function spotlight(
  id: string,
  focus: string | undefined,
  highlight: Record<string, string> | undefined,
) {
  if (!focus) return null;
  if (id !== focus) return { opacity: 0.32 };
  const color = highlight?.[id];
  // Colour only: a border that changed width would nudge the field's text.
  return color ? { backgroundColor: tint(color, 0.16), borderColor: color } : null;
}

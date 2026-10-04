/**
 * The sizes the map's parts are drawn at, in one place, so the layout
 * (mapLayout.ts) and the parts themselves (LevelNode, SideStop) agree.
 */

/** A level's ring on the map; the button inside it is 66. */
export const RING = 86;
/** How far the START tag's top sits above a level's ring (LevelNode, Bubble). */
export const TAG_TOP = 42;
/**
 * Half the widest tag, CONTINUE, with a little room: the map keeps this much
 * free over every level for it (mapLayout.tagBox).
 */
export const TAG_HALF_W = 62;
/** A side stop is a size smaller than a level (SideStop): 48 in a 64 ring. */
export const STOP_RING = 64;

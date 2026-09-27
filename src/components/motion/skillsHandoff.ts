// Scroll choreography shared by the skills section and the "What sets me
// apart" section, in viewport heights of scroll. When the skills section's
// bottom reaches the bottom of the screen it holds still: first its closing
// divider fills, then the brush paints over it, then the black section takes
// over and its phrase assembles.
export const HANDOFF = {
  /** Closing divider of the skills section fills. */
  lineFill: 0.3,
  /** Brush covers the screen. */
  brush: 1,
  /** Scattered phrase assembles. */
  scatter: 1,
  /** Label and copy fade in, then a short hold. */
  outro: 0.6,
};

/** Scroll distance from the hold start until the brush has covered the screen. */
export const HANDOFF_COVERED = HANDOFF.lineFill + HANDOFF.brush;

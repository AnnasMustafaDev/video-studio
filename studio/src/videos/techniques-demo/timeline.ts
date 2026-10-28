import { lintCopy } from "../../lib";

/** Scene lengths in frames at 30 fps. */
export const SCENES = {
  chain: 105,
  glide: 140,
  type: 150,
} as const;

/** Velocity-matched cut between chain and glide (exit 12 frames, entry 18). */
export const CUT_VELOCITY = 30;
/** Occluder cut between glide and type (cut at the midpoint, frame 12). */
export const CUT_OCCLUDER = 24;

export const TECHNIQUES_DURATION =
  SCENES.chain + SCENES.glide + SCENES.type - CUT_VELOCITY - CUT_OCCLUDER;

export const CHAIN_FRAGMENTS = ["Move once.", "Land softly.", "Cut."] as const;
export const TYPED_LINE = "Same frame, same pixels.";

/** Word budget for the whole piece. Copy lines are the only words on screen. */
export const COPY_CHECK = lintCopy({
  fragments: [...CHAIN_FRAGMENTS, TYPED_LINE],
  durationInFrames: TECHNIQUES_DURATION,
  fps: 30,
  visibleFrames: 60,
  // Chain from frame 6 to the cut at 87 (81 frames) plus the typed line from 221 to the end (120).
  coveredFrames: 81 + 120,
});

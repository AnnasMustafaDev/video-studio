import { Easing } from "remotion";
import type { SpringConfig } from "remotion";

/**
 * Design tokens for every video in this studio.
 * Change values here, never inline in a scene. See DESIGN_SYSTEM.md for the rules.
 */

/** One accent. Everything else is neutral. */
export const color = {
  bg: "#0D0E10",
  surface: "#16181C",
  surfaceRaised: "#1E2126",
  line: "rgba(242, 241, 236, 0.10)",
  lineStrong: "rgba(242, 241, 236, 0.22)",
  text: "#F2F1EC",
  textMuted: "#9A9CA1",
  textFaint: "#5E6168",
  accent: "#5B8CFF",
  /** Text that sits on the accent colour. */
  onAccent: "#0D0E10",
} as const;

export type ColorToken = keyof typeof color;

/**
 * Type scale in px. Designed against the short side of the frame (1080 px),
 * so the same scale works for 1920x1080, 1080x1920 and 1080x1080.
 * Minimums from the Remotion layout rules: headline >= 84, supporting text >= 44.
 */
export const type = {
  display: {
    fontSize: 132,
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    fontWeight: 600,
  },
  h1: {
    fontSize: 96,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    fontWeight: 600,
  },
  h2: {
    fontSize: 64,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    fontWeight: 600,
  },
  body: {
    fontSize: 44,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
    fontWeight: 400,
  },
  caption: {
    fontSize: 48,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    fontWeight: 500,
  },
  label: {
    fontSize: 26,
    lineHeight: 1.2,
    letterSpacing: "0.08em",
    fontWeight: 500,
  },
} as const;

export type TypeToken = keyof typeof type;

/** 8 px base grid. Use these for gaps and padding. */
export const space = {
  xs: 8,
  s: 16,
  m: 24,
  l: 40,
  xl: 64,
  xxl: 96,
} as const;

export const radius = { s: 8, m: 16, l: 28 } as const;

/**
 * Video-native type ramp (F-A5). Sizes are percent of the composition WIDTH (vw), so a
 * hero word can be as large as the frame allows instead of collapsing into a web page layout.
 * The px `type` scale above stays for reading text; use this ramp for hero moments.
 * Atoms (colours, families) are sacred, composition is free, numbers come from the script.
 *
 * At 1920 wide: wordmark 576 px, stat 346 px, display 269 px, claim 125 px, reading 61 px.
 */
export const frameRamp = {
  /** One giant keyword or wordmark, one per film. */
  wordmark: 30,
  /** Big numeral that is the whole point of a scene. */
  stat: 18,
  /** One or two words filling the frame. */
  display: 14,
  /** A claim line (6 to 9 vw in the source ramp; 6.5 so a five-word line fits the safe area). */
  claim: 6.5,
  /** Reading text on a hero frame. */
  reading: 3.2,
  /** Chrome labels (ticks, units, metadata). Exactly the floor. */
  label: 1.4,
} as const;

export type FrameStep = keyof typeof frameRamp;

/** Smallest allowed text, in vw (1.4 vw = 27 px at 1920). Chrome labels may sit at it; nothing may go below. */
export const TEXT_FLOOR_VW = 1.4;

/** Percent-of-width to px for a composition `width`. */
export const vw = (width: number, percent: number) => (width * percent) / 100;

/**
 * Style for a ramp step at a given composition width, text floor enforced.
 * Large steps are tighter and heavier; `label` is the mono chrome size.
 */
export const frameType = (width: number, step: FrameStep) => {
  const fontSize = Math.max(vw(width, frameRamp[step]), vw(width, TEXT_FLOOR_VW));
  const big = frameRamp[step] >= frameRamp.display;
  return {
    fontSize,
    lineHeight: big ? 0.95 : step === "claim" ? 1.05 : 1.25,
    letterSpacing: big ? "-0.045em" : step === "claim" ? "-0.03em" : "-0.01em",
    fontWeight: big ? 600 : step === "label" ? 500 : step === "claim" ? 600 : 400,
  } as const;
};

export type Format = "16:9" | "9:16" | "1:1";

export type Insets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Safe margins per format. Key text and logos stay inside these.
 * 9:16 reserves extra room at the top (status/profile UI) and bottom (captions, buttons).
 */
export const safeArea: Record<Format, Insets> = {
  "16:9": { top: 96, right: 128, bottom: 96, left: 128 },
  "9:16": { top: 220, right: 80, bottom: 380, left: 80 },
  "1:1": { top: 96, right: 96, bottom: 96, left: 96 },
};

export const getFormat = (width: number, height: number): Format => {
  const ratio = width / height;
  if (ratio > 1.2) return "16:9";
  if (ratio < 0.8) return "9:16";
  return "1:1";
};

/** Standard frame rate. Timing tokens below are in frames at this rate. */
export const FPS = 30;

/** Bezier curves for interpolate(). Never animate linearly unless it is a counter or a constant drift. */
export const ease = {
  /** Default for entrances: fast start, long soft landing. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** For exits: gentle start, quick finish. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** For moves between two resting states and wipes. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

/** Spring presets for spring(). `settle` has the only allowed overshoot (about 1 %). */
export const springs = {
  /** No overshoot. Default for text, masks, panels. */
  smooth: { damping: 200, stiffness: 100, mass: 1 },
  /** Quicker, no visible overshoot. Small UI elements, bars. */
  snappy: { damping: 28, stiffness: 220, mass: 0.7 },
  /** Tiny overshoot, then settle. One element per scene at most. */
  settle: { damping: 18, stiffness: 120, mass: 1 },
} satisfies Record<string, Partial<SpringConfig>>;

export type SpringToken = keyof typeof springs;

/** Timing defaults in frames at 30 fps. */
export const timing = {
  /** Length of a typical entrance. */
  enter: 20,
  /** Length of a typical exit (exits are faster than entrances). */
  exit: 12,
  /** Delay between words in a stagger. */
  wordStagger: 3,
  /** Delay between characters in a stagger. */
  charStagger: 1.5,
  /** Delay between lines or list items. */
  lineStagger: 5,
  /** Minimum time a finished state is held before anything else moves. */
  hold: 45,
  /** Scene transition length. */
  transitionFrames: 15,
  /** Number counters and chart growth. */
  count: 40,
} as const;

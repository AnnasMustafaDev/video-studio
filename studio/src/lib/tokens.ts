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

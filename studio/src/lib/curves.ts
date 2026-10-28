/**
 * Pure motion math. No imports on purpose: Node can load this file directly
 * (scripts/export-curve.mjs) and Remotion code re-exports it from motion.ts.
 *
 * Everything here is a function of the frame (or of normalised time 0..1).
 * No state, no timers, no randomness: the same input is the same output.
 *
 * FRAME ARITHMETIC TRAPS (F-A14, checked against real rework in other projects):
 * - `fadeIn(0)` is 0, so the first frame of a shot is empty. Start soft (see `softFade`).
 * - A faded exit that leaves 40 to 57 % opacity on its last frame pops at a hard cut.
 *   Use `exitOpacity`: it reaches exactly 0 on the last frame.
 * - Frame N of an N-frame move is the first frame AFTER it. A 20-frame entrance has
 *   progress 0 at frame 0 and 1 at frame 20, so it is fully on for frames 20+ and the
 *   Sequence that holds it needs at least 21 frames or it never lands.
 * - First elements of a scene start on the scene's first frame, not on the caption start,
 *   or the group boundary shows an empty beat.
 * - Never wrap an already-ramping component in a second fade: two ramps multiply and the
 *   result looks late and mushy.
 * - Keyframe tables start with the off-screen value at frame 0, or the element parks on
 *   screen early.
 * - Slide-ins from below that travel more than about 120 px cross the caption band.
 * - Do not change words after frame numbers are hard-coded; freeze copy first.
 * - Before giving the last beat a long animation, count the frames it has left.
 */

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Easing function shape shared with Remotion's `interpolate({ easing })`. */
export type EasingFn = (t: number) => number;

/* ------------------------------------------------------------------ */
/* F-A3: buoyant ease                                                   */
/* ------------------------------------------------------------------ */

/**
 * "Buoyant" ease: a cubic ease-out plus a half-sine bob over the WHOLE lifetime, so a
 * rising element keeps drifting through its peak instead of freezing. Returns 0 at t=0
 * and exactly 1 at t=1; in between it overshoots by about `bob` and settles back.
 *
 *   value(t) = 1 - (1 - t)^3 + bob * sin(pi * t)
 *
 * The bob must span the entire move. A bob that only covers the rise phase leaves a
 * zero-velocity stretch (the failure the source article measured: 16 % of the move).
 * Check with `sampleCurve` + `velocityOf`: the middle of the move has no zero-velocity run.
 *
 * `bob` is a share of the travelled distance. 0.03 (about 2 % overshoot) is the default and
 * a deliberate small exception to "no bounce": use it on one element per scene.
 * Evidence: one detailed production write-up (RapidEye); the exact constants here are
 * this studio's closed-form reading of it, not the author's numbers.
 */
export const buoyant =
  (bob = 0.03): EasingFn =>
  (t) => {
    const x = clamp01(t);
    return 1 - Math.pow(1 - x, 3) + bob * Math.sin(Math.PI * x);
  };

/* ------------------------------------------------------------------ */
/* F-A6: velocity-matched cut                                           */
/* ------------------------------------------------------------------ */

/**
 * Reference numbers are for 60 fps, in px per 60-fps frame, as measured in the source
 * (exit speeds up about 1.1 to 1.2 per frame over the last 16 to 24 frames, ending at 25 to
 * 40 px/frame and never above 60; entry starts at 30 to 55 px/frame and decays 0.92 to 0.94
 * per frame). The functions below convert to the composition's fps, so the same speed in
 * px per second holds at 30 fps. Numbers are the author's claim from frame measurements.
 */
export const VELOCITY_CUT_DEFAULTS = {
  /** px per 60-fps frame at the cut, both sides (matched). */
  speed: 36,
  /** Exit growth per 60-fps frame. */
  growth: 1.15,
  /** Entry decay per 60-fps frame. */
  decay: 0.93,
} as const;

/** Hard ceiling from the source: never above 60 px per 60-fps frame. */
export const VELOCITY_CUT_MAX_SPEED = 60;

type VelocityCutOptions = {
  fps: number;
  /** px per 60-fps frame at the cut. Clamped to 60. */
  speed?: number;
  growth?: number;
  decay?: number;
};

const toRefFrames = (frames: number, fps: number) => (frames * 60) / fps;

/**
 * Distance travelled (px, always >= 0) by the OUTGOING shot `frame` frames into an exit of
 * `exitFrames`. Speed grows by `growth` per 60-fps frame and is `speed` on the last frame,
 * i.e. the fastest frame is the cut. Closed form of the geometric speed series.
 */
export const exitRamp = (
  frame: number,
  exitFrames: number,
  { fps, speed = VELOCITY_CUT_DEFAULTS.speed, growth = VELOCITY_CUT_DEFAULTS.growth }: VelocityCutOptions,
) => {
  const v = Math.min(speed, VELOCITY_CUT_MAX_SPEED);
  const lambda = Math.log(growth);
  const tau = toRefFrames(clamp01(frame / exitFrames) * exitFrames, fps);
  const tauEnd = toRefFrames(exitFrames, fps);
  // v(tau) = v * growth^(tau - tauEnd); distance = integral from 0 to tau, in px.
  return (v / lambda) * (Math.pow(growth, tau - tauEnd) - Math.pow(growth, -tauEnd));
};

/**
 * Distance still to travel (px, always >= 0) for the INCOMING shot `frame` frames into an
 * entry of `entryFrames`. Starts at `speed` and decays by `decay` per 60-fps frame; the offset
 * is exactly 0 on the last frame. Apply it as a translate in the travel direction.
 */
export const entryDecay = (
  frame: number,
  entryFrames: number,
  { fps, speed = VELOCITY_CUT_DEFAULTS.speed, decay = VELOCITY_CUT_DEFAULTS.decay }: VelocityCutOptions,
) => {
  const v = Math.min(speed, VELOCITY_CUT_MAX_SPEED);
  const lambda = Math.log(1 / decay);
  const tau = toRefFrames(clamp01(frame / entryFrames) * entryFrames, fps);
  const tauEnd = toRefFrames(entryFrames, fps);
  return (v / lambda) * (Math.pow(decay, tau) - Math.pow(decay, tauEnd));
};

/* ------------------------------------------------------------------ */
/* F-B4: camera speed table and log-space zoom                          */
/* ------------------------------------------------------------------ */

/** [seconds, share of cruise speed]. Seconds are from the start of the move. */
export type SpeedKey = readonly [number, number];

/**
 * Camera driven by speed, not by position keys. The table gives speed as a share of cruise at
 * times (0 at 0 s, 0.5 by 0.6 s, 1.0 by 1.6 s, held, easing to 0.12 at 8.3 s), the shares are
 * smoothstepped between keys, integrated into position, and scaled so the camera ends exactly at
 * `distance`. Because position is an integral of a continuous speed, it cannot surge or stop
 * unless the table says so. The shape of the table IS the camera language of a glide shot.
 *
 *   const cam = speedCurve([[0, 0], [0.5, 0.55], [1.2, 1], [2.6, 1], [3.6, 0.15], [4, 0]], { fps: 30, distance: 2600 });
 *   cam.position(frame)  // px, 0 .. distance
 *   cam.speed(frame)     // px per frame
 *
 * Before the first key speed is held at that key's share. After the last key the camera holds
 * at `distance`, so end the table on 0 (or a small share) unless you want a stop.
 * Evidence: one precisely described prompt (the film was posted); the optical-flow check
 * from the same source is not implemented here.
 */
export const speedCurve = (
  table: readonly SpeedKey[],
  { fps, distance }: { fps: number; distance: number },
) => {
  const times = table.map(([s]) => s * fps);
  const shares = table.map(([, share]) => share);
  const SUB = 8;

  const shareAt = (frame: number) => {
    if (frame <= times[0]) return shares[0];
    const last = times.length - 1;
    if (frame >= times[last]) return shares[last];
    let i = 0;
    while (frame > times[i + 1]) i++;
    const t = (frame - times[i]) / (times[i + 1] - times[i]);
    const s = t * t * (3 - 2 * t);
    return shares[i] + (shares[i + 1] - shares[i]) * s;
  };

  const integrate = (frame: number) => {
    const end = Math.max(0, frame);
    const steps = Math.max(1, Math.ceil(end * SUB));
    let sum = 0;
    for (let k = 0; k < steps; k++) {
      sum += shareAt(((k + 0.5) / steps) * end);
    }
    return (sum / steps) * end;
  };

  const lastFrame = times[times.length - 1];
  const total = integrate(lastFrame);
  const k = total === 0 ? 0 : distance / total;

  return {
    /** Position in px at `frame`; holds `distance` after the last key's time. */
    position: (frame: number) =>
      frame >= lastFrame ? distance : integrate(frame) * k,
    /** Speed in px per frame at `frame`. */
    speed: (frame: number) => (frame >= lastFrame ? 0 : shareAt(frame) * k),
  };
};

/**
 * Zoom interpolated in log space, so equal steps feel like equal zoom changes and a
 * 1x to 4x zoom does not rush at the end. `t` is progress 0..1 (apply any easing first).
 * Never mix with a linear zoom on the same shot: it turns into a zoom-in/zoom-out wobble.
 */
export const logZoom = (t: number, from: number, to: number) =>
  Math.exp(Math.log(from) + (Math.log(to) - Math.log(from)) * clamp01(t));

/* ------------------------------------------------------------------ */
/* F-A14: safe opacity helpers                                          */
/* ------------------------------------------------------------------ */

/**
 * Fade in that never shows an empty first frame: starts at `floor` (25 to 57 % is the
 * range the source used) and reaches 1 after `length` frames.
 */
export const softFade = (frame: number, start: number, length: number, floor = 0.3) =>
  floor + (1 - floor) * clamp01((frame - start) / length);

/**
 * Exit opacity 1 -> 0 as `1 - (n/N)^1.5`: reaches exactly 0 on the last frame (so a hard cut
 * after it does not pop) and stays high early.
 */
export const exitOpacity = (frame: number, start: number, length: number) =>
  1 - Math.pow(clamp01((frame - start) / length), 1.5);

/* ------------------------------------------------------------------ */
/* Curve export (F-A3): value over time -> JSON for inspect.mjs plot    */
/* ------------------------------------------------------------------ */

export type CurveFile = {
  /** Curve name, shown on the plot. */
  name: string;
  fps: number;
  /** What `values` measure, e.g. "progress" or "px". */
  unit: string;
  /** Frame number of values[0]. */
  startFrame: number;
  /** One value per frame. */
  values: number[];
};

/** Sample `fn(frame)` for frames `startFrame .. startFrame + count - 1`. */
export const sampleCurve = (
  fn: (frame: number) => number,
  { name, fps, unit = "value", startFrame = 0, count }: {
    name: string;
    fps: number;
    unit?: string;
    startFrame?: number;
    count: number;
  },
): CurveFile => ({
  name,
  fps,
  unit,
  startFrame,
  values: Array.from({ length: count }, (_, i) => fn(startFrame + i)),
});

/**
 * Per-frame velocity (difference of consecutive values; first entry repeats the second).
 * Use it to find a zero-velocity run in the middle of a move.
 */
export const velocityOf = (values: readonly number[]) =>
  values.map((v, i) => (i === 0 ? (values[1] ?? v) - v : v - values[i - 1]));

/**
 * Longest run of near-zero velocity strictly inside the move (ignores the first and last
 * 10 % of frames). Returns its length in frames; > 2 usually reads as a stall.
 */
export const longestStall = (values: readonly number[], epsilon = 1e-4) => {
  const vel = velocityOf(values);
  const from = Math.floor(vel.length * 0.1);
  const to = Math.ceil(vel.length * 0.9);
  let best = 0;
  let run = 0;
  for (let i = from; i < to; i++) {
    run = Math.abs(vel[i]) < epsilon ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
};

/** Named curves the exporter script can dump, keyed by CLI name. All take a frame. */
export const exportableCurves = (fps: number, frames: number) => ({
  /** Buoyant ease over `frames`. */
  buoyant: (f: number) => buoyant()(f / frames),
  /** Plain cubic ease-out, for comparison on the same plot. */
  cubicOut: (f: number) => 1 - Math.pow(1 - clamp01(f / frames), 3),
  /** Exit offset in px of a velocity-matched cut. */
  exitRamp: (f: number) => exitRamp(f, frames, { fps }),
  /** Entry offset in px of a velocity-matched cut. */
  entryDecay: (f: number) => entryDecay(f, frames, { fps }),
  /** The demo camera glide: position in px. */
  speedCurve: (f: number) =>
    speedCurve([[0, 0], [0.5, 0.55], [1.2, 1], [2.6, 1], [3.6, 0.15], [4, 0]], { fps, distance: 2600 }).position(f),
});

import type React from "react";
import { linearTiming, springTiming } from "@remotion/transitions";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { entryDecay, exitRamp } from "./curves";
import { color, ease, springs, timing } from "./tokens";
import type { SpringToken } from "./tokens";

/* ------------------------------------------------------------------ */
/* Shape geometry shared by the in-scene mask and the scene transitions */
/* ------------------------------------------------------------------ */

export type WipeFrom = "left" | "right" | "top" | "bottom";

/** clip-path for a hard-edged rectangular wipe at progress p (0 hidden, 1 fully shown). */
const insetClip = (p: number, from: WipeFrom) => {
  const hidden = `${(1 - p) * 100}%`;
  switch (from) {
    case "left":
      return `inset(0 ${hidden} 0 0)`;
    case "right":
      return `inset(0 0 0 ${hidden})`;
    case "top":
      return `inset(0 0 ${hidden} 0)`;
    case "bottom":
      return `inset(${hidden} 0 0 0)`;
  }
};

/** clip-path for a circle grown from `origin` (percentages). 150 % covers the frame from any corner. */
const circleClip = (p: number, origin: [number, number]) =>
  `circle(${p * 150}% at ${origin[0]}% ${origin[1]}%)`;

/* ------------------------------------------------------------------ */
/* ShapeMask: reveal anything inside a scene through a moving shape     */
/* ------------------------------------------------------------------ */

type ShapeMaskProps = {
  readonly children: React.ReactNode;
  readonly shape?: "rect" | "circle";
  /** For `rect`: the side the reveal starts from. */
  readonly from?: WipeFrom;
  /** For `circle`: centre in percent of the element. */
  readonly origin?: [number, number];
  readonly delay?: number;
  readonly spring?: SpringToken;
  /** Frames the reveal takes. */
  readonly revealFrames?: number;
  /** Play backwards (hide) instead of reveal. */
  readonly reverse?: boolean;
  readonly style?: React.CSSProperties;
};

/** Reveals its children through an expanding rectangle or circle. Use for images, cards and end marks. */
export const ShapeMask: React.FC<ShapeMaskProps> = ({
  children,
  shape = "rect",
  from = "left",
  origin = [50, 50],
  delay = 0,
  spring: springName = "smooth",
  revealFrames = 24,
  reverse = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = spring({
    frame: frame - delay,
    fps,
    config: springs[springName],
    durationInFrames: revealFrames,
  });
  const p = reverse ? 1 - raw : raw;
  return (
    <div
      style={{
        clipPath:
          shape === "circle" ? circleClip(p, origin) : insetClip(p, from),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scene transitions for <TransitionSeries>                             */
/* ------------------------------------------------------------------ */

type MaskWipeProps = { from: WipeFrom; edgeColor?: string };

const MaskWipePresentation: React.FC<
  TransitionPresentationComponentProps<MaskWipeProps>
> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const { from, edgeColor } = passedProps;
  const horizontal = from === "left" || from === "right";
  const sign = from === "left" || from === "top" ? -1 : 1;

  if (presentationDirection === "exiting") {
    // The outgoing scene drifts a little away from the incoming edge: depth without a zoom.
    const shift = interpolate(p, [0, 1], [0, -sign * 4]);
    return (
      <AbsoluteFill
        style={{ translate: horizontal ? `${shift}% 0%` : `0% ${shift}%` }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const edgePos = `${p * 100}%`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: insetClip(p, from) }}>
        {children}
      </AbsoluteFill>
      {edgeColor && p > 0.01 && p < 0.97 ? (
        <div
          style={{
            position: "absolute",
            backgroundColor: edgeColor,
            ...(horizontal
              ? {
                  top: 0,
                  bottom: 0,
                  width: 3,
                  [from === "left" ? "left" : "right"]: edgePos,
                }
              : {
                  left: 0,
                  right: 0,
                  height: 3,
                  [from === "top" ? "top" : "bottom"]: edgePos,
                }),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Hard-edged directional wipe. The incoming scene is revealed from `from`; optional 3 px accent edge. */
export const maskWipe = (
  props: MaskWipeProps,
): TransitionPresentation<MaskWipeProps> => ({
  component: MaskWipePresentation,
  props,
});

type CircleRevealProps = { origin: [number, number] };

const CircleRevealPresentation: React.FC<
  TransitionPresentationComponentProps<CircleRevealProps>
> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ opacity: interpolate(p, [0, 1], [1, 0.6]) }}>
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ clipPath: circleClip(p, passedProps.origin) }}>
      {children}
    </AbsoluteFill>
  );
};

/** Incoming scene grows out of a circle. Use as a match cut: put the origin where the previous focal point was. */
export const circleReveal = (
  props: CircleRevealProps = { origin: [50, 50] },
): TransitionPresentation<CircleRevealProps> => ({
  component: CircleRevealPresentation,
  props,
});

/* ------------------------------------------------------------------ */
/* Velocity-matched cut (F-A6)                                          */
/* ------------------------------------------------------------------ */

type VelocityCutProps = {
  /** Total transition length in frames (must equal `velocityCutTiming(frames)`). */
  frames: number;
  /** Direction the content travels across the cut. */
  travel: WipeFrom;
  /** px per 60-fps frame at the cut, on both sides. Clamped to 60. */
  speed: number;
  /** Share of the transition spent on the exit (the cut frame). */
  cutAt: number;
  /** Directional motion blur on the moving scene. */
  blur: boolean;
};

const travelVector = (travel: WipeFrom): [number, number] => {
  switch (travel) {
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
    case "top":
      return [0, -1];
    case "bottom":
      return [0, 1];
  }
};

const VelocityCutPresentation: React.FC<
  TransitionPresentationComponentProps<VelocityCutProps>
> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const { fps } = useVideoConfig();
  const { frames, travel, speed, cutAt, blur } = passedProps;
  const [dx, dy] = travelVector(travel);
  const cutFrame = Math.round(frames * cutAt);
  const n = p * frames;
  const exiting = presentationDirection === "exiting";

  // The exiting scene is shown until the cut frame, the entering scene from it.
  if (exiting ? n >= cutFrame : n < cutFrame) return null;

  const opts = { fps, speed };
  // Signed offset along the travel direction. Exit: ahead of rest and accelerating.
  // Entry: behind its rest position (it arrives from where it is heading) and braking.
  const at = (frame: number) =>
    exiting
      ? exitRamp(frame, cutFrame, opts)
      : -entryDecay(frame - cutFrame, frames - cutFrame, opts);
  const offset = at(n);
  const perFrame = Math.abs(at(n) - at(n - 1));
  // 180 degree shutter: blur length is half the per-frame step; sigma is about a third of that.
  const sigma = blur ? (perFrame * 0.5) / 3 : 0;
  const id = exiting ? "vcut-out" : "vcut-in";

  return (
    <AbsoluteFill
      style={{
        translate: `${dx * offset}px ${dy * offset}px`,
        filter: sigma > 0.5 ? `url(#${id})` : undefined,
      }}
    >
      {sigma > 0.5 ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur
              stdDeviation={dx !== 0 ? `${sigma} 0` : `0 ${sigma}`}
            />
          </filter>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

/** Linear timing for the velocity cut: its curves are closed forms of the frame, so no spring. */
export const velocityCutTiming = (frames = 30) =>
  linearTiming({ durationInFrames: frames });

/**
 * Velocity-matched cut: the outgoing scene accelerates and is cut at its fastest frame, the
 * incoming scene starts at the same speed and brakes to rest, so momentum crosses the edit.
 * Pair with `velocityCutTiming(frames)` using the SAME `frames`. Delay the incoming scene's own
 * entrances by `cutAt * frames`: it is hidden until then. Text in a moving scene should be
 * under 20 px per frame by the time it is read.
 */
export const velocityCut = ({
  frames = 30,
  travel = "left",
  speed = 36,
  cutAt = 0.4,
  blur = true,
}: Partial<VelocityCutProps> = {}): TransitionPresentation<VelocityCutProps> => ({
  component: VelocityCutPresentation,
  props: { frames, travel, speed, cutAt, blur },
});

/* ------------------------------------------------------------------ */
/* Occluder cut (F-A7): a soft neutral band hides the cut               */
/* ------------------------------------------------------------------ */

type OccluderCutProps = { from: WipeFrom; bandColor: string };

/** Band length as % of the frame along the sweep axis; it covers the screen near the midpoint. */
const OCCLUDER_WIDTH = 180;
const DRAG_PX = 28;

const OccluderCutPresentation: React.FC<
  TransitionPresentationComponentProps<OccluderCutProps>
> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { from, bandColor } = passedProps;
  const horizontal = from === "left" || from === "right";
  const sign = from === "left" || from === "top" ? 1 : -1;
  const exiting = presentationDirection === "exiting";

  // The cut happens at the midpoint, inside the frames where the band covers the screen.
  if (exiting ? p >= 0.5 : p < 0.5) return null;

  // A small drag before the cut and a settle after it, so the two shots read as one take.
  const drag = exiting
    ? ease.in(p / 0.5) * DRAG_PX
    : -(1 - ease.out((p - 0.5) / 0.5)) * DRAG_PX;
  const shift = sign * drag;

  // The band centre travels from fully outside the start edge to fully outside the far edge.
  const travel = ease.inOut(p);
  const start = -OCCLUDER_WIDTH / 2;
  const end = 100 + OCCLUDER_WIDTH / 2;
  const centre = start + (end - start) * travel;
  const lead = sign === 1 ? centre : 100 - centre;
  const angle = horizontal
    ? sign === 1
      ? "90deg"
      : "270deg"
    : sign === 1
      ? "180deg"
      : "0deg";
  const gradient = `linear-gradient(${angle}, transparent 0%, ${bandColor} 28%, ${bandColor} 72%, transparent 100%)`;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ translate: horizontal ? `${shift}px 0px` : `0px ${shift}px` }}
      >
        {children}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          backgroundImage: gradient,
          ...(horizontal
            ? {
                top: 0,
                bottom: 0,
                width: `${OCCLUDER_WIDTH}%`,
                left: `${lead - OCCLUDER_WIDTH / 2}%`,
              }
            : {
                left: 0,
                right: 0,
                height: `${OCCLUDER_WIDTH}%`,
                top: `${lead - OCCLUDER_WIDTH / 2}%`,
              }),
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Hidden cut: a soft, neutral band sweeps from `from` across the frame and the hard cut happens
 * at the midpoint, while the band covers the screen. Pair with `occluderTiming(frames)`.
 * Delay the incoming scene's entrances by half the length. Line-carry, impact slam and the
 * light leak from the same source are not built (see the ledger).
 */
export const occluderCut = (
  props: Partial<OccluderCutProps> = {},
): TransitionPresentation<OccluderCutProps> => ({
  component: OccluderCutPresentation,
  props: {
    from: props.from ?? "left",
    bandColor: props.bandColor ?? color.surfaceRaised,
  },
});

export const occluderTiming = (frames = 24) =>
  linearTiming({ durationInFrames: frames });

/** Default timing for every scene transition: spring, no overshoot, `timing.transitionFrames` frames. */
export const transitionTiming = (
  durationInFrames: number = timing.transitionFrames,
) => springTiming({ config: springs.smooth, durationInFrames });

/** The approved set. Pick from here instead of reaching for other presentations. */
export const presets = {
  /** Neutral change of topic. */
  fade: () => fade(),
  /** Moving forward in a sequence. */
  wipe: (from: WipeFrom = "left", edgeColor?: string) =>
    maskWipe({ from, edgeColor }),
  /** Zooming into a detail or a match cut on a point. */
  circle: (origin: [number, number] = [50, 50]) => circleReveal({ origin }),
  /** Momentum carries across the edit. Use `velocityCutTiming(frames)` with it. */
  velocity: (travel: WipeFrom = "left", frames = 30) =>
    velocityCut({ travel, frames }),
  /** A soft band hides the cut. Use `occluderTiming(frames)` with it. */
  occluder: (from: WipeFrom = "left") => occluderCut({ from }),
} as const;

import type React from "react";
import { springTiming } from "@remotion/transitions";
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
import { springs, timing } from "./tokens";
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
} as const;

import type React from "react";
import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { font } from "./fonts";
import { measureTextWidth } from "./textMetrics";
import { color as palette, ease, frameType, springs } from "./tokens";
import type { FrameStep } from "./tokens";

type Props = {
  /** 1 to 4 words each. Check the budget with `lintCopy` (copy.ts). */
  readonly fragments: readonly string[];
  /**
   * `build`: fragments append to one held line, the newest in the accent, and the line re-centres
   * once per fragment. `replace`: each fragment leaves whole and the next takes the same centre.
   */
  readonly mode?: "build" | "replace";
  /** Frames between the start of one fragment and the next (the picture beat lives here). */
  readonly framesPerFragment?: number;
  readonly delay?: number;
  /** Rung of the vw ramp (tokens.frameRamp). Build mode needs one line: use `claim` or smaller. */
  readonly step?: FrameStep;
  /** Frames the last fragment stays before the whole line leaves. Omit to stay until the scene ends. */
  readonly holdLast?: number;
  readonly accentColor?: string;
};

const ENTER = 18;
const LEAVE = 8;

/**
 * Film copy as fragments, not sentences (F-A2). Recipes: the animation is the verb (words
 * before and after the demo, never describing it), stem plus rotating slot instead of a list.
 * One accent per frame: only the newest fragment is accented.
 *
 * ```tsx
 * <FragmentChain fragments={["Move once.", "Land softly.", "Cut."]} mode="build" step="claim" />
 * ```
 */
export const FragmentChain: React.FC<Props> = ({
  fragments,
  mode = "build",
  framesPerFragment = 30,
  delay = 0,
  step = "claim",
  holdLast,
  accentColor = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frameType(width, step);

  const progress = (i: number) =>
    spring({
      frame: frame - delay - i * framesPerFragment,
      fps,
      config: springs.smooth,
      durationInFrames: ENTER,
    });

  const lastStart = delay + (fragments.length - 1) * framesPerFragment;
  const lineExit =
    holdLast === undefined
      ? 0
      : interpolate(
          frame,
          [lastStart + holdLast, lastStart + holdLast + LEAVE],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease.in,
          },
        );

  const base: React.CSSProperties = {
    position: "absolute",
    top: 0,
    whiteSpace: "nowrap",
    fontFamily: font.sans,
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    fontWeight: t.fontWeight,
  };

  const box: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: t.fontSize * t.lineHeight,
    opacity: 1 - lineExit,
  };

  if (mode === "replace") {
    return (
      <div style={box}>
        {fragments.map((text, i) => {
          const enter = progress(i);
          const leaveStart = delay + (i + 1) * framesPerFragment - LEAVE;
          const leave =
            i < fragments.length - 1
              ? interpolate(frame, [leaveStart, leaveStart + LEAVE], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: ease.in,
                })
              : 0;
          if (frame < delay + i * framesPerFragment || leave >= 1) return null;
          return (
            <div
              key={i}
              style={{
                ...base,
                left: 0,
                right: 0,
                textAlign: "center",
                color: i === fragments.length - 1 ? accentColor : palette.text,
                opacity: enter * (1 - leave),
                translate: `0px ${(1 - enter) * 0.3 * t.fontSize}px`,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    );
  }

  // build: measure, then place every fragment from the line's centre.
  const metrics = {
    fontFamily: font.sans,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    letterSpacingEm: parseFloat(t.letterSpacing),
  };
  const space = measureTextWidth(" ", metrics) || t.fontSize * 0.25;
  const widths = fragments.map((f) => measureTextWidth(f, metrics));
  const starts: number[] = [];
  widths.reduce((x, w, i) => {
    starts[i] = x;
    return x + w + space;
  }, 0);
  const lineWidth = (k: number) => starts[k] + widths[k];

  const ps = fragments.map((_, i) => progress(i));
  const current = Math.max(
    0,
    Math.min(
      fragments.length - 1,
      Math.floor((frame - delay) / framesPerFragment),
    ),
  );
  // Width of the held line eased from the previous fragment's to the current one's: the
  // line re-centres once per fragment.
  const prevWidth = current === 0 ? lineWidth(0) : lineWidth(current - 1);
  const heldWidth =
    current === 0
      ? lineWidth(0)
      : prevWidth + (lineWidth(current) - prevWidth) * ps[current];
  const left = -heldWidth / 2;

  return (
    <div style={box}>
      {fragments.map((text, i) => {
        if (frame < delay + i * framesPerFragment) return null;
        const newest = ps[i] * (1 - (ps[i + 1] ?? 0));
        return (
          <div
            key={i}
            style={{
              ...base,
              left: `calc(50% + ${left + starts[i]}px)`,
              color: interpolateColors(newest, [0, 1], [palette.text, accentColor]),
              opacity: ps[i],
              translate: `0px ${(1 - ps[i]) * 0.3 * t.fontSize}px`,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};

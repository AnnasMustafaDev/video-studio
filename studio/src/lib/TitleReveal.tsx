import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "./fonts";
import { useInOut } from "./motion";
import {
  color as palette,
  ease,
  space,
  springs,
  timing,
  type as typeScale,
} from "./tokens";
import type { TypeToken } from "./tokens";

type Props = {
  /** Title text. Use "\n" for intentional line breaks; each line is revealed through its own mask. */
  readonly title: string;
  readonly subtitle?: string;
  /** Small mono label above the title. */
  readonly eyebrow?: string;
  readonly size?: Extract<TypeToken, "display" | "h1" | "h2">;
  readonly align?: "left" | "center";
  /** Lines rise from below (`up`) or drop from above (`down`). */
  readonly direction?: "up" | "down";
  readonly delay?: number;
  /** Total time on screen including the exit. Omit to hold until the Sequence ends. */
  readonly durationInFrames?: number;
  readonly color?: string;
  readonly accentColor?: string;
  readonly maxWidth?: number;
};

/** Masked, line-by-line title with optional eyebrow and subtitle. The default opener. */
export const TitleReveal: React.FC<Props> = ({
  title,
  subtitle,
  eyebrow,
  size = "display",
  align = "left",
  direction = "up",
  delay = 0,
  durationInFrames,
  color = palette.text,
  accentColor = palette.accent,
  maxWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { exit } = useInOut({ delay, durationInFrames });
  const lines = title.split("\n");
  const t = typeScale[size];
  const sign = direction === "up" ? 1 : -1;
  const titleDelay = delay + (eyebrow ? 6 : 0);
  const subtitleDelay = titleDelay + lines.length * timing.lineStagger + 8;

  const lineProgress = (i: number) =>
    spring({
      frame: frame - titleDelay - i * timing.lineStagger,
      fps,
      config: springs.smooth,
      durationInFrames: 24,
    });

  const eyebrowIn = spring({
    frame: frame - delay,
    fps,
    config: springs.smooth,
    durationInFrames: timing.enter,
  });
  const subtitleIn = interpolate(
    frame,
    [subtitleDelay, subtitleDelay + timing.enter],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    },
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        maxWidth,
        opacity: 1 - exit,
        translate: `0px ${-exit * 24}px`,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: space.s,
            marginBottom: space.l,
            fontFamily: font.mono,
            fontSize: typeScale.label.fontSize,
            letterSpacing: typeScale.label.letterSpacing,
            fontWeight: typeScale.label.fontWeight,
            color: palette.textMuted,
            opacity: eyebrowIn,
          }}
        >
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: accentColor,
              scale: `${eyebrowIn} 1`,
              transformOrigin: "left center",
            }}
          />
          <span style={{ translate: `${(1 - eyebrowIn) * -12}px 0px` }}>
            {eyebrow}
          </span>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: font.sans,
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          fontWeight: t.fontWeight,
          color,
        }}
      >
        {lines.map((line, i) => {
          const p = lineProgress(i);
          return (
            // Bottom padding keeps descenders inside the mask; the negative margin cancels it in layout.
            <div
              key={i}
              style={{
                overflow: "hidden",
                paddingBottom: "0.12em",
                marginBottom: "-0.12em",
              }}
            >
              <div style={{ translate: `0px ${(1 - p) * 160 * sign}%` }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: space.l,
            fontFamily: font.sans,
            fontSize: typeScale.body.fontSize,
            lineHeight: typeScale.body.lineHeight,
            letterSpacing: typeScale.body.letterSpacing,
            fontWeight: typeScale.body.fontWeight,
            color: palette.textMuted,
            opacity: subtitleIn,
            translate: `0px ${(1 - subtitleIn) * 16}px`,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

import type React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "./fonts";
import { useSafeArea } from "./motion";
import {
  color as palette,
  ease,
  radius,
  space,
  springs,
  timing,
  type as typeScale,
} from "./tokens";

type Props = {
  readonly name: string;
  /** Role, title or source line under the name. */
  readonly role?: string;
  readonly side?: "left" | "right";
  readonly delay?: number;
  /** Total time on screen including the exit. Lower thirds should always leave: default 3 s. */
  readonly durationInFrames?: number;
  readonly accentColor?: string;
  /** Dark backing panel for legibility over footage. */
  readonly panel?: boolean;
};

/**
 * Name and role tag anchored to the bottom safe margin.
 * Sequence: accent bar grows, name wipes in, role fades up; reverse on exit.
 */
export const LowerThird: React.FC<Props> = ({
  name,
  role,
  side = "left",
  delay = 0,
  durationInFrames = 90,
  accentColor = palette.accent,
  panel = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { insets } = useSafeArea();
  const local = frame - delay;

  const bar = spring({
    frame: local,
    fps,
    config: springs.snappy,
    durationInFrames: 14,
  });
  const nameIn = spring({
    frame: local - 6,
    fps,
    config: springs.smooth,
    durationInFrames: timing.enter,
  });
  const roleIn = interpolate(local, [14, 14 + timing.enter], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.out,
  });
  const exit = interpolate(
    local,
    [durationInFrames - timing.exit, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.in,
    },
  );
  const reveal = nameIn * (1 - exit);
  const clipFrom = side === "left" ? "right" : "left";

  return (
    <div
      style={{
        position: "absolute",
        bottom: insets.bottom,
        [side]: side === "left" ? insets.left : insets.right,
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "stretch",
        gap: space.m,
        opacity: 1 - exit * 0.4,
      }}
    >
      <div
        style={{
          width: 5,
          borderRadius: 3,
          backgroundColor: accentColor,
          scale: `1 ${bar * (1 - exit)}`,
          transformOrigin: "bottom center",
        }}
      />
      <div
        style={{
          padding: panel
            ? `${space.m}px ${space.l}px ${space.m}px ${space.m}px`
            : 0,
          backgroundColor: panel ? "rgba(13, 14, 16, 0.78)" : undefined,
          borderRadius: radius.s,
          clipPath: `inset(0 ${clipFrom === "right" ? (1 - reveal) * 100 : 0}% 0 ${clipFrom === "left" ? (1 - reveal) * 100 : 0}%)`,
          textAlign: side,
        }}
      >
        <div
          style={{
            fontFamily: font.sans,
            fontSize: typeScale.h2.fontSize * 0.75,
            lineHeight: 1.1,
            letterSpacing: typeScale.h2.letterSpacing,
            fontWeight: 600,
            color: palette.text,
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {role ? (
          <div
            style={{
              marginTop: space.xs,
              fontFamily: font.mono,
              fontSize: typeScale.label.fontSize,
              letterSpacing: "0.02em",
              color: palette.textMuted,
              whiteSpace: "nowrap",
              opacity: roleIn * (1 - exit),
              translate: `0px ${(1 - roleIn) * 8}px`,
            }}
          >
            {role}
          </div>
        ) : null}
      </div>
    </div>
  );
};

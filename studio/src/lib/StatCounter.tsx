import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { font } from "./fonts";
import { useInOut } from "./motion";
import {
  color as palette,
  ease,
  space,
  timing,
  type as typeScale,
} from "./tokens";
import type { TypeToken } from "./tokens";

type Props = {
  readonly value: number;
  readonly from?: number;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  /** What the number means, in sentence case. */
  readonly label?: string;
  readonly size?: Extract<TypeToken, "display" | "h1" | "h2">;
  readonly delay?: number;
  /** Frames the count takes. */
  readonly countFrames?: number;
  readonly durationInFrames?: number;
  /** Number colour. Use the accent only when this is the scene's focal point. */
  readonly color?: string;
  readonly align?: "left" | "center";
};

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** A single number that counts up with an ease-out, plus a label. Width is reserved so nothing jitters. */
export const StatCounter: React.FC<Props> = ({
  value,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  label,
  size = "display",
  delay = 0,
  countFrames = timing.count,
  durationInFrames,
  color = palette.text,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const { enter, exit } = useInOut({ delay, durationInFrames });
  const current = interpolate(
    frame,
    [delay, delay + countFrames],
    [from, value],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    },
  );
  const labelIn = interpolate(
    frame,
    [delay + 8, delay + 8 + timing.enter],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    },
  );
  const t = typeScale[size];
  const finalText = `${prefix}${format(value, decimals)}${suffix}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        opacity: enter * (1 - exit),
        translate: `0px ${(1 - enter) * 20}px`,
      }}
    >
      <div
        style={{
          position: "relative",
          fontFamily: font.sans,
          fontSize: t.fontSize * 1.15,
          lineHeight: 1,
          letterSpacing: t.letterSpacing,
          fontWeight: t.fontWeight,
          fontVariantNumeric: "tabular-nums",
          color,
        }}
      >
        {/* Invisible final value reserves the width so the layout never shifts while counting. */}
        <span style={{ visibility: "hidden" }}>{finalText}</span>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            textAlign: align,
          }}
        >
          {prefix}
          {format(current, decimals)}
          {suffix}
        </span>
      </div>
      {label ? (
        <div
          style={{
            marginTop: space.m,
            fontFamily: font.sans,
            fontSize: typeScale.body.fontSize,
            lineHeight: typeScale.body.lineHeight,
            color: palette.textMuted,
            opacity: labelIn,
            translate: `0px ${(1 - labelIn) * 10}px`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { font } from "./fonts";
import { useInOut, useStagger } from "./motion";
import {
  color as palette,
  radius,
  space,
  timing,
  type as typeScale,
} from "./tokens";

export type BarDatum = { readonly label: string; readonly value: number };

type Props = {
  readonly data: readonly BarDatum[];
  /** Index of the one bar that carries the accent. Others stay neutral. */
  readonly highlight?: number;
  /** Scale maximum. Defaults to the largest value. */
  readonly max?: number;
  readonly title?: string;
  readonly valueSuffix?: string;
  readonly decimals?: number;
  /** Overall width in px. */
  readonly width?: number;
  readonly barHeight?: number;
  /** Width of the label column in px. */
  readonly labelWidth?: number;
  readonly delay?: number;
  /** Frames between bars. */
  readonly stagger?: number;
  readonly durationInFrames?: number;
  readonly accentColor?: string;
};

/** Horizontal bar chart. Bars grow in order with a spring; values ride on the bar ends. */
export const BarChart: React.FC<Props> = ({
  data,
  highlight,
  max,
  title,
  valueSuffix = "",
  decimals = 0,
  width = 900,
  barHeight = 44,
  labelWidth = 200,
  delay = 0,
  stagger = timing.lineStagger,
  durationInFrames,
  accentColor = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const progress = useStagger();
  const { exit } = useInOut({ delay, durationInFrames });
  const scaleMax = max ?? Math.max(...data.map((d) => d.value));
  const barsDelay = delay + (title ? 8 : 0);
  const valueReserve = 150;
  const titleIn = interpolate(frame, [delay, delay + timing.enter], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width, opacity: 1 - exit, fontFamily: font.sans }}>
      {title ? (
        <div
          style={{
            fontFamily: font.mono,
            fontSize: typeScale.label.fontSize,
            letterSpacing: typeScale.label.letterSpacing,
            color: palette.textMuted,
            marginBottom: space.l,
            opacity: titleIn,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: space.m }}>
        {data.map((d, i) => {
          const p = progress(i, {
            delay: barsDelay,
            stagger,
            springName: "snappy",
          });
          const grow = progress(i, {
            delay: barsDelay + 4,
            stagger,
            springName: "smooth",
          });
          const ratio = d.value / scaleMax;
          const isHighlight = i === highlight;
          return (
            <div
              key={d.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: space.m,
                opacity: p,
              }}
            >
              <div
                style={{
                  width: labelWidth,
                  flexShrink: 0,
                  fontSize: 34,
                  fontWeight: 500,
                  color: isHighlight ? palette.text : palette.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  height: barHeight,
                  paddingRight: valueReserve,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${ratio * 100}%`,
                      borderRadius: radius.s / 2,
                      backgroundColor: isHighlight
                        ? accentColor
                        : palette.surfaceRaised,
                      border: isHighlight
                        ? "none"
                        : `1px solid ${palette.lineStrong}`,
                      scale: `${grow} 1`,
                      transformOrigin: "left center",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `calc(${ratio * grow * 100}% + ${space.m}px)`,
                      display: "flex",
                      alignItems: "center",
                      fontSize: 34,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: isHighlight ? palette.text : palette.textMuted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(d.value * grow).toFixed(decimals)}
                    {valueSuffix}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

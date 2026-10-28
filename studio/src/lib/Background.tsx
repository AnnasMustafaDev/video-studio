import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { color as palette } from "./tokens";

type Props = {
  /** `plain` = flat colour, `grid` = hairline grid, `dots` = dot grid. */
  readonly variant?: "plain" | "grid" | "dots";
  /** Grid cell size in px. */
  readonly cell?: number;
  /** Film grain on top. Keep it subtle; it is texture, not an effect. */
  readonly grain?: boolean;
  /** Grain opacity, 0..1. */
  readonly grainAmount?: number;
  /** Slow constant drift of the grid in px per second (0 = static). */
  readonly drift?: number;
  /** Darken the edges to pull focus to the centre. */
  readonly vignette?: boolean;
  readonly color?: string;
  readonly lineColor?: string;
  /** Seed for the grain, so two backgrounds in one video do not look identical. */
  readonly seed?: string;
};

/**
 * Scene background. Deterministic: the grid drift is a function of the frame,
 * the grain pattern changes every 2 frames using Remotion's seeded random().
 */
export const Background: React.FC<Props> = ({
  variant = "grid",
  cell = 80,
  grain = true,
  grainAmount = 0.06,
  drift = 4,
  vignette = true,
  color = palette.bg,
  lineColor = palette.line,
  seed = "bg",
}) => {
  const frame = useCurrentFrame();
  // Constant drift is the one place linear motion is intended.
  const offset = interpolate(frame, [0, 30], [0, drift]);

  const pattern =
    variant === "grid"
      ? `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`
      : variant === "dots"
        ? `radial-gradient(${lineColor} 1.5px, transparent 1.6px)`
        : undefined;

  const grainStep = Math.floor(frame / 2);
  const grainSeed = Math.floor(random(`${seed}-grain-${grainStep}`) * 1000);
  const grainShiftX = Math.round(random(`${seed}-gx-${grainStep}`) * 64);
  const grainShiftY = Math.round(random(`${seed}-gy-${grainStep}`) * 64);

  return (
    <AbsoluteFill style={{ backgroundColor: color, overflow: "hidden" }}>
      {pattern ? (
        <AbsoluteFill
          style={{
            backgroundImage: pattern,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `${offset}px ${offset * 0.5}px`,
            maskImage:
              "radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 100%)",
          }}
        />
      ) : null}
      {vignette ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)",
          }}
        />
      ) : null}
      {grain ? (
        <AbsoluteFill style={{ opacity: grainAmount, mixBlendMode: "overlay" }}>
          <svg
            width="100%"
            height="100%"
            style={{
              translate: `${-grainShiftX}px ${-grainShiftY}px`,
              scale: "1.1",
            }}
          >
            <filter id={`grain-${seed}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves={2}
                seed={grainSeed}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

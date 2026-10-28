import type React from "react";
import { Fragment } from "react";
import { font } from "./fonts";
import { useInOut, useStagger } from "./motion";
import { color as palette, timing, type as typeScale } from "./tokens";
import type { SpringToken, TypeToken } from "./tokens";

type Props = {
  /** Keep it short: a word or a short phrase. Long text per-character reads as noise. */
  readonly text: string;
  readonly size?: TypeToken;
  readonly fontWeight?: number;
  /** Characters rise from a mask (`up`) or drop into it (`down`). */
  readonly direction?: "up" | "down";
  readonly delay?: number;
  /** Frames between characters. Fractions are fine. */
  readonly stagger?: number;
  readonly spring?: SpringToken;
  readonly durationInFrames?: number;
  readonly color?: string;
  readonly align?: "left" | "center";
};

/**
 * Per-character masked reveal. Characters are grouped per word so lines
 * only ever break between words.
 */
export const CharStagger: React.FC<Props> = ({
  text,
  size = "display",
  fontWeight,
  direction = "up",
  delay = 0,
  stagger = timing.charStagger,
  spring: springName = "smooth",
  durationInFrames,
  color = palette.text,
  align = "left",
}) => {
  const progress = useStagger();
  const { exit } = useInOut({ delay, durationInFrames });
  const t = typeScale[size];
  const sign = direction === "up" ? 1 : -1;
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <div
      style={{
        fontFamily: font.sans,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        fontWeight: fontWeight ?? t.fontWeight,
        color,
        textAlign: align,
        opacity: 1 - exit,
      }}
    >
      {words.map((word, w) => (
        <Fragment key={w}>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((char, c) => {
              const p = progress(charIndex++, { delay, stagger, springName });
              return (
                <span
                  key={c}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                    paddingBottom: "0.12em",
                    marginBottom: "-0.12em",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      translate: `0px ${(1 - p) * 150 * sign}%`,
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </div>
  );
};

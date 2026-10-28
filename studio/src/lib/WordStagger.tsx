import type React from "react";
import { Fragment } from "react";
import { font } from "./fonts";
import { directionVector, useInOut, useStagger } from "./motion";
import type { Direction } from "./motion";
import { color as palette, timing, type as typeScale } from "./tokens";
import type { SpringToken, TypeToken } from "./tokens";

type Props = {
  readonly text: string;
  /** Words (case-insensitive, punctuation ignored) drawn in the accent colour. Use one, at most two. */
  readonly highlight?: readonly string[];
  readonly size?: TypeToken;
  readonly fontWeight?: number;
  /** Set in JetBrains Mono (labels, paths, code). */
  readonly mono?: boolean;
  readonly direction?: Direction;
  readonly delay?: number;
  /** Frames between words. */
  readonly stagger?: number;
  readonly spring?: SpringToken;
  readonly durationInFrames?: number;
  readonly color?: string;
  readonly accentColor?: string;
  readonly align?: "left" | "center";
  readonly maxWidth?: number;
};

const normalise = (word: string) =>
  word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Word-by-word kinetic sentence. Use for statements and hooks. */
export const WordStagger: React.FC<Props> = ({
  text,
  highlight = [],
  size = "h1",
  fontWeight,
  mono = false,
  direction = "up",
  delay = 0,
  stagger = timing.wordStagger,
  spring: springName = "smooth",
  durationInFrames,
  color = palette.text,
  accentColor = palette.accent,
  align = "left",
  maxWidth,
}) => {
  const progress = useStagger();
  const { exit } = useInOut({ delay, durationInFrames });
  const [dx, dy] = directionVector(direction);
  const t = typeScale[size];
  const accentWords = new Set(highlight.map(normalise));
  const words = text.split(" ");

  return (
    <div
      style={{
        fontFamily: mono ? font.mono : font.sans,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        fontWeight: fontWeight ?? t.fontWeight,
        color,
        textAlign: align,
        maxWidth,
        opacity: 1 - exit,
      }}
    >
      {words.map((word, i) => {
        const p = progress(i, { delay, stagger, springName });
        return (
          <Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                opacity: p,
                translate: `${(1 - p) * dx * 0.4}em ${(1 - p) * dy * 0.4}em`,
                color: accentWords.has(normalise(word))
                  ? accentColor
                  : undefined,
              }}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </div>
  );
};

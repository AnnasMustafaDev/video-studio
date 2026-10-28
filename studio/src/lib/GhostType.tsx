import type React from "react";
import { useCurrentFrame } from "remotion";
import { font } from "./fonts";
import { color as palette } from "./tokens";

type Props = {
  readonly text: string;
  /** Font size in px. For hero text pass `useFrameType("claim").fontSize`. */
  readonly fontSize: number;
  readonly lineHeight?: number;
  readonly letterSpacing?: string;
  readonly fontWeight?: number;
  readonly mono?: boolean;
  readonly delay?: number;
  /** Frames per character. */
  readonly framesPerChar?: number;
  /** Extra frames of pause after `, ; :` and after `. ? !`. */
  readonly commaPause?: number;
  readonly sentencePause?: number;
  readonly maxWidth?: number;
  readonly color?: string;
};

/** Frame on which each character becomes visible (character i shows when frame >= result[i]). */
export const typingSchedule = (
  text: string,
  framesPerChar: number,
  commaPause: number,
  sentencePause: number,
) => {
  const at: number[] = [];
  let t = 0;
  for (const ch of text) {
    at.push(Math.round(t));
    t += framesPerChar;
    if (",;:".includes(ch)) t += commaPause;
    else if (".?!".includes(ch)) t += sentencePause;
  }
  return at;
};

/**
 * Typewriter text with a locked layout (F-C14). The FULL text is always laid out in the same
 * inline flow; characters not typed yet are just transparent. Lines can never reflow and the
 * box never changes height while typing. No cursor on purpose (see DESIGN_SYSTEM.md).
 *
 * ```tsx
 * <GhostType text="Same frame, same pixels." fontSize={144} delay={20} maxWidth={1000} />
 * ```
 */
export const GhostType: React.FC<Props> = ({
  text,
  fontSize,
  lineHeight = 1.1,
  letterSpacing = "-0.03em",
  fontWeight = 600,
  mono = false,
  delay = 0,
  framesPerChar = 1.6,
  commaPause = 6,
  sentencePause = 10,
  maxWidth,
  color = palette.text,
}) => {
  const frame = useCurrentFrame() - delay;
  const schedule = typingSchedule(text, framesPerChar, commaPause, sentencePause);
  const chars = Array.from(text);
  const typed = schedule.filter((f) => frame >= f).length;

  return (
    <div
      style={{
        fontFamily: mono ? font.mono : font.sans,
        fontSize,
        lineHeight,
        letterSpacing,
        fontWeight,
        color,
        maxWidth,
      }}
    >
      <span>{chars.slice(0, typed).join("")}</span>
      <span style={{ opacity: 0 }}>{chars.slice(typed).join("")}</span>
    </div>
  );
};

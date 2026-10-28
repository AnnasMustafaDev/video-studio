import type React from "react";
import { Fragment } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "./fonts";
import { useSafeArea } from "./motion";
import { color as palette, ease, type as typeScale } from "./tokens";

/** One spoken word. Times are relative to the start of the parent Sequence. */
export type CaptionWord = {
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
};

type Page = { words: CaptionWord[]; startMs: number; endMs: number };

type Props = {
  /** Word-timed captions, e.g. from Whisper. A JSON file of {text,startMs,endMs}[] can be imported directly. */
  readonly captions: readonly CaptionWord[];
  /** Maximum words on screen at once. Keep it to one or two lines. */
  readonly maxWordsPerPage?: number;
  /** A silence longer than this starts a new page. */
  readonly pauseMs?: number;
  /** How long a page stays after its last word. */
  readonly lingerMs?: number;
  /** Cut audio: a page never stays longer than this (see `paginateCaptions`). */
  readonly maxPageMs?: number;
  /** Cut audio: start a new page after a word that ends a sentence. */
  readonly breakOnSentence?: boolean;
  /** Distance above the bottom safe margin. */
  readonly offsetY?: number;
  readonly maxWidth?: number;
  readonly accentColor?: string;
};

/**
 * Caption pages. By default a page ends at `maxWordsPerPage` or at a pause longer than `pauseMs`.
 * On CUT audio (joined takes, trimmed pauses) pauses vanish and one page can swallow dozens of
 * words (F-C13), so also pass `maxPageMs` and `breakOnSentence`: a page then also ends at a
 * word cap, a time cap and a sentence end, never by pause alone. Test with a pause-free input.
 */
export const paginateCaptions = (
  captions: readonly CaptionWord[],
  maxWordsPerPage: number,
  pauseMs: number,
  { maxPageMs = Infinity, breakOnSentence = false }: {
    maxPageMs?: number;
    breakOnSentence?: boolean;
  } = {},
): Page[] => {
  const pages: Page[] = [];
  for (const word of captions) {
    const current = pages[pages.length - 1];
    const startsNewPage =
      !current ||
      current.words.length >= maxWordsPerPage ||
      word.startMs - current.endMs > pauseMs ||
      word.endMs - current.startMs > maxPageMs ||
      (breakOnSentence && /[.!?]["')\]]?$/.test(current.words[current.words.length - 1].text.trim()));
    if (startsNewPage) {
      pages.push({ words: [word], startMs: word.startMs, endMs: word.endMs });
    } else {
      current.words.push(word);
      current.endMs = word.endMs;
    }
  }
  return pages;
};

/**
 * Word-timed captions, paged. Spoken words are full white, the current word
 * is in the accent colour, upcoming words are dimmed.
 */
export const Captions: React.FC<Props> = ({
  captions,
  maxWordsPerPage = 6,
  pauseMs = 500,
  lingerMs = 400,
  maxPageMs,
  breakOnSentence,
  offsetY = 0,
  maxWidth = 1300,
  accentColor = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { insets, width } = useSafeArea();
  const ms = (frame / fps) * 1000;

  const pages = paginateCaptions(captions, maxWordsPerPage, pauseMs, {
    maxPageMs,
    breakOnSentence,
  });
  const pageIndex = pages.findIndex((p, i) => {
    const nextStart = pages[i + 1]?.startMs ?? Infinity;
    return ms >= p.startMs && ms < Math.min(p.endMs + lingerMs, nextStart);
  });
  if (pageIndex === -1) return null;
  const page = pages[pageIndex];

  const pageFrame = frame - (page.startMs / 1000) * fps;
  const enter = interpolate(pageFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.out,
  });
  const exitStart = ((page.endMs + lingerMs) / 1000) * fps;
  const isLastBeforeGap =
    (pages[pageIndex + 1]?.startMs ?? Infinity) > page.endMs + lingerMs;
  const exit = isLastBeforeGap
    ? interpolate(frame, [exitStart - 6, exitStart], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease.in,
      })
    : 0;

  const boxWidth = Math.min(maxWidth, width - insets.left - insets.right);

  return (
    <div
      style={{
        position: "absolute",
        left: (width - boxWidth) / 2,
        width: boxWidth,
        bottom: insets.bottom + offsetY,
        textAlign: "center",
        fontFamily: font.sans,
        fontSize: typeScale.caption.fontSize,
        lineHeight: typeScale.caption.lineHeight,
        letterSpacing: typeScale.caption.letterSpacing,
        fontWeight: 600,
        opacity: enter * (1 - exit),
        translate: `0px ${(1 - enter) * 10}px`,
        textShadow: "0 2px 12px rgba(0,0,0,0.5)",
      }}
    >
      {page.words.map((word, i) => {
        const isActive = ms >= word.startMs && ms < word.endMs;
        const isSpoken = ms >= word.endMs;
        return (
          <Fragment key={i}>
            <span
              style={{
                color: isActive
                  ? accentColor
                  : isSpoken
                    ? palette.text
                    : "rgba(242, 241, 236, 0.38)",
              }}
            >
              {word.text.trim()}
            </span>
            {i < page.words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </div>
  );
};

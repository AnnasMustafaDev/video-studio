/**
 * Copy budget lint (F-A2). Pure, no imports, so scripts/copy-lint.mjs can load it.
 *
 * Numbers come from a frame-by-frame study of eight professional films (the author's claim):
 * about 15 to 25 words for a 30 s launch, 6 or fewer for a muted loop, no more than about
 * 8 words readable on one frame, and copy on more than about 65 % of frames reads as a
 * subtitle film. Fragments are 1 to 4 words with a picture beat between them.
 */

export const COPY_LIMITS = {
  /** Words per 30 s of film (upper end of the 15 to 25 range). */
  wordsPer30s: 25,
  /** Words per 30 s for a muted loop. */
  mutedWordsPer30s: 6,
  maxFragmentWords: 4,
  maxWordsOnOneFrame: 8,
  /** Share of frames that may carry copy. */
  maxCoverage: 0.65,
} as const;

export const countWords = (text: string) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

type LintInput = {
  /** Every fragment of on-screen copy, in order. */
  readonly fragments: readonly string[];
  readonly durationInFrames: number;
  readonly fps: number;
  /** Frames each fragment is visible. A single number applies to all. */
  readonly visibleFrames: number | readonly number[];
  /**
   * Frames that carry any copy at all (the union). Pass it when fragments overlap, as in build
   * mode, where summing `visibleFrames` double counts the held line.
   */
  readonly coveredFrames?: number;
  /** Muted loop: apply the stricter budget. */
  readonly muted?: boolean;
};

export type CopyLint = {
  words: number;
  allowedWords: number;
  coverage: number;
  warnings: string[];
};

/** Returns warnings, never throws. An empty `warnings` array means the copy fits the budget. */
export const lintCopy = ({
  fragments,
  durationInFrames,
  fps,
  visibleFrames,
  coveredFrames,
  muted = false,
}: LintInput): CopyLint => {
  const warnings: string[] = [];
  const seconds = durationInFrames / fps;
  const words = fragments.reduce((n, f) => n + countWords(f), 0);
  const perThirty = muted ? COPY_LIMITS.mutedWordsPer30s : COPY_LIMITS.wordsPer30s;
  const allowedWords = Math.round((perThirty * seconds) / 30);

  if (words > allowedWords) {
    warnings.push(
      `${words} words in ${seconds.toFixed(1)} s; budget is about ${allowedWords} (${perThirty} per 30 s).`,
    );
  }
  fragments.forEach((f) => {
    if (countWords(f) > COPY_LIMITS.maxFragmentWords) {
      warnings.push(`Fragment "${f}" has more than ${COPY_LIMITS.maxFragmentWords} words.`);
    }
    if (countWords(f) > COPY_LIMITS.maxWordsOnOneFrame) {
      warnings.push(`Fragment "${f}" is more than ${COPY_LIMITS.maxWordsOnOneFrame} words on one frame.`);
    }
  });

  const visible = fragments.map((_, i) =>
    typeof visibleFrames === "number" ? visibleFrames : (visibleFrames[i] ?? 0),
  );
  // Without `coveredFrames` this is an upper bound: overlapping fragments are counted twice.
  const coverage = Math.min(
    1,
    (coveredFrames ?? visible.reduce((a, b) => a + b, 0)) / durationInFrames,
  );
  if (coverage > COPY_LIMITS.maxCoverage) {
    warnings.push(
      `Copy is on about ${Math.round(coverage * 100)} % of frames; above ${COPY_LIMITS.maxCoverage * 100} % reads as a subtitle film.`,
    );
  }
  return { words, allowedWords, coverage, warnings };
};

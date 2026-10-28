import type React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

/**
 * Built-in cues, synthesised with ffmpeg by scripts/make-sfx.mjs (no licence concerns).
 * Add your own files to public/sfx/ and pass `src={staticFile("sfx/name.wav")}`.
 */
export const cues = {
  /** Short high tick: a word, number or bar landing. */
  tick: staticFile("sfx/tick.wav"),
  /** Soft air movement: wipes and scene changes. Starts slightly before the cut. */
  whoosh: staticFile("sfx/whoosh.wav"),
  /** Low soft hit: the main reveal. Once per video. */
  thud: staticFile("sfx/thud.wav"),
} as const;

type Props = {
  /** Frame (relative to the parent Sequence) where the sound starts. */
  readonly at: number;
  readonly src: string;
  /** 0..1. Cues sit under the voice and music: 0.2-0.5 is typical. */
  readonly volume?: number;
  /** Cut the cue after this many frames. */
  readonly durationInFrames?: number;
  readonly name?: string;
};

/** Places a sound effect at a frame. Keep cues next to the visual event they belong to. */
export const Sfx: React.FC<Props> = ({
  at,
  src,
  volume = 0.4,
  durationInFrames,
  name = "Sfx",
}) => (
  <Sequence
    from={at}
    durationInFrames={durationInFrames}
    layout="none"
    name={name}
  >
    <Audio src={src} volume={volume} />
  </Sequence>
);

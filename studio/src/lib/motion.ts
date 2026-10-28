import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, safeArea, getFormat, springs, timing } from "./tokens";
import type { SpringToken } from "./tokens";

export type Direction = "up" | "down" | "left" | "right";

/** Unit vector for a direction: the element travels FROM the opposite side toward rest. */
export const directionVector = (direction: Direction): [number, number] => {
  switch (direction) {
    case "up":
      return [0, 1];
    case "down":
      return [0, -1];
    case "left":
      return [1, 0];
    case "right":
      return [-1, 0];
  }
};

type InOutOptions = {
  /** Frames before the entrance starts. */
  delay?: number;
  /** Total visible length, entrance included. Omit to stay on screen until the parent Sequence ends. */
  durationInFrames?: number;
  /** Spring used for the entrance. */
  spring?: SpringToken;
  /** Length of the exit in frames. */
  exitFrames?: number;
};

/**
 * Entrance and exit progress for an element, driven by the current frame only.
 * `enter` goes 0 -> 1 with a spring. `exit` goes 0 -> 1 over the last `exitFrames`.
 * `visible` = enter * (1 - exit), handy for opacity.
 */
export const useInOut = ({
  delay = 0,
  durationInFrames,
  spring: springName = "smooth",
  exitFrames = timing.exit,
}: InOutOptions = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: springs[springName],
    durationInFrames: timing.enter,
  });

  const exit =
    durationInFrames === undefined
      ? 0
      : interpolate(
          frame,
          [delay + durationInFrames - exitFrames, delay + durationInFrames],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease.in,
          },
        );

  return { enter, exit, visible: enter * (1 - exit), frame, fps };
};

/** Spring progress for one item in a staggered group. */
export const useStagger = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    index: number,
    {
      delay = 0,
      stagger = timing.wordStagger,
      springName = "smooth",
    }: { delay?: number; stagger?: number; springName?: SpringToken } = {},
  ) =>
    spring({
      frame: frame - delay - index * stagger,
      fps,
      config: springs[springName],
      durationInFrames: timing.enter,
    });
};

/** Safe-area insets and format for the current composition. */
export const useSafeArea = () => {
  const { width, height } = useVideoConfig();
  const format = getFormat(width, height);
  return { format, insets: safeArea[format], width, height };
};

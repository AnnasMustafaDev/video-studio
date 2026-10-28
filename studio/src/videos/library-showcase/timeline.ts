import { timing } from "../../lib";

/** Scene lengths in frames at 30 fps. The composition length is derived from these. */
export const SCENES = {
  title: 100,
  type: 90,
  data: 110,
  people: 130,
  end: 80,
} as const;

export const TRANSITION = timing.transitionFrames;

const sceneList = Object.values(SCENES);

export const SHOWCASE_DURATION =
  sceneList.reduce((sum, d) => sum + d, 0) -
  (sceneList.length - 1) * TRANSITION;

/** Frame where each scene starts in the final timeline (transitions overlap scenes). */
export const sceneStart = (index: number) =>
  sceneList.slice(0, index).reduce((sum, d) => sum + d - TRANSITION, 0);

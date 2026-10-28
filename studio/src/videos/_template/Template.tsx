import type React from "react";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { color } from "../../lib";
import { Scene } from "./Scene";

/**
 * Composition skeleton. To start a new video:
 * 1. Copy this folder to src/videos/<slug>/ and rename Template -> YourVideo.
 * 2. Add scenes as <TransitionSeries.Sequence> children, with
 *    <TransitionSeries.Transition presentation={presets.wipe()} timing={transitionTiming()} />
 *    between them (import both from "../../lib").
 * 3. Register it in src/Root.tsx. Duration = sum of scenes - (transitions x timing.transitionFrames).
 * 4. Put sound cues as <Sfx at={frame} src={cues.tick} /> after the series.
 */
export const TEMPLATE_DURATION = 90;

export const Template: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Scene 1"
        durationInFrames={TEMPLATE_DURATION}
      >
        <Scene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

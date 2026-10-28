import type React from "react";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import {
  color,
  occluderCut,
  occluderTiming,
  velocityCut,
  velocityCutTiming,
} from "../../lib";
import { ChainScene, GlideScene, TypeScene } from "./scenes";
import { CUT_OCCLUDER, CUT_VELOCITY, SCENES } from "./timeline";

/**
 * 11.4 s, 1920x1080, 30 fps. One restrained piece that uses each new helper once:
 * FragmentChain + vw ramp (scene 1), velocity-matched cut, buoyant ease + speedCurve camera +
 * logZoom (scene 2), occluder cut, GhostType (scene 3).
 */
export const TechniquesDemo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Chain" durationInFrames={SCENES.chain}>
        <ChainScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={velocityCut({ travel: "left", frames: CUT_VELOCITY })}
        timing={velocityCutTiming(CUT_VELOCITY)}
      />
      <TransitionSeries.Sequence name="Glide" durationInFrames={SCENES.glide}>
        <GlideScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={occluderCut({ from: "left" })}
        timing={occluderTiming(CUT_OCCLUDER)}
      />
      <TransitionSeries.Sequence name="Type" durationInFrames={SCENES.type}>
        <TypeScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

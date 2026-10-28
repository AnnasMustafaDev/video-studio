import type React from "react";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { Sfx, color, cues, presets, transitionTiming } from "../../lib";
import {
  DataScene,
  EndScene,
  PeopleScene,
  TitleScene,
  TypeScene,
} from "./scenes";
import { SCENES, sceneStart } from "./timeline";

/** 15 s tour of every library component. 1920x1080, 30 fps. */
export const LibraryShowcase: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Title" durationInFrames={SCENES.title}>
        <TitleScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={presets.wipe("left", color.accent)}
        timing={transitionTiming()}
      />
      <TransitionSeries.Sequence name="Type" durationInFrames={SCENES.type}>
        <TypeScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={presets.fade()}
        timing={transitionTiming()}
      />
      <TransitionSeries.Sequence name="Data" durationInFrames={SCENES.data}>
        <DataScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={presets.circle([50, 50])}
        timing={transitionTiming()}
      />
      <TransitionSeries.Sequence name="People" durationInFrames={SCENES.people}>
        <PeopleScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={presets.fade()}
        timing={transitionTiming()}
      />
      <TransitionSeries.Sequence name="End" durationInFrames={SCENES.end}>
        <EndScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    {/* Sound cues: one per visual event that deserves weight. */}
    <Sfx name="Title hit" at={8} src={cues.thud} volume={0.5} />
    <Sfx name="Wipe" at={sceneStart(1) - 4} src={cues.whoosh} volume={0.3} />
    <Sfx
      name="Stat lands"
      at={sceneStart(2) + 40}
      src={cues.tick}
      volume={0.3}
    />
    <Sfx name="Reveal" at={sceneStart(3) - 4} src={cues.whoosh} volume={0.25} />
    <Sfx
      name="End mark"
      at={sceneStart(4) + 12}
      src={cues.tick}
      volume={0.35}
    />
  </AbsoluteFill>
);

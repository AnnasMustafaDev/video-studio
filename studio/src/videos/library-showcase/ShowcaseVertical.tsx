import type React from "react";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import {
  Background,
  BarChart,
  Sfx,
  SafeArea,
  StatCounter,
  TitleReveal,
  color,
  cues,
  presets,
  space,
  transitionTiming,
} from "../../lib";
import { SCENES } from "./timeline";

const sceneSeconds = (frames: number) => Math.round((frames / 30) * 10) / 10;

/**
 * 9:16 cut of the showcase opener and data scene, recomposed for a tall frame:
 * stacked instead of side by side, text sized to the 920 px wide safe column.
 */
export const VERTICAL_SCENES = { title: 120, data: 150 } as const;

const VerticalTitle: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="v-title" />
    <SafeArea justify="center">
      <TitleReveal
        eyebrow="Motion library"
        title={"A small motion\nsystem, built\nto be reused."}
        subtitle="Tokens, ten components and a few strict rules."
        size="h1"
        delay={6}
      />
    </SafeArea>
  </AbsoluteFill>
);

const VerticalData: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="v-data" cell={60} />
    <SafeArea justify="center" gap={space.xxl + space.l}>
      <StatCounter
        value={450}
        label="frames, every one rendered from code"
        delay={6}
      />
      <BarChart
        title="Scene length, seconds"
        data={[
          { label: "Title", value: sceneSeconds(SCENES.title) },
          { label: "Type", value: sceneSeconds(SCENES.type) },
          { label: "Data", value: sceneSeconds(SCENES.data) },
          { label: "People", value: sceneSeconds(SCENES.people) },
          { label: "End", value: sceneSeconds(SCENES.end) },
        ]}
        highlight={2}
        max={5}
        decimals={1}
        valueSuffix=" s"
        width={920}
        labelWidth={170}
        delay={18}
      />
    </SafeArea>
  </AbsoluteFill>
);

export const ShowcaseVertical: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Title"
        durationInFrames={VERTICAL_SCENES.title}
      >
        <VerticalTitle />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={presets.wipe("bottom", color.accent)}
        timing={transitionTiming()}
      />
      <TransitionSeries.Sequence
        name="Data"
        durationInFrames={VERTICAL_SCENES.data}
      >
        <VerticalData />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sfx name="Title hit" at={8} src={cues.thud} volume={0.5} />
    <Sfx
      name="Wipe"
      at={VERTICAL_SCENES.title - 15 - 4}
      src={cues.whoosh}
      volume={0.3}
    />
  </AbsoluteFill>
);

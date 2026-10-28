import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Background,
  BarChart,
  Captions,
  CharStagger,
  LowerThird,
  SafeArea,
  ShapeMask,
  StatCounter,
  TitleReveal,
  WordStagger,
  color,
  font,
  radius,
  space,
  type,
  useSafeArea,
} from "../../lib";
import { SCENES } from "./timeline";

/* Scene 1: opener. One focal point: the title. */
export const TitleScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="title" />
    <SafeArea justify="center">
      <TitleReveal
        eyebrow="Video studio / motion library"
        title={"A small motion system,\nbuilt to be reused."}
        subtitle="Tokens, ten components and a few strict rules."
        delay={6}
      />
    </SafeArea>
  </AbsoluteFill>
);

/* Scene 2: kinetic type. The accent lands on the one word that matters. */
export const TypeScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="plain" seed="type" />
    <SafeArea justify="center" gap={space.xl}>
      <WordStagger
        text="Motion should explain, not decorate."
        highlight={["explain"]}
        size="display"
        maxWidth={1500}
        delay={4}
      />
      <WordStagger
        text="Springs, short holds, one focal point per scene."
        size="body"
        color={color.textMuted}
        delay={30}
        stagger={2}
      />
    </SafeArea>
  </AbsoluteFill>
);

const sceneSeconds = (frames: number) => Math.round((frames / 30) * 10) / 10;

/* Scene 3: data. The chart is honest: it shows this video's own scene lengths. */
export const DataScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="data" cell={60} />
    <SafeArea justify="center">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ width: 560 }}>
          <StatCounter
            value={450}
            label="frames, every one rendered from code"
            delay={14}
          />
        </div>
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
          width={860}
          labelWidth={160}
          delay={22}
        />
      </div>
    </SafeArea>
  </AbsoluteFill>
);

const timecode = (frame: number, fps: number) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const s = Math.floor(frame / fps);
  return `00:00:${pad(s)}:${pad(frame % fps)}`;
};

/* A neutral stand-in for footage: a framed plate with a running timecode. */
const FootagePlate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { insets } = useSafeArea();
  return (
    <AbsoluteFill
      style={{ padding: `${insets.top / 2}px ${insets.left / 2}px` }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: radius.l,
            border: `1px solid ${color.line}`,
            background: `radial-gradient(ellipse 70% 80% at 35% 40%, #23272E 0%, ${color.surface} 55%, ${color.bg} 100%)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: space.l,
              left: space.l,
              right: space.l,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: font.mono,
              fontSize: type.label.fontSize,
              letterSpacing: "0.04em",
              color: color.textFaint,
            }}
          >
            <span>Interview, camera A</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {timecode(frame, fps)}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Scene 4: people. Lower third first, then captions take over: one focal point at a time. */
export const PeopleScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="plain" grain seed="people" />
    <FootagePlate />
    <LowerThird
      name="Sam Rivera"
      role="Product designer, sample name"
      delay={8}
      durationInFrames={50}
    />
    <Captions
      captions={[
        { text: "Captions", startMs: 2000, endMs: 2300 },
        { text: "follow", startMs: 2300, endMs: 2520 },
        { text: "the", startMs: 2520, endMs: 2620 },
        { text: "voice,", startMs: 2620, endMs: 2950 },
        { text: "word", startMs: 3050, endMs: 3250 },
        { text: "by", startMs: 3250, endMs: 3350 },
        { text: "word.", startMs: 3350, endMs: 3600 },
      ]}
      maxWordsPerPage={7}
      pauseMs={600}
      lingerMs={200}
      offsetY={24}
    />
  </AbsoluteFill>
);

/* Scene 5: end card. Holds still for the last second. */
export const EndScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="end" />
    <SafeArea justify="center" align="center" gap={space.xl}>
      <ShapeMask shape="circle" delay={10} revealFrames={18}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: color.accent,
          }}
        />
      </ShapeMask>
      <CharStagger
        text="Made in code."
        size="display"
        align="center"
        delay={14}
      />
      <WordStagger
        text="studio/src/lib"
        size="label"
        mono
        color={color.textMuted}
        align="center"
        delay={34}
      />
    </SafeArea>
  </AbsoluteFill>
);

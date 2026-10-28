import type React from "react";
import { AbsoluteFill } from "remotion";
import { Background, SafeArea, TitleReveal } from "../../lib";

/**
 * One scene = one component = one focal point.
 * Copy this file per scene (Scene1Hook.tsx, Scene2Problem.tsx, ...).
 * Frames inside a scene start at 0, whatever its position in the video.
 */
export const Scene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="template" />
    <SafeArea justify="center">
      <TitleReveal
        eyebrow="Eyebrow"
        title={"Scene title"}
        subtitle="Supporting line."
        delay={6}
      />
    </SafeArea>
  </AbsoluteFill>
);

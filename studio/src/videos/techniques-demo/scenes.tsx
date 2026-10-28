import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Background,
  Camera,
  FragmentChain,
  GhostType,
  SafeArea,
  ShapeMask,
  buoyant,
  color,
  font,
  frameType,
  logZoom,
  softFade,
  speedCurve,
  ease,
  useFrameType,
  useSafeArea,
  vw,
} from "../../lib";
import { CHAIN_FRAGMENTS, TYPED_LINE } from "./timeline";

/* Scene 1: fragments build a held line; the newest is the only accent. */
export const ChainScene: React.FC = () => (
  <AbsoluteFill>
    <Background variant="grid" seed="tech-chain" vignette={false} />
    <AbsoluteFill style={{ justifyContent: "center" }}>
      <FragmentChain
        fragments={CHAIN_FRAGMENTS}
        mode="build"
        step="claim"
        framesPerFragment={26}
        delay={6}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* Scene 2: a numeral rises on the buoyant ease while a speed-table camera glides along a ruler. */
const RULER_Y = 780;
const TICK_GAP = 100;
const GLIDE_DISTANCE = 2600;
const CAMERA_START = 18;
/** Share of cruise speed at seconds from the start of the glide. */
const CAMERA_TABLE = [
  [0, 0],
  [0.5, 0.55],
  [1.2, 1],
  [2.2, 1],
  [3, 0.15],
  [3.3, 0],
] as const;

const bob = buoyant();

export const GlideScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useSafeArea();
  const stat = useFrameType("stat");
  const label = useFrameType("label");

  const cam = speedCurve(CAMERA_TABLE, { fps: 30, distance: GLIDE_DISTANCE });
  const camX = cam.position(frame - CAMERA_START);
  const zoomP = interpolate(frame, [66, 112], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.inOut,
  });

  // The numeral rises 90 px on the buoyant ease; it keeps drifting through its peak.
  const riseP = interpolate(frame, [14, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = (1 - bob(riseP)) * 90;

  const centre = width / 2;
  const markerX = centre + GLIDE_DISTANCE;
  const ticks = Array.from({ length: 48 }, (_, i) => -300 + i * TICK_GAP);

  return (
    <AbsoluteFill>
      <Background variant="plain" seed="tech-glide" vignette={false} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: height * 0.12,
        }}
      >
        <div
          style={{
            fontFamily: font.sans,
            fontSize: stat.fontSize,
            lineHeight: stat.lineHeight,
            letterSpacing: stat.letterSpacing,
            fontWeight: stat.fontWeight,
            color: color.text,
            fontVariantNumeric: "tabular-nums",
            opacity: softFade(frame, 14, 18, 0.0),
            translate: `0px ${rise}px`,
          }}
        >
          30
        </div>
      </AbsoluteFill>
      <Camera
        x={camX}
        zoom={logZoom(zoomP, 1, 1.35)}
        originY={RULER_Y}
      >
        <div
          style={{
            position: "absolute",
            left: -400,
            width: 5200,
            top: RULER_Y,
            height: 2,
            backgroundColor: color.lineStrong,
          }}
        />
        {ticks.map((x, i) => {
          const major = i % 5 === 0;
          return (
            <div key={x} style={{ position: "absolute", left: x, top: RULER_Y }}>
              <div
                style={{
                  width: 2,
                  height: major ? 36 : 18,
                  backgroundColor: major ? color.textMuted : color.lineStrong,
                }}
              />
              {major ? (
                <div
                  style={{
                    position: "absolute",
                    top: 52,
                    left: 0,
                    transform: "translateX(-50%)",
                    fontFamily: font.mono,
                    fontSize: label.fontSize,
                    letterSpacing: "0.04em",
                    color: color.textMuted,
                  }}
                >
                  {String(Math.round((x + 300) / TICK_GAP)).padStart(2, "0")}
                </div>
              ) : null}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: markerX - 3,
            top: RULER_Y - 96,
            width: 6,
            height: 96,
            backgroundColor: color.accent,
          }}
        />
      </Camera>
    </AbsoluteFill>
  );
};

/* Scene 3: ghost-text typewriter. The box is locked, so the second line never reflows. */
export const TypeScene: React.FC = () => {
  const { width } = useSafeArea();
  const t = frameType(width, "claim");
  return (
    <AbsoluteFill>
      <Background variant="grid" seed="tech-type" />
      <SafeArea justify="center" align="flex-start">
        <ShapeMask delay={14} revealFrames={20}>
          <div
            style={{
              width: vw(width, 5),
              height: 6,
              backgroundColor: color.accent,
              marginBottom: vw(width, 2.2),
            }}
          />
        </ShapeMask>
        <GhostType
          text={TYPED_LINE}
          fontSize={t.fontSize}
          lineHeight={t.lineHeight}
          letterSpacing={t.letterSpacing}
          fontWeight={t.fontWeight}
          delay={30}
          maxWidth={vw(width, 52)}
        />
      </SafeArea>
    </AbsoluteFill>
  );
};

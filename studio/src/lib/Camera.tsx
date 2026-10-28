import type React from "react";

type Props = {
  readonly children: React.ReactNode;
  /** World offset in px: positive x moves the world LEFT (the camera pans right). */
  readonly x?: number;
  readonly y?: number;
  readonly zoom?: number;
  /** Zoom origin in px from the top-left of the frame. Default: the centre. */
  readonly originX?: number;
  readonly originY?: number;
};

/**
 * Plain camera rig: translate, then scale a world. Every number comes from the caller, so pair
 * it with `speedCurve` (position from a speed table) and `logZoom` (zoom in log space).
 *
 * ```tsx
 * const cam = speedCurve(table, { fps, distance });
 * <Camera x={cam.position(frame)} zoom={logZoom(p, 1, 1.5)}>...</Camera>
 * ```
 */
export const Camera: React.FC<Props> = ({
  children,
  x = 0,
  y = 0,
  zoom = 1,
  originX,
  originY,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transformOrigin: `${originX === undefined ? "50%" : `${originX}px`} ${originY === undefined ? "50%" : `${originY}px`}`,
      transform: `scale(${zoom}) translate(${-x}px, ${-y}px)`,
    }}
  >
    {children}
  </div>
);

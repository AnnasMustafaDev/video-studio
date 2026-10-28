import type React from "react";
import { AbsoluteFill } from "remotion";
import { useSafeArea } from "./motion";

type Props = {
  readonly children: React.ReactNode;
  /** Vertical placement inside the safe area. */
  readonly justify?: "flex-start" | "center" | "flex-end" | "space-between";
  /** Horizontal placement inside the safe area. */
  readonly align?: "flex-start" | "center" | "flex-end" | "stretch";
  readonly gap?: number;
  readonly style?: React.CSSProperties;
};

/** Full-frame layout box padded by the safe margins of the current format. */
export const SafeArea: React.FC<Props> = ({
  children,
  justify = "center",
  align = "flex-start",
  gap = 0,
  style,
}) => {
  const { insets } = useSafeArea();
  return (
    <AbsoluteFill
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: align,
        gap,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

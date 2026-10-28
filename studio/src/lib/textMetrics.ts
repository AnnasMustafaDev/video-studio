/**
 * Text width in px, measured with a canvas at render time. Deterministic once the font is
 * loaded (fonts.ts blocks rendering until it is). Falls back to an estimate where no canvas
 * exists (Node, SSR), so it never throws. Used by FragmentChain to centre a growing line.
 */
let ctx: CanvasRenderingContext2D | null | undefined;

const getCtx = () => {
  if (ctx !== undefined) return ctx;
  ctx =
    typeof document === "undefined"
      ? null
      : document.createElement("canvas").getContext("2d");
  return ctx;
};

export const measureTextWidth = (
  text: string,
  { fontFamily, fontSize, fontWeight, letterSpacingEm = 0 }: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    letterSpacingEm?: number;
  },
) => {
  const c = getCtx();
  if (!c) return text.length * fontSize * (0.52 + letterSpacingEm);
  c.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return c.measureText(text).width + text.length * fontSize * letterSpacingEm;
};

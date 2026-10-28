import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * Two families only. Inter Tight for everything people read,
 * JetBrains Mono for small labels and code. Loading blocks rendering until ready.
 */
const sans = loadInterTight("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const mono = loadJetBrainsMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const font = {
  sans: sans.fontFamily,
  mono: mono.fontFamily,
} as const;

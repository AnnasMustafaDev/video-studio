# Visual design

## The premium look is flat, editorial and quiet

What reads as professional:

- **Real UI, flat and large**, inside a plain frame (window or phone: rounded corners, 1 px hairline, one long soft shadow tinted to the background). The UI is the hero, never a texture on a 3D slab.
- **One idea per frame**: a caption above the device that swaps with the voice; the device stays put.
- **Emotional palette shift**: the problem lives in the dark, the solution in the light; the end card is a full-bleed brand colour or the brand's dark.
- **Native overlays** copy the product's own components (its toast, chip, file card, notification), not invented chips floating in space.
- **Editorial proof list**: plain rows with one hairline above each, a large word and a short reference on the right.

What reads as cheap (avoid):

- Bevelled or clearcoat 3D buttons, tilted 3D "pages", depth of field on UI, lens flares, glows on components, particle bursts, RGB split, camera shake, bouncy easing.
- Div-built fake UIs; invented dashboards; placeholder data that looks real.
- Text over busy UI without a scrim; white type over white screens.
- Three equal cards in a row; eyebrows on every scene; numbered section labels.

## Type

- One family for display and UI text (weights 500/700/800 to 900), one mono for meta (status, file names, references, URLs).
- Display: tight tracking (-0.03 em), line height 1.0 to 1.05. Captions 72 to 80 px at 1080p; hero lines 120 to 190 px.
- Emphasis = colour or weight of the same family. Do not drop a serif word into a sans line unless the brand is genuinely editorial.
- Mono small caps for meta labels (letter-spacing 0.12 to 0.18 em), used sparingly.
- Italic descenders need line height 1.1 and a little bottom padding.

## Colour

- Brand neutral (dark) + brand light + **one accent**. The accent marks the one thing that matters in each frame (the active step, the number, the CTA).
- On light backgrounds use a darker shade of the accent for text (contrast); the bright accent is for fills and rules.
- Lock the palette across the whole film. A second highlight colour appears only if it means something (an error state).
- Dark scenes: a static radial light behind the stage (a slightly lighter shade of the background, never white haze), never following anything.
- No pure black or pure white surfaces; tint them.

## Shape and depth

- One radius scale, written down: e.g. surfaces 16 px, inline highlights 12 px, pills full.
- Depth from layering + one soft shadow; shadows tinted to the background hue.
- Spotlight focus: dim the rest of the screen (rgba of the dark at 0.4) with a 3 px accent outline on the region, radius 12.

## Layout (16:9, 1920×1080)

- Caption band at the top (y 80 to 200), content window below (e.g. 1400×788 at x 260, y 236). Left edges aligned.
- Keep 72 px margins for the brand bug; 120 px for important text.
- Vertical (1080×1920): bigger type, centre-weighted, caption above the phone, keep text out of the top 220 px and bottom 380 px (platform UI).

## Icons and assets

- One icon set, one stroke width. Monochrome icons in the ink colour; the active one turns accent.
- Logos as SVG. Screens at 1.5× or 2× the CSS size for sharp zooms.
- A clock, a calendar, a phone call can carry a human hook; draw them simply and consistently.

## End card

- Thin accent rule, small mono kicker, the name very large (mask reveal), one-line promise, the CTA as a solid accent chip, brand mark.
- Built word by word on the closing voice line; holds still for at least 2 s.

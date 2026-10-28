# 41 · Vocabulary cheat sheet

| | |
|---|---|
| **Purpose** | Give you the precise words that make Claude animate what you mean, plus a pasteable glossary so Claude uses the same meanings. |
| **Use when** | Writing a brief (`40`), giving feedback (`16`), or when Claude's motion is vague or robotic. |
| **Stage** | Reference, any stage. |
| **Inputs you must fill in** | None. Optionally paste the glossary block into a session. |
| **Expected output** | Shared vocabulary; Claude answers in these terms and with values. |
| **Next prompt** | Whatever you were doing. |

## The five core terms (notes §4, verbatim)

| Term | Definition | Prompt terms |
|---|---|---|
| **Kinetic typography** | Text itself becomes the animation: words slide, scale, split, rotate, reveal or change emphasis. Use this for high-impact hooks, title sequences and product statements. | word-by-word reveal, staggered text, per-character animation, masked reveal, tracking expansion |
| **Easing and spring physics** | Easing controls acceleration and deceleration. A spring adds a physically inspired response, potentially with overshoot. This is one of the biggest differences between robotic movement and polished motion. | ease-out, cubic-bezier, spring animation, subtle overshoot, settling motion, no linear movement unless intentional |
| **Staging and visual hierarchy** | Staging determines what the viewer notices first. Hierarchy controls which element has the greatest visual importance. Don't animate everything equally. | single focal point, negative space, foreground midground background, parallax, asymmetric composition, controlled visual hierarchy |
| **Transitions and match cuts** | A transition connects scenes. A match cut uses a shared shape, position, motion or idea to make the change feel continuous. | match cut, shape morph, directional wipe, camera-driven transition, overlapping transition, motivated cut |
| **Lighting, texture and depth** | These help flat graphics feel tactile or cinematic. Use them selectively; excessive glow, blur and grain can make a design look cheap rather than premium. | rim lighting, soft bloom, ambient occlusion, subtle film grain, depth of field, specular highlights |

## Extra precise terms

| Term | Means | Say it like this |
|---|---|---|
| **Anticipation** | A small opposite move before the main move, preparing the eye. | "dip 8 px down for 4 frames before rising" |
| **Follow-through** | Parts keep moving briefly after the main body stops (a tail, a shadow, a second line). | "underline finishes 6 frames after the word settles" |
| **Overlapping action** | Parts of one object start and stop at different times. | "icon leads, label follows 3 frames later" |
| **Overshoot** | Passing the target slightly before settling. | "spring, damping 14, stiffness 120, overshoot under 4 %" |
| **Settle** | The final decay into rest after overshoot. | "settles within 12 frames, no visible wobble after" |
| **Stagger** | Same animation on several items, offset in time. | "stagger 3 frames per word, left to right" |
| **Cascade** | A stagger whose offset or direction follows layout (rows, a grid diagonal). | "cascade from top-left, 2 frames per cell" |
| **Hold** | The element is completely still so the viewer can read. | "hold the number 60 frames before exit" |
| **Beat** | One idea or event on screen; the unit you time. | "one caption per beat, beats 1.2 to 2 s" |
| **Ease-in** | Starts slow, ends fast. For exits. | "exit with ease-in, 8 frames" |
| **Ease-out** | Starts fast, ends slow. For entrances. | "enter with ease-out, 15 frames" |
| **Ease-in-out** | Slow, fast, slow. For moves between two rest states. | "camera pan ease-in-out, 30 frames" |
| **Cubic-bezier** | Exact custom ease curve, four numbers. | "Easing.bezier(0.16, 1, 0.3, 1) (expo-out feel)" |
| **Linear** | Constant speed. Only for continuous motion (tickers, rotation, progress). | "linear only for the background drift" |
| **Parallax** | Layers move at different speeds by depth, implying 3D. | "background 0.3x, midground 0.6x, foreground 1x of the camera move" |
| **Match cut (shape)** | Cut where a shape in A becomes a similar shape in B. | "circle logo cuts to the circular dial" |
| **Match cut (position)** | The focal element sits at the same screen position across the cut. | "button centre at the same x, y in both shots" |
| **Match cut (motion)** | A movement continues in the same direction and speed across the cut. | "swipe left continues as the next scene's pan left" |
| **Match cut (idea)** | Concept carries over: "storm" to "inbox flood". | "the stack of papers becomes the stack of notifications" |
| **Shared element** | The same object physically travels and transforms into the next scene. | "the card scales up into the full document" |
| **Mask reveal** | Content appears through a moving clip shape. | "text revealed by a mask sliding up from the baseline" |
| **Directional wipe** | A moving edge replaces A with B. | "wipe right to left, matching the arrow" |
| **Motivated cut** | A cut justified by an action, a sound or a word. | "cut on the click", "cut on the downbeat" |
| **J-cut / L-cut** | Audio of the next scene starts early / audio of the last scene runs late. | "start the next scene's whoosh 6 frames before the cut" |
| **Focal point** | The one place the eye should be. | "one focal point per frame; dim everything else" |
| **Safe area** | Margin where text is guaranteed visible on every platform UI. | "keep text inside 90 % title safe; 9:16: out of top 220 px and bottom 380 px" |
| **Tracking** | Letter spacing across a word. | "tracking expands from -2 % to 4 % over 20 frames" |
| **Push in / pull out** | Camera moves closer / further. | "slow push in 1.0 to 1.08 over the scene" |
| **Motion blur** | Smear in the direction of fast movement. | "@remotion/motion-blur on the fast slide only" |

## Glossary block to paste

```text
Use these motion terms with these meanings and always answer with values (frames, px, spring config), not adjectives: anticipation, follow-through, overlapping action, overshoot, settle, stagger, cascade, hold, beat, ease-in (exits), ease-out (entrances), ease-in-out (moves between rests), cubic-bezier, linear (only for continuous motion), parallax, match cut (shape, position, motion, idea), shared element, mask reveal, directional wipe, motivated cut, J-cut, L-cut, focal point, safe area, tracking, push in, pull out, motion blur. When I use a vague word ("smooth", "premium", "pop", "cinematic"), translate it into these terms and tell me your translation.
```

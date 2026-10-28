# Motion vocabulary for directing

Knowing these terms lets you direct precisely. Use the prompt terms in briefs and storyboards.

| Term | What it is | Use it for | Prompt terms |
|---|---|---|---|
| **Kinetic typography** | Text itself is the animation: words slide, scale, split, rotate, reveal, change emphasis | Hooks, title sequences, product statements | word-by-word reveal, staggered text, per-character animation, masked reveal, tracking expansion |
| **Easing and springs** | Easing shapes acceleration; a spring adds a physical response, possibly with overshoot. The biggest difference between robotic and polished motion | Every move | ease-out, cubic-bezier, spring animation, subtle overshoot, settling motion, no linear movement unless intentional |
| **Staging and hierarchy** | Staging decides what the viewer notices first; hierarchy decides what matters most. Don't animate everything equally | Every frame | single focal point, negative space, foreground / midground / background, parallax, asymmetric composition, controlled hierarchy |
| **Transitions and match cuts** | A transition connects scenes; a match cut uses a shared shape, position, motion or idea so the change feels continuous | Scene changes | match cut, shape morph, directional wipe, camera-driven transition, overlapping transition, motivated cut |
| **Lighting, texture, depth** | Make flat graphics tactile or cinematic. Use selectively: too much glow, blur and grain look cheap | Hero moments, backgrounds | rim lighting, soft bloom, ambient occlusion, subtle film grain, depth of field, specular highlights |

## Animation principles worth naming

- **Anticipation:** a small move against the direction before the main move.
- **Follow-through and overlap:** parts settle at different times; the label lands after the card.
- **Overshoot and settle:** passes the target slightly, returns. Small for UI and type, larger for playful brands.
- **Stagger:** items start one after another (40 to 80 ms), or each on its spoken word.
- **Arcs:** natural moves curve; straight lines read mechanical.
- **Hold:** stillness so the viewer can read. A hold is a decision, not dead time.
- **Squash and stretch:** for characters and playful shapes; avoid on UI and type.

## Camera and transition words

push in / pull out, dolly, truck, crane, whip pan (both shots on screen), rack focus, parallax, screen-recorder zoom (content scales inside a fixed frame), flood (a shape grows past the corners to become the next scene), shared element (an object becomes the next scene), mask reveal, iris, hard cut on the beat, J-cut / L-cut (sound leads or trails the picture).

## Sound words

bed (music under everything), sting (short musical accent), riser (builds into a moment), impact / hit, whoosh (by its peak, on the move), UI click / tick, room tone, ducking (music dips under voice), silence as accent, -14 LUFS (web loudness).

## Frame-based reminder (for whoever builds it)

Every animation is a pure function of the frame: in Remotion `useCurrentFrame()`, `interpolate()`, `spring()`, `useVideoConfig()`; no CSS transitions, `requestAnimationFrame`, timers or unseeded randomness. Same frame in, same image out.

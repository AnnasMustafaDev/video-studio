# Inspiration: studio showreel (20 s)

Goal: a 20 s, hyper-professional motion-graphics showreel for video-studio (a studio for making motion graphics with Claude Code).

Retrieved 2026-10-28 from https://prompt-motion.com with `prompt-motion-search` (searches: "showreel", "kinetic type" + Kinetic type, "3D camera", "timeline", "product launch" + Product UI, "logo reveal" + Shapes). Prompts and videos belong to their authors. Nothing is copied here: each entry is summarised and linked; watch the video and read the full prompt on its page. "Says" = what the prompt states; "Infer" = our reading, not the author's words.

Selection rule: long, structured prompts (inputs / direction / structure / build / gotchas) over one-liners. The search returned many near-identical "make a dynamic 15-second showreel, go all out" one-liners; they were skipped because their quality came from the model and effort, not the words.

---

## 1. Orange dot motion system

- Source: https://prompt-motion.com/ultimaxbt-bbebf5 (watch the video there)
- Author: ultima (@ultimaxbt), original post: https://x.com/ultimaxbt/status/2107486052550062398
- Tags: Kinetic type, Shapes, Music · Type: Prompt · Model: Opus 5.5 · Effort: not listed · Posted: 2026-10-06
- Prompt: long and structured (inputs, direction, structure, build, gotchas, start).

Says: a 2D, 16:9, roughly 15 s film on a warm off-white / near-black palette with one orange accent; a single dot is the thread through every scene (UI toggle, dot over a letter, spring graph, growing shape, end card); the last frame matches the first so it loops. Bans motion "that isn't connected to an element already on screen". The graph is drawn from the same spring function that moves the dot. One shape morphs circle to rounded square to pill while keeping its position.

Infer / borrow: the strongest idea for a studio showreel. One recurring object (for us: a playhead or a keyframe diamond) carries the eye across every scene, so 20 s of different techniques reads as one piece instead of a sampler. Also: draw any curve from the same function that drives the motion, so "springs" and "easing" are proved, not illustrated.

## 2. Motion techniques showreel

- Source: https://prompt-motion.com/lukasersil-0ed38e (watch the video there)
- Author: Lukáš Eršil (@lukasersil), original post: https://x.com/lukasersil/status/2103742861971726495
- Tags: Kinetic type, Shapes, Particles · Type: Prompt · Model: Opus 5.5 · Effort: Max · Posted: 2026-09-26
- Prompt: one paragraph (about 740 characters), not structured; the only Max-effort entry of the five.

Says: a 15 s portfolio reel listing many techniques (kinetic type, 2D/3D, masking, compositing, lighting, depth, camera); every shot should transition naturally into the next; it should feel "meticulously art-directed rather than like a random collection of effects".

Infer / borrow: the brief names the main risk of any showreel, a list of effects with no direction. Its quality likely leans on Max effort. For us it is a checklist of technique beats to cover, not a structure; the structure comes from entry 1.

## 3. Landing page 3D scroll

- Source: https://prompt-motion.com/twoclipping-d89be5 (watch the video there)
- Author: zero (@twoclipping), original post: https://x.com/twoclipping/status/2110329502676951367
- Tags: Product UI, Kinetic type · Type: Prompt · Model: Opus 5.5 · Effort: not listed · Posted: 2026-10-14
- Prompt: very long and precise (about 6.6k characters) with a timestamped camera plan.

Says: a 14.5 s single continuous camera over a page lying on a studio floor, never a cut; the camera is driven from one speed curve integrated over time, not from position keys; thin depth of field keeps focus on whatever crosses frame centre; UI pieces lift and tilt toward the lens with height-dependent shadows; the move ends with a rise to overhead, a dive, and a title card. Bans cuts, crossfades, surges in the glide and zooming in then back out. Checks the preview with optical flow so speed never dips.

Infer / borrow: the camera discipline. For our "3D camera" beat, fly over the Remotion timeline or a studio composition as a flat object in space, with a speed curve instead of keyframes and lifted layers (clips, keyframes) standing up as the camera passes. Words with times in the title card (one word every 0.05 to 0.06 s, rising out of a small blur) give a precise end-card recipe.

## 4. Ora 2 image model launch film

- Source: https://prompt-motion.com/rossaxbt-3085b7 (watch the video there)
- Author: testarossa (@rossaxbt), original post: https://x.com/rossaxbt/status/2107845961691091295
- Tags: Product UI, Photos, Music · Type: Prompt · Model: Opus 5.5 · Effort: not listed · Posted: 2026-10-07
- Prompt: long and structured (inputs, script, voice, direction, structure, sound, build, gotchas).

Says: a 22 s square launch film timed to a voiceover and a music drop; a constant slow camera push per scene where the next scene starts at the zoom where the last one ended; "Nothing appears instantly" (eased fades of at least 0.3 s); image changes on 16th notes, scene changes on phrase starts, drop on the key line; one SFX per event placed by its measured peak; loudnorm to -14 LUFS; contact sheet and a single-frame-pop scan before showing anything.

Infer / borrow: the sound and QA rules, which fit our pipeline directly (hits table, measured peaks, -14 LUFS, contact sheet, pop scan). The zoom hand-off rule fixes a common defect: a camera that resets to 1.0 between scenes and snaps. We do not need the voice or glass parts for a 20 s reel.

## 5. Food craving launch film

- Source: https://prompt-motion.com/ultimaxbt-2ddf1e (watch the video there)
- Author: ultima (@ultimaxbt), original post: https://x.com/ultimaxbt/status/2108210884799549714
- Tags: Product UI, Kinetic type, Photos, Music · Type: Prompt · Model: Opus 5.5 · Effort: not listed · Posted: 2026-10-08
- Prompt: long and structured (inputs, direction, structure, build, gotchas, start).

Says: a 15 s, 32-beat film at 130 BPM, one continuous take where each scene grows from the last (text rises from a mask line, buttons expand into pages, colour floods from one object then shrinks into another); one eased camera move per scene, never zoom in and out back to back, no hold longer than 1 s; every hand-off is a shared element; a flood must reach the farthest corner in about 0.35 s or it reads as a flash; 8 motion-blur subframes, since 4 leave ghost copies.

Infer / borrow: the beat map (bars and beats first, then scenes on beats) and the shared-element transitions. For us: a Claude Code prompt line expands into the Remotion timeline, a clip on the timeline expands into the rendered frame. That tells the "studio" story without a single cut.

---

## Five rules we take into the brief

1. **One thread object.** A single recurring element (playhead or keyframe diamond, one accent colour) travels through every scene and ends where it began; no motion that is not attached to something already on screen. (from 1)
2. **No cuts: every transition is a shared element.** The outgoing object becomes the incoming scene (prompt line to timeline, clip to frame, flood from a dot that reaches the farthest corner in about 0.35 s). (from 5, 2)
3. **Camera from a speed curve, with continuous zoom.** One eased move per scene, never zoom in then out, each scene starts at the zoom the last one ended on; for the 3D beat, drive the camera from an integrated speed curve with thin depth of field. (from 3, 4, 5)
4. **Beat map before pixels.** Fix BPM and beats first; cuts on phrase starts, fast swaps on 16ths, nothing held over 1 s, nothing popping in faster than about 0.3 s except deliberate beat runs; one SFX per event placed by measured peak, -14 LUFS. (from 4, 5)
5. **Prove it with frames.** Draw curves from the same function that drives the motion; before the full render, show 4 to 8 stills and a beat map, then check a contact sheet, a single-frame-pop scan and 8 motion-blur subframes on fast moves. (from 1, 3, 4, 5)

What we do differently: 20 s instead of 15, our own palette and type from the studio tokens, Remotion (frame-based, deterministic) instead of a hand-written seek(t) HTML file, and content that shows this studio's own workflow rather than any author's product.

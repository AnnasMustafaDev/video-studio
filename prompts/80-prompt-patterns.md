# 80 · Prompt patterns cheat sheet

| | |
|---|---|
| **Purpose** | Fourteen reusable prompt skeletons from public examples, each with what it is for, a fill-in line, and who it came from. |
| **Use when** | You are writing a one-off prompt that no numbered file covers, or you want the shortest form of a pattern the numbered files already use. |
| **Stage** | Reference, any stage. |
| **Inputs you must fill in** | The `[brackets]` of the skeleton you pick. |
| **Expected output** | A short prompt you paste, plus knowing which numbered prompt carries the full version. |
| **Why this exists** | Collects the best patterns from three research passes in one page. Evidence differs per pattern and is marked: "shown" means a finished film exists with that prompt, "claimed" means only a post says so. None was verified by watching video. |
| **Next prompt** | The numbered prompt named in each row. |

All skeletons are our own wording of a structure; credit is to the person whose example showed it.

| # | Pattern | Evidence | Credit | Full version |
|---|---|---|---|---|
| 1 | Tagged brief | shown | @twoclipping, @ultimaxbt, @rossaxbt (prompt-motion.com) | 40 |
| 2 | Per-film Banned line | shown | @twoclipping, @ultimaxbt | 40 |
| 3 | Beat map header | shown | @twoclipping, @ultimaxbt | 75 |
| 4 | Hand-off line (A becomes B) | shown | @twoclipping, @ultimaxbt | 11 |
| 5 | Golden scene | claimed | u/Sangkwun (r/ClaudeAI) | 12, 14 |
| 6 | Plan first | claimed | u/TheHol1day (r/ClaudeAI) | 12, 14 |
| 7 | Define the word / outcome not values | claimed | u/TheHol1day, u/FerretVirtual8466 | 16 |
| 8 | Measure first, then fix | one first-hand write-up | Samuel Parks (RapidEye) | 15 |
| 9 | Independent verification critic | documented in a public repo | echris6 (motion-video-kit) | 13 |
| 10 | Idea, Device, Grammar | documented in a public repo | Leonxlnx (cinetic) | 19 |
| 11 | Delegation guide for parallel agents | shown in finished videos | JohnHeibel (PDoomVideo) | 18 |
| 12 | System trace | claimed | u/FerretVirtual8466 | 71 |
| 13 | Breaking point | claimed | u/SadNose6889, u/AmberMonsoon_ | 63, 62 |
| 14 | Honest capability clause | claimed | @twoclipping | 00, 40 |

## Skeletons

**1. Tagged brief.** For: turning "a film" into a contract with an approval stop before code.
```text
<inputs> what to ask me for; defaults if skipped </inputs>
<direction> look, type, one accent, motion. Banned: [per-film list] </direction>
<structure> timed scenes or beat ranges; transitions as "A becomes B" </structure>
<build> numbered rules </build>  <gotchas> known failures </gotchas>
<start> ask for inputs, then show the beat map and [N] named stills; no code yet </start>
```

**2. Per-film Banned line.** For: removing the model's defaults (fade, glow, particle burst) where "AI look" comes from.
```text
Banned: crossfades, blur-ins, [x], [y], holds longer than [1 s], anything that looks like a template.
```

**3. Beat map header.** For: music-led pieces where sync is planned, not patched.
```text
[BPM] BPM, [N] beats, start the song [k] beats before its drop. Beats 0-[a]: [event]. Beat [b] (the drop): [event]. Last frame equals first frame.
```

**4. Hand-off line.** For: no cut, no fade between scenes.
```text
Scene [N] is made out of scene [N-1]: [outgoing object] becomes [incoming object], carrying [label/words/colour]. No fade, no cut.
```

**5. Golden scene.** For: making scene 2..N match scene 1 by example, not description.
```text
Here is an approved scene. Build scene [N] in the same structure (beat mapping, stagger, entrance style), changing only the content, and list what you copied.
```

**6. Plan first.** For: stopping silent rework.
```text
Before any code, tell me in five lines what you will build for scene [N], what you will not touch, and the one thing most likely to go wrong.
```

**7. Define the word / outcome, not values.** For: keeping "punchier" meaning the same thing in every round.
```text
For this video "[word]" means: [frame counts, scale event, cut type]. Apply it to scene [N] only and show the diff.
Result must satisfy: [measurable condition on a still]. Choose the implementation and tell me the values you picked.
```

**8. Measure first, then fix.** For: motion that pauses, snaps or stalls.
```text
This move [pauses/snaps] around [time]. Do not try another fix. Plot value and velocity over the move, show me where velocity is zero, then fix the cause.
```

**9. Independent verification critic.** For: a fresh judge on round 2 and later.
```text
You did not build this. Artifact: [path]. Previous report: [path]. Mark each earlier top fix FIXED, PARTLY or STILL PRESENT with timestamps, hunt for regressions, then list new defects. End with SHIP or ONE MORE PASS (at most three fixes).
```

**10. Idea, Device, Grammar.** For: a point of view before a style.
```text
Idea: [8 words max]. Device: [one object carried through every shot]. Grammar: [one rule the form obeys]. Could a competitor's film say this? Only then choose techniques.
```

**11. Delegation guide.** For: parallel agents that must not drift or collide.
```text
Canvas and safe zones; helper API, one line each; style rules; per-frame budget; every shot a pure function of the frame, seeded randomness only; edit only your own file and report shared bugs; self-check command that renders a labelled sheet.
```

**12. System trace.** For: auditing a studio instead of a video.
```text
Describe a video type we have never made. Trace step by step what this studio would do. List every doc promise that does not exist and every default that would leak in.
```

**13. Breaking point.** For: explainers and data stories with a hook.
```text
Show [N] steps where [one quantity] builds; at step [N] it fails with a visible change. Single screen, loopable, minimal interface; input, visible transformation, output.
```

**14. Honest capability clause.** For: preventing a false "done".
```text
If you cannot run code or view images here, say so first; do not describe results you have not seen.
```

## Studio additions

```text
Patterns considered and not kept: the fixed-output style brief with named benchmark studios (the long form is 40 plus 10; the named-studio bar adds little), few-shot voice (we use local Kokoro and write scripts ourselves), the constraint-for-sync talking-head brief (we do not edit raw footage). Credits are to the people named; the words are ours.
```

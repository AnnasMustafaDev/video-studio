# 73 · Pacing and tension review

| | |
|---|---|
| **Purpose** | Catch even rhythm, tensionless motion and wasted scenes, using numbers as reference rather than pass/fail laws. |
| **Use when** | After the first full assembly and again before `53`, as a complement to `13`. Best as a fresh agent that did not build the film. |
| **Stage** | Review. |
| **Inputs you must fill in** | `[CompId]`, `[storyboard path]`, `[film length and type]`. |
| **Expected output** | A table of measured pacing figures, the three flags that matter most, and cut/keep verdicts per scene. |
| **Why this exists** | Both a polish-rules thread and its critics reported the same fault: even easing and long fades give a ride with no tension. Evidence: the fault is widely reported (several Reddit threads); the pacing numbers are one repo author's own measurements of films we cannot see, so they are reference points only. Findings F-C5, F-A13. |
| **Next prompt** | `15` or `16` for fixes, then `13` again. |

## Prompt

```text
Review the pacing of [CompId] ([type], [length]). You did not build it. Work from rendered frames, the storyboard and frame numbers; if you could not look at the stills, say so.

1. Measure and list: duration of every shot and transition (frames); the longest still stretch; time to first readable word; time to the product or main subject on screen; where the energy peaks and where it lulls.
2. Variety check: name the one hardest cut and the one fastest fade. If every transition has the same duration or the same easing, flag it. Flag two scenes in a row with the same typographic action.
3. Earned stillness: is there one held beat (about 1 to 1.6 s as a reference) on the key claim, followed by the biggest move? Spend stillness once; flag stillness used everywhere.
4. Earns-its-place test: for each scene, what is lost if it is cut? Any scene that does not earn its place within about 3 s is a cut candidate.
5. Sound restraint: effects only at structural moments, not on every move.
6. Reference norms (guides, not gates; the source's numbers): median shot about 1.5 s, a new visual beat about every 0.7 to 1 s, first frame already moving, two energy peaks with a lull near 65 percent and the biggest peak near 82 percent, end card about 2 s, accent colour about 5 percent of pixels. Say where the film departs and whether the departure looks deliberate.
Top three flags with frame evidence and one concrete fix each. Do not recommend crossfading every cut or one easing curve everywhere.
```

## Studio additions

```text
Write the table into projects/[yyyy-mm-dd]-[slug]/review.md. Sources: Leonxlnx's cinetic (craft-rules.md) for the norms; the tension critique from u/Top_Commission_8567's thread and its critics (r/ClaudeAI). Our wording.
```

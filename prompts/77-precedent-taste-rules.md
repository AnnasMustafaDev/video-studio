# 77 · Precedent taste rules (rule, case, self-check)

| | |
|---|---|
| **Purpose** | Check a draft against short taste rules that each came from real rework, so avoidable review rounds are skipped. Also the format for adding your own rules after a post-mortem. |
| **Use when** | Before `13` on any draft, and when writing a lesson in `70`. |
| **Stage** | Review, light pre-pass. |
| **Inputs you must fill in** | `[CompId]`, `[stills or contact sheet]`. |
| **Expected output** | Each rule answered pass, fail or not applicable with a frame, and a list of new rules in rule/case/self-check form to propose. |
| **Why this exists** | Each rule cites a defect a reviewer repeatedly sent back. Evidence: first-hand but from one author's product-video projects; no film seen by us. Merge with `learnings.md`, do not duplicate. Finding F-A12. |
| **Next prompt** | `13-quality-review.md`. |

## Prompt

```text
Check [CompId] against these rules, one line each: pass, fail or n/a, with the frame number. If you could not look at stills, say so.

1. Wordmark or logo is held a full second. Self-check: how many frames is it settled?
2. Batch entrances accelerate, never move at constant speed, and end with about half a second of rest. Self-check: are the spacing steps between items increasing?
3. First drafts are almost always too fast: is any beat shorter than a viewer can read? Default one notch slower.
4. No handheld shake in bright UI films.
5. At most one sheen or glint per hero element, clipped to its corner radius.
6. Sharp text inside a 3D perspective needs high-resolution rasterising (fix with layout-level zoom, not by blaming depth of field).
7. Last beat: no small source or disclaimer text unless it stays 2.5 s or more at half opacity or higher.
8. Fade length: no fade under 0.3 s unless intended; a 0.05 s fade reads as a pop.
9. A highlight box behind a word reads as a text selection: is that intended?
10. Camera hand-off: does each scene start at the zoom the last ended on?
Then propose up to 3 new rules from what you saw, each as: Rule, Case (the defect that produced it), Self-check question.
```

## Studio additions

```text
Approved new rules go to skills/motion-studio/references/learnings.md as technique-only lines (see 70). Rules 1 to 7 follow Vincentwei1021's video-shotcraft (aesthetic-rules.md) and anything2explainer (lessons.md); 8 to 10 follow the prompt-motion.com gotchas of @twoclipping and @rossaxbt. Our wording.
```

# Director review of the plan (Round 0)

Before anyone writes code, review the brief and storyboard like a strict creative director. Changing a table costs a minute; re-animating a scene costs an hour. Best run by a subagent that did not write the storyboard.

## Check

1. **Message:** can you say the one thing to remember after reading only the exact text column? Does the hook land in the first 2 s and frame 0 already carry the message?
2. **Arc:** hook, development, payoff, ending. Does each scene's purpose move the story, or could it be cut?
3. **Focal points:** exactly one per scene; the exact text supports it.
4. **Repetition:** same layout, motion or trick used twice without reason (check every `REPEAT?` flag and look for unflagged ones).
5. **Pacing:** gaps over 4 s without a new event; holds long enough to read (0.3 s per word + 0.5 s; numbers and CTA 1.5 to 2 s); showpieces limited to 2 or 3.
6. **Motion precision:** every animation names direction, distance, duration, easing and trigger. Flag any adjective without numbers ("smooth", "dynamic", "cinematic").
7. **Transitions:** each is motivated and says what carries across; no transition for its own sake; no cross-dissolve between unrelated shots.
8. **Consistency:** one palette, one type family (plus mono), one radius scale, shared components; one accent with a meaning.
9. **Sound:** hits table complete; every hit is a real visual event; music sections change where the story changes; silence placed on purpose.
10. **Honesty and feasibility:** no invented numbers; illustrative visuals marked; every asset exists or is listed as missing; anything needing 3D, footage or compositing is called out.
11. **Formats:** each extra aspect ratio composed for its shape; text out of platform UI zones (9:16: top 220 px, bottom 380 px).

## Output (append to `review.md`)

```markdown
## Round 0: plan review, <date>
Top 5 defects (most consequential first):
1. [scene 3, 4.0-6.5 s] WHAT -> WHY it hurts -> FIX (exact change to the storyboard row)
2. ...
Flags resolved: ...
Verdict: FIX AND RE-REVIEW | READY FOR APPROVAL
```

Then apply the fixes to `storyboard.md` and present it to the user for approval. Do not hand over to a builder before the user approves.

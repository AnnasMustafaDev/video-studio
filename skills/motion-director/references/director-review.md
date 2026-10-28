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

## Added checks (research round)

12. **Banned list:** the brief has a film-specific `Banned for this film` line; the storyboard breaks none of it, and any lifted ban says where and why.
13. **Concept:** Idea, Device and Grammar are filled and pass the deletion test; the device does not drop out at a scene seam.
14. **Hand-offs:** every transition reads "X becomes Y" (or "hard cut, page already set"); no two scenes use the same morph without a flag.
15. **Earns its place:** each scene justifies itself within about 3 seconds or is cut. If every transition has the same duration the rhythm will be even and tensionless: name the one hard cut and the one fast fade.
16. **Criteria:** the glossary and acceptance criteria exist and are measurable.
17. **Optional critic for a risky scene:** a fresh agent that did not write the plan lists its five weakest decisions and the cheapest check for each before anything renders.
Why: reviewing a plan before spending render time was reached independently by two builders (claimed); the earns-its-place test answers the most reported fault of AI motion, even rhythm.

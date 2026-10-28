# Build loop: golden scene, plan check, commits, acceptance criteria

Engine-agnostic method for building scenes 2 to N without style drift or regressions. Remotion specifics are in `~/.claude/skills/remotion-studio/references/phases.md`.

## 1. Plan check before code (five lines)

Before coding scene N the builder writes, in `notes.md`: what it will build, what it will not touch, the one thing most likely to go wrong, the stills it will show first, and the acceptance criteria it is aiming at (section 4).
Why: it catches misreadings while they cost a sentence. Evidence: claimed by two builders (F-C7); cheap to test.
For a risky scene (new technique, dense, a hard transition) a fresh subagent that did not write the plan lists its five weakest decisions and the cheapest check for each, before anything renders. Optional: skip for simple scenes.

## 2. The golden scene

After scene 1 passes review it is the **golden scene**: the working example for scenes 2 to N and for the next film of the same type. The builder is given its source (not a description) and told: "Build scene N in the same structure (beat mapping, stagger, entrance style), change only the content, and list what you copied."
Why: text-only prompts yield generic fades and slide-ups; showing a working component makes the model follow the pattern. It is the standard few-shot principle. Evidence: only claimed (F-C1), costs almost nothing to test.
Rules: one golden scene per film, named in `notes.md` with its path; each scene still gets its own typographic action (learnings: one entrance curve reused becomes a template), so "same structure" means timing mapping and code shape, not the same move. A scene that proves itself twice is promoted to the library.

## 3. Commit per approved scene, read the diff

- One local commit per approved scene (never push). The commit is the rollback point.
- On every revision pass: show `git diff --stat`, name anything that changed outside the request, re-render the previous approved stills of that scene and compare before and after.
- Keep a decision log in `notes.md` ("scene 3 hold is 45 f because of the voice line") so a long session does not depend on memory.
Why: an "improvement" sometimes removes something that was right; a scene rebuilt from scratch on day two and removing one scene shifting all later timing were the reported failures. Evidence: first-hand experience (F-C2), not measured.

## 4. Acceptance criteria and glossary

- State outcomes with thresholds, checkable on a still: "title block no closer than 120 px to any edge", "focal point alone for at least 45 frames", "headroom under 20 percent". The builder picks the values and reports which it chose.
- Before the first revision round, define every vague word in motion terms once per film in `glossary.md` ("punchy = entrances at most 10 frames, one scale event per scene, hard cut into the next"). Revision prompts cite the glossary, so round 3 means what round 1 meant.
- Templates: `~/.claude/skills/motion-director/templates/acceptance.md` and `glossary.md`.
Why: exact CSS values were misread and "make it better" did not work for two independent builders. Evidence: claimed, consistent (F-C6).

## 5. Start gate

Before any code on a new film: show the beat map (music-led) or the line-to-visual map (voice-led) and N named stills (4 to 8, scene and timestamp). Build only after that. If you cannot run code or view images here, say so first and do not describe results you have not seen.
Why: the approval stop is cheapest before code. Evidence: the same gate recurs in five finished films by two authors (F-B1); capability line only claimed (F-B14).

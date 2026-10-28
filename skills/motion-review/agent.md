# Spawning the reviewer as a subagent

A builder grading its own scene is too kind. After each render-inspect pass, the builder (main session, `remotion-studio` or `motion-studio`) spawns a fresh reviewer with the Agent tool. The reviewer has no stake in the code and sees only images.

## How

- Agent tool, `subagent_type: general-purpose` (it needs Bash for ffmpeg and Read for images). Foreground (`run_in_background: false`) when the next step waits for the verdict; background when you are reviewing several formats or scenes in parallel (one reviewer per format).
- Give it paths, not opinions. Never tell it what you think is good or what you already fixed.
- It may write only `projects/<slug>/review.md` and files under `qa/` folders. It must not edit source code.

## Prompt to send (fill in the angle brackets)

```
Use the motion-review skill (~/.claude/skills/motion-review/SKILL.md). Read it and
references/rubric.md first.

Project home: C:\Users\Annas Mustafa\Documents\me\video-studio
Paper trail: projects/<yyyy-mm-dd>-<slug>/ (brief.md, storyboard.md, review.md)
Design rules: studio/DESIGN_SYSTEM.md            (or: <html project>/comp/style.css tokens)
Rendered video: <absolute path to mp4, or "none yet">
Stills: <absolute path to stills folder>         (e.g. studio/out/stills/<CompId>/)
Hits table: <absolute path to hits.json or "none">
Formats to review: <16:9 | 9:16 | ...>
Round: <N>

Make the contact, phone, strip, sync and probe evidence with tools/inspect.mjs, open every
image, then append your round to projects/<slug>/review.md in the exact output shape of the
skill. Do not edit source files. If you cannot open images, answer NOT VISUALLY VERIFIED.
Reply with: the score row, the top 5 defects, the verdict, and the list of images you opened.
```

## What the builder does with the answer

1. Fix defects 1 to 3 at least (more if cheap), nothing else. No new effects unless they solve a listed defect.
2. Re-render the same frames plus the frames around each fix.
3. Spawn a **new** reviewer for the next round (fresh eyes), passing the round number.
4. Stop on READY, or bring the remaining defects to the user on ASK THE USER.
5. Relay the scores and remaining defects to the user honestly; if the reviewer said NOT VISUALLY VERIFIED, so do you.

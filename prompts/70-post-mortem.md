# 70 · Post-mortem and learnings

| | |
|---|---|
| **Purpose** | Capture what worked, what failed and what to do differently, and feed technique lessons back into the skill. |
| **Use when** | After every delivered video and after each learning-plan day. |
| **Stage** | Last step of every project. |
| **Inputs you must fill in** | `[slug]`, `[what you personally liked and disliked]`, `[viewer reactions or numbers, if any]`. |
| **Expected output** | `notes.md` filled in (what changed between drafts and why), 3 to 7 technique-only lessons appended to the learnings log, suggested updates to prompts or the design system. |
| **Next prompt** | `31-componentize-project.md` if not done. Next video: `00-master-workflow.md`. |

## Prompt

```text
Run a post-mortem on the video [slug]. Read its brief, directions, storyboard, review log, the final delivery report and the git history of the video folder.

1. What changed between the first draft and the final, and why. Which review findings came up more than once?
2. What worked: decisions that made it look intentional (be specific: values, components, transitions).
3. What failed or cost the most time: defects that slipped through, prompts that produced generic output, steps I had to repeat. Root cause for each.
4. My own view: [likes and dislikes]. Viewer reactions or numbers: [reactions].
5. Lessons: write 3 to 7 technique-only lessons (no client, product or brand names), each one line, actionable next time ("Do X because Y"). Mark which section they belong to: direction and taste, process, motion, voice, music and sound, rendering and tooling, data honesty.
6. Suggest concrete edits to the prompt library, the design system or the tokens, if a lesson should become a default. Do not apply them without my approval.
```

## Studio additions

```text
Write sections 1 to 4 to projects/[yyyy-mm-dd]-[slug]/notes.md under "Post-mortem". Append the approved lessons to skills/motion-studio/references/learnings.md under the matching section, newest at the bottom, then run node tools/install-skills.mjs. Commit locally; do not push.
```

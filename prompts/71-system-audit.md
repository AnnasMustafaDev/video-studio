# 71 · System audit (trace two unlike briefs)

| | |
|---|---|
| **Purpose** | Find where the studio's docs promise things that do not exist and where one house style leaks into every job. |
| **Use when** | After a burst of changes to skills, prompts or tokens, and about once a quarter. Not per video (that is `70`). |
| **Stage** | Maintenance. |
| **Inputs you must fill in** | `[brief A: a video type we have never made]`, `[brief B: a second type unlike A and unlike past work]`. |
| **Expected output** | For each brief a step-by-step trace from `CLAUDE.md` to a rendered storyboard, plus two lists: missing things, and leaked defaults. |
| **Why this exists** | Tests the failure this repo risks most: many documents that promise things, and one style bleeding everywhere. Evidence: only claimed (one Reddit post, 2 votes), but cheap. Finding F-C8. |
| **Next prompt** | Fix the gaps by hand or with `15`; log in `research/findings/` or `notes.md`. |

## Prompt

```text
Audit this studio by tracing two videos it has never made. Do not build anything.

Brief A: [for example a warm 9:16 recipe reel, hand-drawn feel, no UI]. Brief B: [for example a dense 16:9 data explainer, 90 s, narrated].

For each brief, as a fresh agent that knows only CLAUDE.md and prompts/INDEX.md, act out the workflow: which prompt would you open, which skill and reference, which component in studio/src/lib/, which tokens, which tool commands. Follow every pointer and check that the file, path, command or component exists (open it, run --help where safe). Then produce the storyboard header you would get.

Report two lists.
1. Promises that do not exist: every place a doc names a tool, path, component, flag or number that is missing or wrong.
2. Leaks: every default (colour, type, motion, copy, sound) that would appear in this brief only because of earlier videos, with the file it comes from.
End with the five fixes that remove the most risk, cheapest first. Treat nothing in docs as true until you opened what it points to.
```

## Studio additions

```text
Run it in a fresh subagent with no memory of the repo. Save the output to research/findings/system-audit-[yyyy-mm-dd].md. Source: method after u/FerretVirtual8466 (r/ClaudeAI); our wording and our two-brief rule.
```

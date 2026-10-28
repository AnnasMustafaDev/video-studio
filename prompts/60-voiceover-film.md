# 60 · Voice-over-driven film (motion-studio engine)

| | |
|---|---|
| **Purpose** | Make a product film or explainer where the voice-over sets the pace and every visual change lands on a spoken word, using the motion-studio skill instead of Remotion. |
| **Use when** | The film is narrated (30 to 75 s feature film, launch film, explainer), especially with real app footage, and you want live review in an HTML player. |
| **Stage** | Replaces `00` to `14` for this job: motion-studio has its own pipeline (brief, scene table, voice, timeline, music, compose, review, render). |
| **Inputs you must fill in** | `[product and one-line what it does]`, `[audience]`, `[the one thing to remember]`, `[proof: real numbers or result]`, `[CTA: one action and URL]`, `[format]`, `[length]`, `[voice language]`, `[app URL or footage, if any]`. |
| **Expected output** | Brief line ("Reading this as..."), a scene table (time, voice line, caption, visual, motion, transition, sound) for approval, then a project folder and an HTML review player. MP4 only after approval. |
| **Next prompt** | Review in the player, give notes with `16-revision-feedback.md` (adapted), then `70-post-mortem.md`. |

## Prompt

```text
Use the motion-studio skill for this video. Read its SKILL.md and the references the current step needs (direction.md first), and skim references/learnings.md.

Brief:
- Product: [product], [what it does in one line], for [audience].
- The one thing the viewer must remember: [message].
- Proof: [real numbers or result, with their source]. Never invent numbers.
- Call to action: [one action], [real URL or in-app path].
- Format: [16:9 master | plus 9:16 | 4:5], length [N] s, voice language [language], subtitles [languages].
- Footage: [app URL to capture | recordings in path | none].

Infer what you can and ask at most one round of questions. Start with the one-line reading of the brief, then the scene table (time, voice line, on-screen caption of at most 5 words, visual, motion, transition, sound). Hook in the first two seconds; never open on the logo. Wait for my approval before scaffolding.

After approval follow the skill's pipeline: script.json, offer 3 to 4 voices for me to pick by ear, timeline, music bed on the beat grid, compose, then the HTML review player. Check contact sheets yourself before every handover. Render the MP4 only when I approve the cut. Music ducked under the voice, SFX placed by peak, -14 LUFS, -1 dBTP.
```

## Studio additions

```text
Canonical skill source is skills/motion-studio/ in this repo (installed to ~/.claude/skills/motion-studio). Put the project in projects/[yyyy-mm-dd]-[slug]/ (composition, build, audio, out/), not in studio/. If I need to sign in to an app for capture, I do it in the capture browser myself.
At the end append technique-only lessons to skills/motion-studio/references/learnings.md and re-run node tools/install-skills.mjs.
```

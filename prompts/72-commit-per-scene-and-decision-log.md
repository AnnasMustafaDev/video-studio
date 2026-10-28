# 72 · Commit per scene and decision log

| | |
|---|---|
| **Purpose** | Protect approved work from "improvements" that quietly remove it, and keep long sessions from depending on memory. |
| **Use when** | After every approved scene and after every revision pass, in any video longer than two scenes. |
| **Stage** | Build and revise loop (small ritual, runs between `13`, `14`, `15`, `16`). |
| **Inputs you must fill in** | `[slug]`, `[scene or revision just approved]`. |
| **Expected output** | One local commit, a diff summary that names anything outside the request, before/after stills of the approved scene, and one line per decision in `notes.md`. |
| **Why this exists** | A rebuild from scratch on day two and a removed scene that shifted all later timing were real losses in one builder's long project. Evidence: only claimed (one detailed Reddit post and a corroborating reply). Finding F-C2. |
| **Next prompt** | Back to `14` or `13`. |

## Prompt

```text
Scene [N] / revision [n] of [slug] is approved. Do the checkpoint:

1. git diff --stat for the video folder. List every file changed, and name anything that changed outside what was requested. If something changed that I did not ask for, stop and tell me.
2. Re-render the previously approved stills of this scene (and one frame of every scene that uses a shared component you touched) and compare with the approved versions. Say what is identical and what moved.
3. Commit locally with a Conventional Commit message: feat([slug]): scene [N] approved, or fix([slug]): [what]. One logical change per commit. Do not push.
4. Append decisions to projects/[yyyy-mm-dd]-[slug]/notes.md, one line each, with the reason: for example "scene 3 hold is 45 f because the voice line ends at f 41".
```

## Studio additions

```text
Never push or create a GitHub repo (CLAUDE.md rule 6). Source: process after u/TheHol1day and u/darrirl (r/ClaudeAI). Our wording.
```

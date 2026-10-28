# 21 · Find inspiration on prompt-motion

| | |
|---|---|
| **Purpose** | Find a motion video made with Claude on prompt-motion.com that is close to what you want, see the exact prompt, model and effort behind it, and turn the one you pick into a real brief, with credit to its author. |
| **Use when** | You do not know how to phrase the request, want to see what a prompt like yours produced, or ask "what prompt made X" / "show me animations like ...". |
| **Stage** | Before the brief (`40`), or as the reference step in place of a downloaded reel (`20`). |
| **Inputs you must fill in** | `[what the video should do, in one line]`, `[keywords: subject words likely in a title]`, `[tags: Product UI, Phone, Charts, Diagrams, Kinetic type, Shapes, Particles, Characters, Photos, Music, Code]`, `[project folder: projects/yyyy-mm-dd-slug]`. |
| **Expected output** | 3 to 5 matches (title, tags, author with link, model, effort, prompt, page URL to watch), your pick saved with credit in `inspiration.md`, then a 10-ingredient `brief.md` that adds every decision the original prompt left to the model. |
| **Next prompt** | `40-brief-template.md` (if not already written by this step), then `10-creative-directions.md` or `20-reference-analysis.md`, then `11-storyboard.md`. |

The prompts on prompt-motion.com belong to their authors. Use one as a reference, always credit and link it, and never mirror the gallery into this repo (its robots.txt allows search and reference use, not training; `/api/` is off limits).

## Prompt

```text
Find inspiration on prompt-motion.com for this video: [what the video should do, in one line].

1. Turn my goal into 2 to 4 keywords [keywords] and up to 2 gallery tags [tags]. Run the prompt-motion-search skill's search and show me 3 to 5 matches. For each: title, tags, author (@handle and a link to the original post), model and effort, the prompt (key lines if it is long), and the page URL where I can watch the video. Say which prompts are one-liners.
2. Stop and let me pick one (or search again with other words).
3. Save my pick with full credit (author, handle, original post, page URL, retrieved date, verbatim prompt) and 2 to 5 bullets on what we take from it and what we change, in [project folder]/inspiration.md. Save nothing I did not pick.
4. Rewrite it into a brief on the 10 ingredients (purpose, format, art direction, composition, typography, movement, timing, transitions, audio, quality constraints). Many gallery prompts are one-liners whose quality came from the model and effort, not the words, so fill every decision the prompt left open from what the video shows and from my goal, and list your assumptions. Write [project folder]/brief.md.
5. Do not build anything yet. Next step is creative directions or a storyboard.
```

## Studio additions

```text
Tools (Node 18+, in skills/prompt-motion-search/tools/ or ~/.claude/skills/prompt-motion-search/tools/):
  node search.mjs "[keywords]" --tag "[tag]" --limit 5      (add --json for fields, --refresh to rebuild the 24 h index)
  node show.mjs https://prompt-motion.com/[slug]             (one entry, e.g. when I paste a link)
Search matches titles, tags and author handles, not prompt text; use subject words. Index cache lives in ~/.cache/prompt-motion-search/ and holds no prompt bodies. Hand the brief to the motion-director skill; build in studio/ (Remotion) or with motion-studio for narrated films.
```

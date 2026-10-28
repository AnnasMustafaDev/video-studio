---
name: prompt-motion-search
description: "Find inspiration on prompt-motion.com, a gallery of about 250 motion videos made with Claude, each with the exact prompt (or skill), model, effort, author and the video. Searches by keywords and gallery tags (Product UI, Phone, Charts, Diagrams, Kinetic type, Shapes, Particles, Characters, Photos, Music, Code), shows 3 to 5 matches with full prompt and credit, saves the chosen one with credit into the video's projects/<date>-<slug>/inspiration.md, then rewrites it into a proper 10-ingredient brief for motion-director. Use when the user says 'find a prompt / inspiration on prompt-motion', 'what prompt made X', 'show me animations like ...', 'find me a kinetic type / product UI / chart example made with Claude', or pastes a prompt-motion.com link."
version: 0.1.0
---

# Prompt-motion search

Find a motion video on https://prompt-motion.com that is close to what the user wants, show the prompt behind it with credit, and turn the chosen one into a real brief. You find and adapt ideas; you do not copy anyone's video.

## Home

All personal animation and motion-graphics work lives in `{{VIDEO_STUDIO}}` (call it `$VS`). Read `$VS\CLAUDE.md` and `$VS\prompts\INDEX.md` first. The human-facing version of this skill is `$VS\prompts\21-find-inspiration-prompt-motion.md`.

Tools (Node 18+, no dependencies), in this skill's `tools/` folder (installed copy: `~/.claude/skills/prompt-motion-search/tools/`):

```bash
node tools/search.mjs "<query>" [--tag "Kinetic type"]... [--limit 5] [--json] [--refresh]
node tools/show.mjs <https://prompt-motion.com/<slug> | slug> [--json]
```

`search.mjs` builds an index of titles, tags, type and author handles from the home page (it embeds every gallery card) cross-checked with `sitemap.xml`, caches it for 24 h, scores the matches, then fetches only the top `--limit` pages for the prompt text. `show.mjs` prints one page. Both print title, tags, type (Prompt / Skill), author with handle and original post, model, effort, posted date, page URL and the full prompt (plus the site's English translation when the prompt is in another language, and the install line for Skill entries). `--json` gives the same fields for scripting.

## Site rules (non-negotiable)

robots.txt says `Content-Signal: search=yes, ai-train=no, use=reference` and `Disallow: /api/`. So:

- Fetch **on demand only**, for a search the user asked for. Never call `/api/`, never crawl the whole site, never mirror the catalogue or prompt bodies into the repo. The tools enforce this: one request per second, at most 10 page fetches per run, and `/api/` and other hosts are refused.
- The cache (`~/.cache/prompt-motion-search/index.json`, outside the repo; override with `PROMPT_MOTION_CACHE`) holds titles, tags, URLs, handles and dates only, never prompt text. `--refresh` forces a rebuild before the 24 h TTL.
- Prompts and videos **belong to their authors**. Every time you show or save a prompt, name the author, their handle and link the original post and the gallery page. Only the one prompt the user picked goes into the repo, with that credit.
- Use a prompt as a reference to learn from and adapt. Do not reproduce someone's video shot for shot or present their prompt as the user's own.

## Workflow

1. **Goal to query.** Restate what the user is after in one line. Turn it into 2 to 4 keywords (subject words that might be in a title: "showreel", "dashboard", "launch", "logo", "terminal") and 0 to 2 tags. Tag words map automatically (e.g. "typography" to Kinetic type, "graph" to Charts, "mobile" to Phone), so pass a `--tag` only when it is a hard requirement.
2. **Search.** Run `search.mjs` with `--limit 5`. Too few hits: drop a word or a tag. Too generic: add a tag. "What prompt made X" with a link: use `show.mjs` directly.
3. **Show 3 to 5 matches.** For each: title, tags, author (@handle, original post link), model and effort, the prompt (shortened to the key lines if it is very long, with "full prompt on the page"), and the page URL to **watch the video** there. Say plainly which ones are one-line prompts. Then ask the user to pick one (or to search again). Stop here until they pick.
4. **Save the pick with credit.** Find the current video's paper-trail folder `$VS\projects\<yyyy-mm-dd>-<slug>\` (create it if the user has started a new video; ask for the slug if it is unclear). Write `inspiration.md` there:

   ```markdown
   # Inspiration: <title>

   - Source: <gallery page URL> (watch the video there)
   - Author: <name> (@<handle>), original post: <post URL>
   - Tags: <tags> · Type: <Prompt|Skill> · Model: <model> · Effort: <effort> · Posted: <date>
   - Retrieved: <today, ISO date>. The prompt belongs to its author; quoted here as a reference for this video only.

   ## Prompt (verbatim)

   <prompt text, plus the site's English translation if there is one>

   ## What we take from it

   <2 to 5 bullets: the idea, structure or technique we want, and what we will do differently>
   ```

   If the user picks several, add one section per entry to the same file. Never save prompts the user did not pick.
5. **Rewrite into a brief.** Many gallery prompts are one-liners ("make a dynamic 15-second showreel, go all out") whose result came from the model and effort level (often Opus at Max/High), not from the words. Copying the sentence will not copy the quality. Hand over to the `motion-director` skill (or fill `$VS\prompts\40-brief-template.md` yourself) and write `brief.md` on the **10 ingredients**: purpose, format, art direction, composition, typography, movement, timing, transitions, audio, quality constraints. Fill every decision the original prompt left to the model, using what is visible in the video the user watched and the "What we take from it" notes; write assumptions down. Long structured prompts (inputs / direction / structure / build / gotchas) already carry many decisions: map them onto the ingredients and adapt the stack to this repo (Remotion in `studio/`, frame-based, deterministic; or the motion-studio HTML engine for narrated films).
6. **Continue the normal pipeline.** Brief, then `10` creative directions (or `20` reference analysis if the user wants the feel of that exact video), `11` storyboard, and so on, as in `$VS\prompts\INDEX.md`. Never one-shot a whole video from the found prompt.

## Limits

- Search covers titles, tags and author handles, not prompt text (prompt bodies are not cached by design). Titles are descriptive ("Kinetic type showreel", "Tally product demo"), so subject words work best; style words ("hook", "cinematic") rarely appear in titles.
- The site lists mostly Opus 5.5 results and many entries reuse the same "showreel" one-liner. Prefer entries with longer, structured prompts when the user wants something to learn from.
- The parser reads the Next.js flight payload (`self.__next_f`) and the page's JSON-LD. If the site changes its markup, fields may come back empty ("-" or "prompt not found"); open the page URL, and fix `tools/lib.mjs`.
- The video itself is only watched on the site; the tools never download it.

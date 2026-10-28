# Research findings

Fifty findings from the Claude motion research, in three analyst files, plus a viewer that shows what landed in the studio.

| File | What it is |
|---|---|
| `A-github-web.md` | F-A1 to F-A18, from GitHub repos and web articles |
| `B-x-youtube.md` | F-B1 to F-B18, from X posts and YouTube |
| `C-reddit-social.md` | F-C1 to F-C14, from Reddit and social |
| `ledger/<name>.json` | one file per integrator: what landed, where, and why |
| `index.html` | the viewer, generated; open it in a browser, it works offline |
| `build_viewer.mjs` | generator, Node only, no dependencies |

## Open the viewer

Double-click `index.html`, or serve the folder (for example `python -m http.server --bind 127.0.0.1` here) and open `/index.html`.

## Regenerate after the ledgers change

```
node research/findings/build_viewer.mjs
```

The script parses the three markdown files, merges every `ledger/*.json`, and rewrites `index.html` with the data inlined. It prints the counts and a warning for anything it could not read (a missing field, a ledger that is not valid JSON yet, a ledger id that is not a finding). Missing or half-written ledgers are fine: those findings show as "not adopted yet".

## Ledger format

Each file is an array:

```json
[{ "id": "F-A1", "status": "landed", "paths": ["skills/motion-review/tools/inspect.mjs"], "why": "one line on what was done", "note": "optional" }]
```

`status` is `landed`, `partial`, `deferred` or `rejected`. If several ledgers mention one finding, the badge shows the strongest status (landed, then partial, then deferred, then rejected) and the card lists every entry.

## Markdown format the parser expects

- Each finding is `### F-Xn: title`, followed by bullet lines `**Category**`, `**What it is**`, `**Why it is good**`, `**Adopt?**`, `**Where it goes**`, `**Effort**`, `**Source**` (the colon may sit inside or outside the bold).
- The analyst verdict is the first word of the Adopt line (Yes, Maybe, No). Lines starting "Mostly", "Partly" or "Already" count as Maybe.
- The evidence level comes from the sentence starting "Strength:" or "Evidence:" in the Why line: "only claimed" or "described" reads as claimed, "doc-level" as doc-level, "shown" or "finished film" as shown. Without such a sentence the card says the level was not stated.
- `## Prompt patterns worth keeping` is a numbered list, `## Rejected or weak` is a bullet list. A bold phrase at the start of an item is its title, and a trailing `Credit:` is split off.

## Credit

Prompts and repos belong to their authors. The viewer paraphrases the analysts' summaries and links to each source; nothing is republished as ours.

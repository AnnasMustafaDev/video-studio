# brag (vendored, third-party)

Do not edit anything in this folder except this file. Everything else is a byte-for-byte copy of upstream.

| | |
|---|---|
| Upstream | https://github.com/latent-spaces/brag |
| Pinned commit | `669ab9286aa28b6c3ee30e75f181ee74319d012a` ("Release 0.5.0", 2026-10-23) |
| Fetched | 2026-10-28, read-only through the GitHub API |
| Licence | MIT, Copyright (c) 2026 Shunit Haviv Hakimi (see [LICENSE](LICENSE)) |
| Bundled music | "Happy Beats / Business Moves" by Sascha Ende, ende.app, **CC BY 4.0, not MIT**. Credit any published video that uses it: "Music: Sascha Ende, ende.app (CC BY 4.0)" |
| Bundled SFX | Kenney.nl and unicae_games keyboard pack, CC0 |

## What it does

`/brag` turns the project you just built into a 15 to 25 second launch video with music, motion and share copy, in one command. It reads the project's code (or, with `brag-slim`, a website URL), writes a plan and storyboard, builds the video, renders `brag.mp4`, bakes a poster as frame 0 and writes `share-copy.txt`, all into `brag-output/` in the current directory.

- `skills/brag/`: the full workflow. Hands the build to HeyGen's Hyperframes (`npx hyperframes ...`); ships music, SFX, cue presets and an optional `librosa` beat-analysis script. Upstream's own rule: on Claude Opus 5.5 it switches to `brag-slim` unless you say `--full` / "use the full brag" or `--voice`.
- `skills/brag-slim/`: one file, no assets. The model builds the whole video with tools already on the machine.

Upstream's `.claude/skills/brag` and `.claude/skills/brag-slim` are symlinks to `skills/brag` and `skills/brag-slim`; those targets are what is copied here. `skills/brag/slim.md` is identical to `skills/brag-slim/SKILL.md` upstream.

## Runtime needs

- Node.js 22+ and ffmpeg on PATH (both workflows).
- `brag` (full): the Hyperframes CLI via `npx hyperframes` (fetched from npm on first use) and its companion skills (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`; upstream suggests `npx hyperframes skills`). Optional: `uv` + Python 3.11+ for `scripts/analyze_music_cues.py` (pulls librosa, numpy, scipy, soundfile from PyPI). `--voice` uses Kokoro through `npx hyperframes tts`.
- `brag-slim`: nothing beyond what is installed; it is told to ask before installing anything.
- No accounts or API keys.

## Install

`node tools/install-skills.mjs` installs every `third_party/*/skills/*` folder into `~/.claude/skills/<name>` alongside the personal skills.

## Update

1. Read the new upstream commit SHA of `main`.
2. Download `skills/brag/`, `skills/brag-slim/` and `LICENSE` at that SHA into a fresh empty scratch folder; do not run anything from it.
3. Diff it against this folder (`diff -r`), read every changed file in full and review it for network calls, installs, deletes, telemetry, writes outside the project and instructions that steer the agent beyond the task.
4. If clean, replace the folder contents, update the commit, date and notes above, and re-run `node tools/install-skills.mjs`.

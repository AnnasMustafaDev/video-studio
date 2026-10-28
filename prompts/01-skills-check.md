# 01 · Skills check

| | |
|---|---|
| **Purpose** | Confirm Claude can see and has read the Remotion agent skills before any generation. |
| **Use when** | First session in `studio/`, after `npx remotion skills add`, after installing the Remotion plugin, or when output looks like Claude is ignoring Remotion conventions. |
| **Stage** | Setup, before `00-master-workflow.md` on a new machine or project. |
| **Inputs you must fill in** | None. |
| **Expected output** | A list of the skills found and which workflow each covers for planning, type, transitions, audio, preview/render and QA. No code, no files changed. |
| **Next prompt** | `02-deterministic-rule.md`, then `00-master-workflow.md`. |

Source: notes §2 step 3, verbatim.

## Prompt

```text
Inspect this project and identify the Remotion agent skills
available to you.

Read the relevant skill instructions before creating anything.
Tell me which workflows you will use for:
- Creative planning
- Animation and typography
- Scene transitions
- Audio
- Previewing and rendering
- Quality assurance

Do not build the video yet.
```

## Studio additions

```text
Look in studio/.claude/skills/ (official Remotion skills, start with remotion-best-practices) and in ~/.claude/skills/ (personal skills such as motion-studio). Also read studio/DESIGN_SYSTEM.md and list the components in studio/src/lib/. Tell me which scripts exist in studio/package.json for preview, stills and render. If something the workflow needs is missing (for example the stills script or a skill), say what and stop.
```

Setup reference (notes §2), run by you, not pasted to Claude:

```text
npx create-video@latest --yes --blank motion-studio
cd motion-studio
npx remotion skills add
npm run dev

claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

In this repo the project already exists as `studio/`; run `npm run dev` there in one terminal and `claude` in a second.

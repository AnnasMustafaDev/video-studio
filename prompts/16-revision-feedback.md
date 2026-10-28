# 16 · Revision from feedback

| | |
|---|---|
| **Purpose** | Turn loose feedback (yours or a viewer's) into a concrete, approved change list, then apply it. |
| **Use when** | Someone watched a draft and said things like "feels slow", "the middle drags", "logo too small", "make it pop". |
| **Stage** | Revise loop, between drafts. |
| **Inputs you must fill in** | `[CompId]`, `[feedback, pasted as given]`, `[who gave it and what they care about]`, `[what must not change]`. |
| **Expected output** | Each note translated into a specific change (frames, values), conflicts and risks flagged, a short plan to approve, then the changes with before/after stills. |
| **Why this exists** | Vague words mean different things in round 1 and round 3 unless defined once and tied to checks on a still. Evidence: only claimed (two Reddit builders hit the same wall). Findings F-C6, F-C2. |
| **Next prompt** | `13-quality-review.md`, then `53-final-render-delivery.md` when approved. |

## Prompt

```text
Here is feedback on the current draft of [CompId]:

[feedback, verbatim]

It comes from [who], who cares most about [what they care about]. Do not change: [locked items].

1. Translate every note into a specific, testable change: which scene, which frames, which element, old value, new value. Vague notes ("make it pop", "more premium") must become concrete motion or design changes; give your interpretation and one alternative.
2. Flag notes that conflict with each other, with the storyboard, or with the design system, and notes that would make the video worse. Explain why in one sentence each.
2b. For each change write an acceptance criterion checkable on a still or a frame count (for example "title block no closer than 120 px to any edge", "focal point alone for at least 45 frames"). State outcomes and thresholds, choose the implementation yourself, and tell me which values you picked.
2c. Per-video glossary: for every vague word in the feedback ("punchy", "premium", "pop", "slow") write what it means in this video, in frames, px or curve, and save it to the Glossary block in projects/[yyyy-mm-dd]-[slug]/brief.md so the word keeps one meaning from now on.
3. Order the changes by impact. Show me the list and wait for my approval.
4. After approval, apply them one at a time. Keep total duration and scene sync correct; if timing changes, update later scenes and audio cues.
5. Commit locally after each approved change. Show git diff --stat and name anything that changed outside the request. Render before and after stills for every change and inspect them. Then run a short review pass on the whole film for anything the changes broke.
```

## Studio additions

```text
Stills: npm run stills -- [CompId] [frames]. Record the feedback, the agreed change list and what was done in projects/[yyyy-mm-dd]-[slug]/review.md under "Revision [n], [date]". If you could not view the stills, say so.
```

Sources: acceptance criteria and glossary after u/FerretVirtual8466 and u/TheHol1day (r/ClaudeAI); commit-and-diff guard after u/TheHol1day. Our wording. Never push.

# 74 · Compare the render with a reference

| | |
|---|---|
| **Purpose** | Review a render against an exemplar (a reference clip or our own approved golden scene) so the verdict says how it falls short, not just a score in a vacuum. |
| **Use when** | You have a reference or an approved golden scene of the same type, and the film is built enough to render a contact sheet. |
| **Stage** | Review, alongside `13`. |
| **Inputs you must fill in** | `[CompId]`, `[reference sheet or clip path, or golden scene composition]`, `[timestamps to compare]`. |
| **Expected output** | Two contact sheets at the same timestamps, a "falls short in" list with frame evidence, and the borrowed-versus-changed statement. |
| **Why this exists** | One builder called a reference-clip QA loop the biggest quality gain; two commenters agreed. Evidence: only claimed (described, not demonstrated). Finding F-C4. |
| **Next prompt** | `15` or `16`, then `13`. |

## Prompt

```text
Compare [CompId] with the reference [reference]. Build one contact sheet of the reference and one of ours at the same timestamps [timestamps] (same count, same order). Open both. If you cannot view images, say so and stop.

Study the reference for smoothness, shot durations, type scale, spacing, and which elements it uses. Measure shot durations in the reference per scene. Then answer:
1. In what ways does ours fall short of the reference? Each point cites two frames, one from each sheet.
2. In what ways is ours stronger or different on purpose?
3. Borrowed versus changed: list the techniques we borrowed and the design decisions we changed so it does not copy the reference's look.
4. The three fixes that would close the biggest gap, as acceptance criteria checkable on a still.
Do not recommend copying the reference's colours, wording or layout.
```

## Studio additions

```text
Sheets: node skills/motion-review/tools/inspect.mjs sheet ... for both. Pass the reference sheet as the optional input to motion-review. For analysing a reference first, use 20. Sources: QA-against-reference idea after u/cowanscorp (r/SideProject); borrow-techniques-change-design wording after the engraving-ad prompt of @LexnLin on prompt-motion.com. Our wording.
```

# 19 · Concept triple (Idea, Device, Grammar)

| | |
|---|---|
| **Purpose** | Make sure the film has an idea, not just a look, before three directions are drawn. |
| **Use when** | Before `10-creative-directions.md`, especially when the brief names a style but no point of view. |
| **Stage** | Direction, step zero. Extra fields, not a new gate. |
| **Inputs you must fill in** | `[subject and audience]`, `[inventory of real specifics: product facts, numbers, screens, quotes]`, `[format and length]`. |
| **Expected output** | Three concepts, each as Idea, Device, Grammar, run through kill-tests, one recommended; the winner pasted into `brief.md` and into prompt 10 as a constraint. |
| **Why this exists** | Stops "style posing as idea": three looks and no point. Evidence: doc-level method with four worked concepts in its repo; the strength of the resulting films is only claimed. Finding F-A11. |
| **Next prompt** | `10-creative-directions.md`, then `11-storyboard.md`. |

## Prompt

```text
Before any look or motion, find the concept for [subject].

1. Inventory: list the real specifics we have (facts, numbers, screens, phrases, constraints). Do not invent any.
2. Write three concepts through three different lenses (for example the product's own mechanism, the viewer's problem, a single physical metaphor). Each concept is exactly three sentences:
   Idea: what the viewer should believe afterwards, 8 words or fewer.
   Device: one object or element that is carried through every shot (for example a dot handed from shot to shot that ends as the mark).
   Grammar: one rule the form obeys (for example opens and closes on the same tick).
3. Kill-tests, per concept, answer yes or no with one line: Ownership (could a competitor's film say this?), Deletion (if the Device vanished at a seam, would the film still work?), Specificity (does it use at least two items from the inventory?), Cause (does every demo moment have a visible cause?).
4. Cheap tells to avoid: borrowed props (rocket, lightbulb), a demo with no cause, a recycled end card, the Device dropping out at a seam.
5. Recommend one concept and say which two you killed and why. Then hand the Idea, Device and Grammar to 10 as fixed constraints for all three directions.
```

## Studio additions

```text
Save to projects/[yyyy-mm-dd]-[slug]/directions.md under "Concept" and copy the winning triple into brief.md. The Device becomes a named component in the storyboard so the reviewer can check it appears at every seam.
Source: Leonxlnx's cinetic (concept-and-story.md, taste-and-slop.md) and echris6's motion-video-kit (persistent actor rule). Our wording.
```

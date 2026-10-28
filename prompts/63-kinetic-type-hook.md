# 63 · Kinetic typography hook

| | |
|---|---|
| **Purpose** | Build a 2 to 5 second type-only opening that stops the scroll and states the message. |
| **Use when** | You need an opener for a reel, a YouTube intro, a launch teaser, or a title sequence. |
| **Stage** | Planning plus build for a short piece; it can be scene 1 of a longer video. |
| **Inputs you must fill in** | `[the exact words]`, `[duration]`, `[format]`, `[mood]`, `[tokens or palette and typeface]`, `[sound: beat, VO or silent]`. |
| **Expected output** | Two or three type treatments with a beat map, the chosen one built, stills at every beat, frame 0 already readable. |
| **Next prompt** | `13-quality-review.md`, then continue the film with `14` or finish with `50`. |

## Prompt

```text
Design a kinetic typography hook. Words: "[exact words]". Duration [N] s, format [format], mood [mood], typeface and palette [tokens or palette and font]. Sound: [beat at N bpm | VO file | silent].

1. Beat map: split the words into beats (usually one phrase or word per beat). For each beat give the frame range and which word carries the emphasis. Beats land on the music beat or the spoken word.
2. Propose 2 or 3 genuinely different treatments, for example: masked line reveals stacking into a block; one word at a time centre screen with scale and weight change on the key word; a per-character cascade with tracking expansion. For each, name the motion (direction, distance in px, ease or spring config, stagger in frames) and how beats connect (cut on beat, push, match cut on a letter shape). Recommend one.
3. Rules: frame 0 is readable and already says something (muted autoplay). One type family, emphasis by weight, size or the one accent colour. The last word or line holds still for at least 1 s. Text stays in the safe area at its largest (overshoot peak). Left-align phrases that build word by word unless the treatment is single-word centred. No bouncy easing; at most a subtle overshoot.
4. Build the chosen treatment with a reusable staggered-text component (words or characters, stagger, delay, spring config as props), deterministic and frame-based.
5. Render a still at every beat's settled state and at two in-between frames of the fastest move, and inspect them.
```

## Studio additions

```text
Use or extend the text-reveal component in studio/src/lib/ (check before writing a new one). Typeface via @remotion/google-fonts or a local font loaded before render. Stills: npm run stills -- [CompId] [frames]. If you could not view them, say so.
```

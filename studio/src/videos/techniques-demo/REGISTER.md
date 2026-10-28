# Register TechniquesDemo (not done here: `src/Root.tsx` is owned by another session)

Add to the imports at the top of `studio/src/Root.tsx`:

```tsx
import { TechniquesDemo } from "./videos/techniques-demo/TechniquesDemo";
import { TECHNIQUES_DURATION } from "./videos/techniques-demo/timeline";
```

Add inside `<Folder name="Library">` (after `Showcase-Vertical`):

```tsx
        <Composition
          id="TechniquesDemo"
          component={TechniquesDemo}
          durationInFrames={TECHNIQUES_DURATION}
          fps={30}
          width={1920}
          height={1080}
        />
```

`TECHNIQUES_DURATION` is 341 frames (11.4 s).

Optional, in `studio/package.json` scripts (also not edited here):

```json
"curve": "node scripts/export-curve.mjs",
"copy-lint": "node scripts/copy-lint.mjs"
```

Until registered, `npm run stills -- TechniquesDemo ...` fails with "composition not found".

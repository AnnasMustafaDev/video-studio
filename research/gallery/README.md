# Claude motion gallery

`index.html` is a single offline page for browsing motion videos made with Claude (73 items). Open it in a browser; only the YouTube and GitHub thumbnails need a network connection.

## Sources

The data is inlined from the four research files in this folder:

| File | Items | Platforms |
|---|---|---|
| `github.json` | 19 | GitHub repos |
| `reddit.json` | 17 | Reddit posts |
| `instagram_tiktok.json` | 12 | TikTok (9), Instagram (3) |
| `x_youtube_web.json` | 25 | X (17), YouTube (4), web articles (4) |

The page was generated from these files, so if they change, the page has to be rebuilt. It does not read them at runtime.

## Verification caveats

- Nobody watched any of the videos. Descriptions come from captions, READMEs, post text and articles.
- **Verified** means the post, repo or page was fetched, or confirmed through a reliable page that links to it. **Unconfirmed** means search snippets or roundup articles only.
- `github.json` has no verification field. GitHub items are shown as verified because the repo pages were the source.
- Reddit could not be fetched directly. Post text came from a mirror and the links were rebuilt from post ids, so a few may be wrong. One post (the "app launch animation" one) could not be matched to a post id and links to a search instead; it is marked unconfirmed.
- Some items are references rather than Claude work: the motionmaxxing samples were made with GPT, the Remotion trailer was made by hand, the r/webdev GSAP walkthrough does not confirm Claude was used, and the two Instagram mindset accounts are format references only.
- Three TikTok items have no URL (@carter.braydon, @jensheitmann_, @duncanrogoff). They are shown greyed out with "No link found".

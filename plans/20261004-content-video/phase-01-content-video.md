# Content and video implementation

Context: [plan](plan.md), [project README](../../README.md),
`src/chapters/chuong1/data.json` (existing user edits; read-only).

## Requirements and implementation

- [x] Extend the existing chapter navigation with exactly one additional tab.
- [x] Preserve Flashcard state, review behavior, IDs, storage key, and dictionary.
- [x] Render actual chapter overview/objectives, ordered sections, all supplied block types.
- [x] Add table-of-contents navigation, manual reversible read marks and valid progress.
- [x] Reuse the original card-opening handler and source presentation.
- [x] Show real videos, an inline player without autoplay, and external fallback.
- [x] Add manual reversible watch marks; never mark on selection or link opening.
- [x] Isolate progress by chapter/optional user and handle missing/corrupt/blocked storage.
- [x] Add loading, empty, and error handling using existing responsive theme classes.
- [x] Verify learning helpers and existing Flashcard tests.
- [x] Verify lint and production build.
- [x] Verify browser flows and desktop/mobile rendering.
- [x] Complete independent review and chapter documentation.

## Touchpoints

Existing: `src/chapters/chuong1/Flashcards.jsx`.
New: `ContentVideoTab.jsx`, `ContentVideo.jsx`, `ContentBlocks.jsx`,
`VideoLibrary.jsx`, `Sources.jsx`, `learning-progress.js`, and focused tests/README.
Keep shared config, styling, dependencies, Flashcard helpers, and data unchanged.

## Validation and risks

Use Node's existing test runner, `npm run lint`, `npm run build`, and an isolated
headless browser. Report unrelated baseline test failures separately with proof.
YouTube availability/embedding remains external; the real watch link stays visible.

Verified: 23/23 Chapter I tests, 20/20 browser checks, successful build/lint. No new
warnings or application JavaScript errors. The 6 failing Chapter IV parser tests
and 13 lint warnings outside Chapter I predate this change. Evidence is linked
from the completed plan; all 13 tasks above are complete.

Rollback: remove the new tab/imports and restore the original local `Sources`
component. Existing Flashcard storage is unaffected; reading/watching keys are separate.

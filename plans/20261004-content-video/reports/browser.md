# Independent browser verification

Date: 2026-10-04T15:07:15.552Z

Result: 20/20 checks passed.

| Check | Result | Evidence |
| --- | --- | --- |
| Exactly three top-level tabs; Flashcards is the default | PASS | Thẻ ghi nhớ / Từ điển thuật ngữ / Nội dung & Video |
| Selected Flashcard and flipped face survive a tab round trip | PASS | Second card, back face unchanged |
| Rating uses the existing Flashcard storage key and survives tab switching | PASS | fc002 reviewCount=1; legacy key preserved |
| Actual chapter title, four objectives, and seven reading sections render | PASS | Title matches data; 4 objectives; 7 sections and TOC entries |
| Collapsed self-check questions expand with real questions and answer-card links | PASS | 2 questions visible with 3 answer-card buttons |
| Tables show both source values and every Congress/year/content column | PASS | 2-column traditions table and 3-column Congress table complete |
| Timeline preserves day precision for 1911 and month precision for 1920 | PASS | 1911-06-05, 1920-07, 1920-12 |
| TOC moves and focuses the heading below the sticky header without marking read | PASS | heading top 96.3125px; header bottom 69px |
| Manual reading mark, reversal, percentage, and reload restoration | PASS | 0→1/7 (14%)→0; both persisted across reload |
| Selecting and changing videos loads an iframe with autoplay disabled; no watched mark | PASS | Two real YouTube IDs; autoplay=0; watched count remains 0 |
| Opening the external YouTube link leaves watched progress unchanged | PASS | Correct watch URL opened in separate target; no completion change |
| Manual watched mark, reversal, selected video, and reload restoration | PASS | Mark and reversal persisted; last selected vid02 restored |
| Related Flashcard uses the existing handler and opens the exact requested card | PASS | fc036, front face, Flashcards tab, study button focused |
| Desktop layout has no horizontal page overflow | PASS | 1425px page / 1440px viewport |
| 390px mobile layout contains wide tables and has no page overflow | PASS | 390px page / 390px viewport; tables scroll inside their regions |
| Mobile TOC scrolls the heading below the sticky header | PASS | heading top 95.84375px; header bottom 69px |
| Corrupted saved learning progress gives a useful warning and working marks | PASS | Warning shown; read mark replaces invalid saved value |
| Blocked localStorage warns while explicit marks still update in memory | PASS | Read/write warnings shown; mark works without storage |
| Empty chapter sections/videos and invalid chapter have explicit UI states | PASS | Real component mounted through dev module imports; empty and missing states verified |
| No uncaught application JavaScript errors | PASS | 0 Runtime exceptions; 0 console.error calls |

## Notes

- Browser: Chrome/154.0.8037.93; isolated temporary profile; no dependencies installed.
- YouTube playback and embed availability were not verified. Browser navigation to external provider URLs was attempted, but this environment may block provider access. Only generated URLs, iframe loading, external-target opening, and explicit completion behavior are covered.
- Observed network failures: net::ERR_ABORTED.

## Artifacts

- [Desktop introduction](desktop.png)
- [Desktop reader](desktop-reader.png)
- [390px mobile introduction](mobile.png)
- [390px mobile reader](mobile-reader.png)
- [390px mobile videos](mobile-videos.png)
- Reproduce with the Vite dev server running: `node plans/20261004-content-video/reports/browser-check.mjs`.
- Tests use actual CDP mouse clicks in isolated Chrome, real application components/data, and a temporary in-browser dev-module harness for empty states. No implementation files or shared configuration are modified.

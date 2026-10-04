# Test report: Chapter I content and video

Date: 2026-10-04

## Summary

The 20 new Chapter I learning-helper tests and all 3 existing Flashcard tests pass.
Lint and production build pass. The complete suite has 6 existing Chapter IV
parser failures; none come from the requested Chapter I changes.

## Findings

| Check | Result |
| --- | --- |
| `node --test src/chapters/chuong1/learning-progress.test.js` | 20 passed; 0 failed; 0 skipped |
| All `src/**/*.test.js`, enumerated with PowerShell `Get-ChildItem` | 64 total; 58 passed; 6 failed; 0 skipped |
| Chapter IV parser independently | 29 total; 23 passed; the same 6 failed |
| `npm.cmd run lint` | Exit 0; 13 warnings in existing Chapter II, IV, and VI files; no Chapter I warnings |
| `npm.cmd run build` | Exit 0; production chunks generated successfully |

The new tests use the actual `data.json` for its `chapter.id`, `contentSections`,
7 sections, 3 videos, Flashcard key, and supplied YouTube IDs. Focused edge cases
cover chapter filtering, ordering and resource whitelists; chapter/user storage
collisions; malformed JSON and JSON null; blocked read/write access; outdated and
duplicate IDs; zero current resources; reversible marks; selection persistence
without watched marks; untouched Flashcard and other-user/chapter storage;
sanitized autoplay settings; valid supplied URLs; invalid/non-YouTube sources;
and disabled embeds retaining the external fallback.

### Existing failures

All failures are in `src/chapters/chuong4/contentParser.test.js`:

| Test | Assertion error and relevant location |
| --- | --- |
| every item carries full verbatim paragraphs (no content loss) | `sentence lost: "Trong tác phẩm Đường cách mệnh (năm 1927), Hồ Chí Minh khẳng…"`; line 239 |
| quotes and paragraphs have verbatim text and consistent shape | `expected quote blocks detected, got 0`; line 272 |
| no paragraph is cut mid-quotation by the parser | `exactly the two source-unclosed quotations remain`; actual 0, expected 2; line 332 |
| the two paragraphs left with an open quote are unclosed in the source file | `quotation opening kept verbatim`; line 344 |
| the multi-line quotation that used to be broken is now one whole sentence | `sentence stays joined`; line 352 |
| cleaning never eats study content | `year inside a work title is kept`; line 413 |

Baseline verification used `execFileSync('git', [..., 'show', 'HEAD:<path>'])`
buffers and `readFileSync` for `contentParser.js`, `contentParser.test.js`, and
`Chương IV.txt`. Their contents are identical after converting checkout CRLF to
LF. Raw byte differences are exactly the checkout CRLF counts: 479, 497, and
750, respectively. Git reports no modifications for these three files. An
independent parser-only run reproduces all six failures. No Chapter IV files or
the user's `data.json` were edited by this testing task.

## Recommendations

Keep the six baseline parser failures visible and assess them separately from
the Chapter I request. Browser checks should verify actual selection callbacks,
the displayed 0% state, preserved Flashcard state across tabs, and responsive
layout; these Node tests validate helpers and persistence, not browser rendering
or external YouTube playback. Coverage percentages were not measured.

## Unresolved questions

No Chapter I helper failures remain. Browser verification belongs to the
controller's integration pass.

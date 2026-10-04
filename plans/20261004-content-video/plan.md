---
title: Chapter I content and video
status: completed
priority: P1
effort: medium
branch: main
tags: [chapter-1, content, video]
created: 2026-10-04
---

# Chapter I: Nội dung & Video

Status: completed · 2026-10-04 · 13/13 acceptance tasks verified.

Add one tab to the existing chapter page, using `chapter`, `contentSections`, and
`videos` from the current data. Keep the Flashcard tab as the default and preserve
its state, review functions, card IDs, and storage key. The existing dictionary
remains available. Do not edit the user's pending `data.json` changes.

## Phases

Implementation and verification: [phase-01-content-video.md](phase-01-content-video.md).

1. Implement a lazy-loaded reader and video library with the existing theme — done.
2. Save explicit reading/watching progress separately by chapter (and user when supplied) — done.
3. Verify behavior, storage isolation, mobile layout, lint, build, and regression tests — done.

## Acceptance

- One additional tab containing both content and videos for the current chapter.
- Chapter introduction/objectives, table of contents, every actual block type,
  manual read marks, accurate progress, and working related Flashcard navigation.
- Inline YouTube selection with autoplay disabled, an external fallback, manual
  watched marks, and useful loading, empty, invalid-data, and storage-error states.
- Switching tabs preserves the current Flashcard selection, flip, and progress.
- No new dependencies, no edits to shared styling/config, no fake data or links.
- Focused learning-progress tests, existing Flashcard tests, lint, and production build pass.

## Files

Extend `src/chapters/chuong1/Flashcards.jsx`; add focused reader, blocks, video,
shared sources, and progress modules/tests in the same chapter folder. Document
the actual data contract and verification in that folder's README.

## Review

Requirements and touchpoints reviewed against the existing code and data before
implementation. UI advice, independent tests, and code review accompany verification.

## Validation

- Chapter I tests: 23/23 passed; browser: 20/20 passed, desktop and mobile 390px.
- Production build and lint passed; no new lint findings.
- Full suite: 58/64 passed; 6 pre-existing Chapter IV parser failures verified
  against unchanged HEAD content. Lint has 13 pre-existing warnings elsewhere.
- Live YouTube playback remains unverified; valid iframe URLs, disabled autoplay,
  fallback links, and manual completion behavior were verified.

Reports: [tests](reports/tests.md), [browser](reports/browser.md),
[review](reports/review.md), [documentation](reports/documentation.md),
[completion](reports/completion.md).

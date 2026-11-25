# AI Failure Audit

This audit records problems observed during this Codex session. Expected red tests written before implementation are not counted as AI failures. The entries distinguish application defects, a test mistake, and a slide-inspection tooling failure.

## 1. Lightbox did not restore focus for direct links

- **Failure:** The initial photo dialog did not explicitly restore focus when opened directly with `?photoId=` and then closed.
- **Detection:** A new test expected the gallery heading to receive focus after closing a direct link; it failed because focus remained on the document body in jsdom.
- **Fix:** Track the opening photo button and return focus to it when available; use the gallery heading as the fallback for a direct link.
- **Verification:** The gallery test suite passes tests for both the direct-link fallback and restoration after closing with Escape. These are jsdom tests, not a manual screen-reader or browser audit.

## 2. Invalid Testing Library event helper

- **Failure:** An AI-written Escape test called `fireEvent.cancel`, which is not a Testing Library helper.
- **Detection:** The test failed with `TypeError: fireEvent.cancel is not a function`.
- **Fix:** Dispatch a cancelable native `cancel` event with `fireEvent`, matching the event handled by the dialog.
- **Verification:** The updated test passes and checks that closing preserves the category and returns focus. It simulates the dialog event; it does not prove a physical Escape key interaction in a browser.

## 3. Oversized gallery images and delayed first image

- **Failure:** The initial local-image gallery served 800×600 JPEGs to thumbnails and marked every image for lazy loading, including the first visible image.
- **Detection:** A mobile Lighthouse run reported performance 89/100, LCP 3.8 seconds, and approximately 504 KiB of potential image-delivery savings.
- **Fix:** Add 600-pixel WebP thumbnails with responsive image candidates and eagerly load the first visible image at high priority. The full-size local JPEG remains available for the lightbox.
- **Verification:** A subsequent mobile Lighthouse run reported performance 95/100 and LCP 2.9 seconds. These are individual runs, so the difference is not a controlled performance benchmark. Lighthouse still reported potential image and JavaScript savings.

## 4. Missing robots.txt returned HTML

- **Failure:** The gallery had no `robots.txt`, so the Vite preview fallback returned the app HTML for that path, which Lighthouse reported as invalid robots.txt.
- **Detection:** The baseline Lighthouse SEO score was 92/100 and included a failed robots.txt audit.
- **Fix:** Add a plain-text `public/robots.txt` allowing crawlers.
- **Verification:** The following Lighthouse run reported SEO 100/100. This checks the local preview build, not the behavior of a future deployment server.

## 5. Slide-inspection script failed on Windows output encoding

- **Failure:** The initial Python script extracting PowerPoint text used the Windows console's default encoding and failed on a Unicode arrow with `UnicodeEncodeError`.
- **Detection:** The command stopped while reading slide 2, leaving the presentation only partially inspected.
- **Fix:** Set `PYTHONIOENCODING=utf-8` and rerun the standard-library XML extraction across the slides.
- **Verification:** The rerun printed text through the final slide. This established text extraction only; it was not a visual review of every slide.

## Remaining limitations

- Gallery full-size image descriptions still use generic sample labels and need verified descriptive alt text.
- The appeal dossier figures are explicitly labeled illustrative, not verified case facts.
- The swipe deck's undo restores the card locally and does not delete the already stored swipe record.

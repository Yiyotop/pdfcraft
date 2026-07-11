# Technical Debt Backlog

This backlog tracks known technical debt items discovered in code and workflow reviews.

## P0

- Align root Markdown style with current markdownlint rules to avoid noisy CI output in docs checks.
  - Scope: README and long-form docs formatting consistency.

## P1

- Implement conditional workflow support for `file-pages` and `custom` condition types.
  - File: src/types/workflow-conditional.ts
  - Current behavior: both condition types return false by design.

- Expand processor test coverage beyond validation paths for high-impact modules.
  - Suggested focus: encrypt, decrypt, repair, organize, ocr success/error integration paths.

- Add locale parity for new Digital Sign error keys.
  - File: messages/en.json includes new keys.
  - Follow-up: propagate to all supported locales.

## P2

- Replace hardcoded external font URLs in text rendering pipeline with mirrored or version-pinned assets.
  - Files: src/lib/pdf/processors/text-to-pdf.ts, src/lib/pdf/processors/watermark.ts

- Continue reducing workflow executor unsupported tool set and document support matrix in UI.
  - Files: src/components/workflow/ToolSidebar.tsx, src/lib/workflow/executor.ts

## Notes

- Keep this file updated when new debt is introduced or resolved.
- Prefer linking PRs/issues next to each item once tracked externally.

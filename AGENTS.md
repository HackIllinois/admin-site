# AGENTS.md

## Project overview

This repository is the HackIllinois admin site, a Next.js app used to manage internal admin workflows and data. The app uses the App Router, TypeScript, React, and a generated API client for backend calls.

Key directories:
- `app/` — route pages and page-level UI
- `components/` — reusable UI components
- `util/` — shared helpers, API wrappers, and utility logic
- `generated/` — generated API client code; treat as generated output
- `tests/` — project tests
- `public/` — static assets, including email assets

## Local setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the local dev server:
   ```sh
   npm run dev
   ```
3. Validate code with the project scripts as needed:
   ```sh
   npm run build
   npm run test
   npm run lint
   ```

## Coding expectations

- Prefer small, surgical changes that match the existing patterns in the surrounding code.
- Keep code readable and consistent with the current project style.
- Use TypeScript strictly; avoid `any` when a real type is available.
- Use the existing `@/*` import alias for project-relative imports.
- Use `"use client"` only in components that actually need client-side behavior.
- Do not hand-edit generated client code unless the change is explicitly required and the generation step is understood.
- If an API contract changes, prefer regenerating the generated client via the repo workflow instead of patching generated output manually.

## Architecture notes

- Page-level logic generally lives in `app/` route files and components.
- Reusable UI should live in `components/`.
- Shared logic, API wrappers, and helper functions should live in `util/`.
- The app relies on generated services from `generated/` for API access; follow existing patterns when adding new service calls.

## Testing and validation

- Run the smallest relevant command for the file or feature you changed.
- Prefer focused tests when available; do not run broad suites for tiny edits.
- If UI behavior changed, validate the affected route locally when practical.
- If you change email-related rendering or asset behavior, verify the impacted flow and keep asset paths accurate.

## Email-specific notes

This project contains email preview and sending logic. When modifying email templates or image assets:
- update the relevant code in `util/` and related templates
- keep public image paths under `public/email/`
- use full public URLs in sent email HTML
- preserve backwards compatibility for previously sent artwork when replacing images

## Before finishing

- Check whether formatting or linting is needed.
- Verify the edit aligns with app patterns and does not introduce unrelated changes.
- Keep the patch contained to the task and avoid unrelated cleanup.

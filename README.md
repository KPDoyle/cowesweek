# Cowes Week Live

A private sailing and powerboat event workspace hosted on Vercel.

App: https://cowesweek.vercel.app
Repository: https://github.com/KPDoyle/cowesweek

## Features

- Responsive race tracking centre: illustrative maps, class filters, favourite boats, boat profiles, replay and venue-screen mode.
- Separate sailing and powerboat fleets, race programmes and classes.
- Boat and crew registration, emergency contacts and readiness checklists, including powerboat licence and scrutineering checks.
- Race creation, course instructions, laps, distance, race status and CSV exports.
- Finish entry, IRC corrected times, elapsed/lap scoring, penalties, DNS/DNF/DSQ and provisional/published results.
- Incident logs, event notices, protests and hearing decisions, berth allocation and audit history.
- Validated GPS CSV imports, saved recorded tracks and JSON/CSV exports.

## Hosting and persistence

The app and API run on Vercel using Next.js, React and TypeScript. Event records are stored as a private, versioned JSON document in the project-connected Vercel Blob store. Server requests use project-scoped OIDC; credentials and private document URLs are not exposed to the browser.

Reads bypass caching. Writes use the stored ETag as an atomic condition, so conflicting edits fail with HTTP 409 rather than overwriting another user's work. Record versions, input validation, linked-record checks and audit history are preserved. Operations in a submitted batch are committed together or rejected together. The current event-document limit is 4 MB; this implementation suits the demonstration workspace. A larger or high-throughput multi-event service should use a relational database.

Keep Vercel Authentication enabled for **all deployment URLs**, including production. This is an organiser workspace with crew contacts and write access. Preview builds are blocked from reading or editing production event records.

The app has no runtime dependency on the former ChatGPT-hosted site.

## Environment

- `BLOB_STORE_ID`: provisioned by the private Vercel storage connection.
- `COWES_INITIAL_SNAPSHOT`: a temporary, server-only production migration input. It creates the event document only when no saved document exists; it never overwrites saved data. Remove it after migration verification.

Use Vercel's environment settings. Never put credentials or private event records in GitHub.

## Development

Requires Node 22.13+ and pnpm. `pnpm install`, then `pnpm dev`. `pnpm build` / `pnpm build:vercel` build the native Next.js app. `pnpm test` verifies migration, persistence, validation, atomic operations, conflicts and preview isolation.

## Demonstration data and scoring

The initial boats, crews, programme, results, wind and tide values are fictional demonstration data. This is an independent concept platform, not the official Cowes Week or British Powerboat Racing Club app. Official tracking, weather and broadcast feeds are not connected; recorded GPS imports and manual office updates work.

IRC corrected seconds = rounded elapsed seconds × TCC + time penalties. Elapsed scoring uses elapsed + penalties. Circuit finishers rank by completed laps descending, then total time. DNS/DNF/DSQ appear after finishers. Organisers must verify applicable rules and results. This is not a complete RRS series-scoring or discard engine. Maps and sample conditions are illustrative, not navigation data.

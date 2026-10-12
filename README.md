# Cowes Week Live

A responsive sailing and powerboat event platform, developed from the Cowes Week spectator-experience brief. The GitHub repository is `KPDoyle/cowesweek`.

## App

Private working app: https://cowesweek.kevin-doyle296372.chatgpt.site

This is an independent concept platform, not the official Cowes Week or British Powerboat Racing Club application. The initial fleet, programme, results, weather and tide values are demonstration data. Sailing and powerboat festivals remain separate event programmes.

## Implemented

- Responsive race centre with an illustrative Solent/south-coast map, class and boat search, favourites, boat profiles, track trails, replay, explanatory overlays and venue-screen mode.
- Separate sailing and powerboat fleets, class filters and programmes.
- Database-backed boat registration, crew details, emergency contacts, entry status and readiness checklists; powerboats additionally have licence and scrutineering checks.
- Create/edit races, programme exports, courses/instructions, distances, laps and race status.
- Finish entry, IRC time correction, elapsed-time and lap-based scoring, penalties, DNS/DNF/DSQ, provisional/published status and result CSV export.
- Race-office incident logs, notices, protest/hearing decisions, berth allocation and audit history.
- Validated GPS CSV imports, persisted recorded tracks, data exports and complete JSON record downloads.
- Optimistic record version checks, parameterised SQL, input validation, import limits and spreadsheet-formula escaping in CSV exports.

## Data and access

The app uses React, TypeScript, Vinext and Cloudflare Workers with D1 SQLite. Sites hosts the owner-private application and enforces access before requests reach the app. The API is an organiser workspace API; **do not make this deployment public without adding server-side organiser/member permissions and separating spectator data from private crew/contact records**. A JSON backup includes private event records.

Favourites are device-local; operational records are shared persistent database records. Seed data is inserted once on first request, separately from schema migrations. Official GPS, timing, broadcast and forecast APIs are not connected. CSV imports use recorded data; automatic live ingestion is future integration work. Illustrative map, wind and tide overlays are not navigational or operational data.

## Scoring scope

IRC: rounded elapsed seconds × TCC + penalty seconds. Elapsed: elapsed + penalties. Circuit: finishers sorted by completed laps descending, then total time. DNS/DNF/DSQ are listed after finishers. The organiser must verify inputs, applicable event rules and decisions; this is not a full RRS series-scoring engine, discard calculator or certification system. Publishing marks results available in the private workspace.

## Develop and build

Requires Node 22.13+ and pnpm. Install with `pnpm install`, then `pnpm dev`. `pnpm build` produces the Worker deployment. `pnpm exec tsc --noEmit` checks types. `pnpm run test` checks validation, scoring and the database-backed request lifecycle. Generate appended schema migrations with `pnpm db:generate`.

The hosting manifest declares the D1 binding `DB`. Sites provisions D1 and applies committed migrations on publication. For local development, apply migrations using the starter's D1 migration workflow in `docs/LOCAL_D1.md`. GitHub stores source; it does not host the dynamic API. A plain GitHub Pages export cannot provide these database features.

## Sources and programme separation

- Official Cowes Week app information: https://www.cowesweek.co.uk/web/code/php/main_c.php?page=app&section=home
- British Powerboat Racing Club / Cowes powerboat events: https://cowestorquaycowes.com/
- Powerboat courses and race instructions: https://cowestorquaycowes.com/courses/ and https://cowestorquaycowes.com/race-instructions/

The application does not copy official participant data, logos, restricted tracks or race instructions.

## Vercel deployment

The same repository supports a native Next.js Vercel deployment. `pnpm build:vercel` builds it. The existing persistent D1 database remains behind the private Sites API; the Vercel server proxies requests securely and does not expose service credentials to the browser.

Vercel production secrets: `EVENT_API_ORIGIN` (the private Sites origin) and `EVENT_API_TOKEN` (its supported service-access bearer token). Set these through Vercel environment settings, never source files. Keep Vercel Authentication enabled for **all deployments**, including production, because this is a private organiser workspace with crew contacts and write operations. Preview deployments do not receive production database credentials.

Vinext builds resolve the event service to `lib/sites-event-service.ts`; Next.js builds use `lib/event-service.ts`. The UI and record models are shared across both hosts.

# Cowes Week operational review — 22 October 2026

Scope: Kerriann Murray's “Info requested” email, including the highlighted dashboard additions and managed data streams. The existing fleet editor, readiness/check-in, course geometry/GeoJSON, maps, results, notices, incidents and protests remain in place.

## Added workflows

Open `/office?view=operations` or **Regatta operations** in the left rail. Coverage links every requirement to its workflow and states external dependencies.

| Area | Implementation |
| --- | --- |
| Entries | Fleet/crew editor, atomic CSV import with stable IDs and export. New imports are private. |
| Payments | GBP invoice ledger, partial payments, due dates, status, CSV import/export and approved external checkout URLs. No card storage or money movement. Settlement remains an office/provider reconciliation task. |
| Declarations | Boat/race scoped submission, compliance confirmation, retirement/DNS, accepted/queried review and missing declarations after finished races. Resubmissions return to review. |
| Yacht clubs and daily prizes | Club recipient/class filters, explicit prize assignments, published-results-only daily packs, tied result positions, CSV/text export and export history. Packs regenerate whenever their source results/prizes change. |
| Scheduled distribution | Vercel Cron calls `/api/club-delivery` at **17:00 UTC** daily (18:00 BST / 17:00 GMT). Disabled without approved delivery credentials. Idempotent gateway requests and durable sent/failed logs. |
| Shoreside | Date/time, club/town venue, linked map pin, social/prizegiving/briefing/family/activation categories, audience and release control. |
| Communications | News, course release, race delay, committee, briefing replay, social and weather messages; discipline/class/audience targeting. Public feeds exclude restricted audiences. In-app polling updates while open; no native push service. |
| Weather | Summary/detail, provider/source link, issue/expiry, committee approval and release. Existing GPS/weather adapter accepts documented `reports` / `observations` envelopes as well as legacy formats. |
| Benefits | Active, dated competitor-only wallet with partner, terms, code and link. |
| Crew codes | One revocable, 128-bit random registration code per boat, hashed at rest, 90-day expiry; seven-day HttpOnly/SameSite cookie. Rotation/revocation invalidates sessions on next request. |
| All-fleet tracking | Last report/staleness table for every class and boat. Boat profile sharing and GPS sharing are separate; GPS is private unless explicitly approved. |
| Role hub | `/hub` routes spectators, competitors, media and staff. `/crew` provides personal programme, class course map, crew edits, declarations, class updates, forecasts and benefits. Choosing a role is not an authorisation grant. |

## Email delivery connection

Configure these **only on the organiser Vercel project**, with an organiser-approved gateway:

- `CLUB_DELIVERY_URL`: HTTPS gateway accepting the JSON below.
- `CLUB_DELIVERY_ALLOWED_HOSTS`: exact comma-separated approved hostnames.
- `CLUB_DELIVERY_TOKEN`: server-side bearer token.
- `CRON_SECRET`: Vercel Cron authentication secret.

The gateway must accept `POST` with bearer authentication and honour `Idempotency-Key` across concurrent/retried requests. JSON body: `{ to, subject, text, attachments: [{ filename, content, contentType }] }`; attachment `content` is base64 CSV. A successful 2xx response confirms gateway acceptance; optional `x-message-id` is recorded. This does not prove final inbox delivery. The app never accepts arbitrary recipient addresses in a scheduled request; it uses active club records from the protected store. No emails were sent during implementation.

Packs contain published results and manually confirmed prize assignments. Draft results, emergency contacts, crew records, payments, declarations and tracking coordinates are excluded. The schedule sends only on dates with published results. Corrected published packs are sent on a later scheduled run with different content; manual exports are available immediately.

## Deployment and operational limits

Both existing Vercel projects build this repository. Preserve **all deployment URL** Vercel Authentication on `cowesweek`. `cowesweek-live` retains `COWES_PUBLIC_ONLY=1`: organiser APIs deny access there, while `/api/competitor` allows only authenticated, boat-scoped operations. Both use the existing private Blob store. No production records are migrated or replaced by this update.

Official tracking/weather, payment processing, native push, app-store binaries and background phone GPS require the respective providers/access; this update does not represent those as connected. The responsive website works on iPhone/Android, but it is not a native tracking app. Media sees public information; restricted media/staff records remain within the protected office until a dedicated staff identity system is connected.

The existing 4 MB single-document store and 500-record import limit remain. A high-volume, continuous all-fleet tracker should move to a suitable database before event production use.

## Verification

`pnpm test` covers persistence/concurrency, spectator scoring/privacy, the new operations validation and pack generation, and crew API authentication/authorisation. Tests use isolated fixtures and mocked storage/provider responses. Production builds and browser navigation/visual checks validate the delivered pages. Preview lacks production storage credentials, so live persistence is checked through the service tests and production readback rather than by writing test records into the regatta's saved data.

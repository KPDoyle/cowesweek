# Cowes Week Live

Independent sailing and powerboat spectator platform and protected event workspace.

- Spectators: https://cowesweek-live.vercel.app
- Organisers: https://cowesweek.vercel.app/office
- Repository: https://github.com/KPDoyle/cowesweek

## Spectator experience

Official Isle of Wight flag, island branding, detailed OpenStreetMap chart with OpenSeaMap seamarks, NASA satellite overview and MapLibre 3D perspective. Shared-clock simulated or imported GPS replay; course-aware on-water order and projected IRC order; waypoint events, boat profiles, favourites, speed comparisons, VMG, estimated manoeuvres, laylines, venue rotation, shoreline viewpoints and optional browser geolocation. Public programme, published class results, low-point series scores with dead heats, protected DNE scores, configurable discards and A8-style ties. Published media and sponsors support centre, class, boat, mark, venue and replay placements. A server-rendered text view works without the interactive map.

## Organiser workspace

Boat registration, crew contacts, readiness and scrutineering, race programme, configurable course geometry and GeoJSON import, results, protests, incidents, berths, notices and audit history. Race Studio manages course points, series, media, sponsorships, public events, conditions, viewpoints and GPS CSV/single-boat GPX imports. GPS imports accept up to 500 reports per atomic batch. Public CSV, GPX, KML and JSON recordings export up to 20,000 reports per request; use individual-boat exports for larger recordings.

## Deployment and access

Both Vercel projects build the same GitHub repository with Next.js. Keep Vercel Authentication enabled for **all deployment URLs of the organiser project**. The public project sets `COWES_PUBLIC_ONLY=1`; private data and ingestion APIs return 403 and `/office` returns 404 there. `/api/public` and exports use a field allow-list, exclude draft content, exclude boats whose public sharing is disabled and exclude unpublished results. They never include emergency contacts, crew, checks, berth assignments, safety incidents, protests or audit records.

Both projects use the private Vercel Blob store via `BLOB_STORE_ID` and project OIDC. Private writes require canonical ETags, validate linked records and commit batches atomically. Conflicts return 409. Preview deployments cannot use production records. The document limit is 4 MB; move high-throughput multi-event deployments to a database. The former ChatGPT Site has no runtime role.

## Approved provider adapters

Organiser-only `/api/ingest` supports manual synchronisation of normalised HTTPS tracking and weather JSON. Configure `TRACKING_FEED_URL`, `TRACKING_FEED_ALLOWED_HOSTS` and optional `TRACKING_FEED_TOKEN`; equivalent `WEATHER_` settings apply. Tokens stay server-side. Tracking JSON: `{ "reports": [{ "boatId": "existing-id", "raceId": "existing-race", "time": "ISO UTC", "lat": 50.779, "lon": -1.302, "speed": 8, "heading": 225 }] }`. Weather JSON: `{ "observations": [{ "discipline": "sailing", "windSpeed": 14, "windFrom": 225, "tideSpeed": 1.8, "tideDirection": 90, "tackAngle": 45, "time": "ISO UTC" }] }`. Tracking upserts duplicate boat/race/timestamp reports. Provider-specific endpoints, licences and approved broadcast sources must be supplied by the organiser.

## Cowes Week and Nautical Cloud integration

The spectator footer links to the official Cowes Week site. The organiser's GPS & feeds panel links to Cowes Week and Nautical Cloud and reports whether approved tracking and weather endpoints are configured. Official Cowes Week pages are linked as the authority; this app does not scrape them or imply an official partnership.

Nautical Cloud documents YB Tracker integration, but its public documentation does not provide API endpoint or credential instructions. When the event organiser and provider supply an approved endpoint, the existing server-side tracking adapter can consume normalised HTTPS position data; the weather adapter accepts normalised observations. Set TRACKING_FEED_URL, TRACKING_FEED_ALLOWED_HOSTS, and optional TRACKING_FEED_TOKEN, plus the equivalent WEATHER_ settings, in the protected organiser Vercel project only. Then use Check feed configuration and Synchronise in Race Studio. Do not expose tokens to the public project.

Nautical Cloud entries, official results, notices, payments, protests, and powerboat timing are not connected by this adapter. Connect them only against an authorised vendor API/export specification and agreed field mapping. Until then, the organiser workspace remains the place to review and publish those records.

## Demonstration and limits

Seeded boats, crews, races, results and conditions are fictional. Official tracking, weather and video are disconnected until configured. Imported reports show last-known recorded positions at the shared clock, with stale-data flags; simulated positions are clearly labelled. Course proximity and projected finishes are estimates. Published finish records remain authoritative. The series engine supports the listed low-point rules and organiser points overrides, rather than every possible sailing instruction. Satellite imagery is a coarse NASA global overview; 3D is a pitched map, without terrain or modelled boat hulls.

## Development and verification

Node 22.13+ and pnpm: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test`.

Tests cover private persistence, validation, atomic edits, concurrency, preview isolation, public redaction/sharing, saved geometry, UK start times, shared-clock GPS, provisional order, replay, manoeuvres, dead heats, discards, DNE, series ties, CSV portability and 1,000-boat calculation performance. Map clustering reduces visible markers for dense fleets. Browser and production API checks accompany deployment.

## Regatta operations update

Open **Regatta operations** in the office rail, or `/office?view=operations`, for entries import, payment ledger, declarations, automated club results/prize packs, shoreside schedules, targeted communications, official forecasts, benefits, registration codes and all-fleet tracking coverage. `/hub` offers role selection; `/crew` is the boat-code protected competitor portal. GPS locations are private unless the office explicitly approves public tracking separately from the boat profile.

See [the operational review and connection guide](docs/OPERATIONS.md) for coverage, scheduled email gateway configuration and verification limits. New workflows require no production data migration.

## Organiser platform template

The office now opens with **Platform blueprint**: a reusable event vision, links to working modules, nine editable existing-system connection plans, a four-stage race-day walkthrough, pilot acceptance checklist and a downloadable platform brief. Plans are saved as organiser records and excluded from public feeds. Planning stages do not activate supplier connections. The current mobile app, official scoring, course setting, payment provider and tracking / weather systems remain part of the proposed operating model.

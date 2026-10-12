# Local D1

The production DB is provisioned and migrated by Sites. Local DB state is separate.

Before `pnpm dev`, apply committed migrations with:

```
pnpm exec wrangler d1 migrations apply site-creator-d1 --local --config wrangler.local.jsonc --persist-to .wrangler/state
```

The same local database name and persistence folder are used by the application starter. Never use this local config to deploy production; the Sites deployment uses the generated config and platform-managed bindings.

`pnpm test` uses an in-memory SQLite adapter against the actual request handler and committed schema migration, without running a preview server.

# Mobility Pulse AI

A functional Next.js MVP for collecting, analysing and visualising public German transport information. The UI follows the supplied Mobility Pulse dashboard reference; all counts and charts are derived from SQLite records.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add Langdock credentials if AI analysis is required.
3. Create and seed the database: `npm run db:push && npm run db:seed`
4. Start locally: `npm run dev`
5. Open `http://localhost:3000`

## Langdock

The server uses Langdock's provider-compatible OpenAI Chat Completions endpoint (`/openai/eu/v1/chat/completions`) with bearer authentication. Set `LANGDOCK_API_KEY`, `LANGDOCK_MODEL`, and optionally a deployment-specific regional `LANGDOCK_BASE_URL`. Responses are parsed and validated with Zod. Without credentials, collection and source management continue while AI analysis is skipped.

The Beratungsassistent also supports the Lina research agent through Langdock's Agents API. Configure `LANGDOCK_LINA_API_KEY` and `LANGDOCK_LINA_AGENT_ID` only on the server. The Lina key is never sent to the browser. Standard AI and Lina reports, cache entries, follow-up messages, failures, and retries are stored separately by provider. `LANGDOCK_LINA_MAX_STEPS` limits agent tool steps per request and defaults to `4`.

## Data integrity

- The seed adds source definitions only—no fabricated discoveries or KPIs.
- Canonical URLs and SHA-256 content hashes prevent repeated ingestion.
- Every discovery retains its original item and public source URL.
- AI interpretation is labelled separately from source facts.
- Coordinates are stored only when the AI can tie them to an explicit location; otherwise the map omits the item.
- The Germany map uses the official BKG VG250 WFS (16 Länder and national outline), licensed under dl-de/by-2-0 and attributed in the UI.

## Scanning

The Node runtime schedules scans at 08:00 and 16:00 Europe/Berlin and prevents overlapping runs within a process. The dashboard and Sources page also offer manual scanning. RSS/Atom and simple article pages are implemented. Generic API, OParl and TED records remain visible as endpoint types but report an explicit endpoint-configuration error until a concrete response mapping is supplied; there is no silent fallback.

For multi-instance production deployment, replace the in-process scheduler/lock with the host's singleton cron and a durable database lock.

## Verification limits

Langdock analysis cannot be exercised without the user's credentials and model name. Public sources may change URLs, block automated requests, or return unsupported HTML; connection and scan errors are shown on the Sources page.

## Deployment from `develop`

Pushes to `develop` run tests, lint, and the production build in GitHub Actions. When all checks pass, the workflow connects to the VPS and runs `deploy/deploy.sh`. The VPS keeps its own `.env` and SQLite database; neither is stored in Git.

Initial server setup requires the GitHub Actions deploy public key in `/root/.ssh/authorized_keys`, followed by `deploy/bootstrap-vps.sh`. Production runs as two isolated Docker Compose services on a dedicated network. The web application is published on port `3050`; the advisor worker has no public port. Existing reverse proxies and unrelated containers are not modified.

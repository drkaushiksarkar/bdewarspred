# Bangladesh Early Warning, Alert, and Response System (EWARS)

> AI-enabled surveillance and analytics platform built for the Ministry of Health & Family Welfare, Bangladesh with technical leadership from IMACS.

## Highlights
- Multi-disease dashboard for dengue, malaria, and acute watery diarrhoea with URL-persisted filters and responsive layouts.
- District and sub-district intelligence using MapLibre choropleths backed by PostgreSQL disease predictions.
- Climate influence and model diagnostics fed by curated analytics endpoints and in-app helper content.
- Scenario simulation, acceleration alerts, and national baselines surfaced through shadcn-driven widgets.
- Genkit-powered assistants for natural-language QA, data insights, and report generation with Gemini 2.5 Flash.
- Credential-based access via NextAuth, PDF export for every dashboard tab, and context-rich help drawers.

## Architecture & Tech Stack
- Next.js 15 App Router with TypeScript (`src/app`) and server actions.
- Tailwind CSS, shadcn/ui, Recharts, and MapLibre for the design system and visualizations.
- API routes in `src/app/api/*` stream data from PostgreSQL through `src/lib/db.ts` and `src/lib/data-db.ts`.
- NextAuth credential provider (`src/lib/auth.ts`, `src/middleware.ts`) with role scaffolding for future RBAC.
- Genkit flows (`src/ai/flows/*`) orchestrating Gemini models for insights, reports, and data-driven Q&A.

## Prerequisites
- Node.js 18.17+ (Next.js 15 requirement) and npm 9+.
- PostgreSQL 14+ accessible from the app server (local or remote).
- Google Gemini API key for Genkit (`GEMINI_API_KEY`).
- OpenWeatherMap API key (`OPENWEATHER_API_KEY`) for live climate panels.

## Environment Configuration
Create `bdewarspred/.env.local` (do not commit secrets). Sample values:

```env
# Authentication
NEXTAUTH_SECRET=replace-with-random-string
NEXTAUTH_URL=http://localhost:9002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ewars
DB_USER=postgres
DB_PASSWORD=postgres
DB_SCHEMA=dashboard

# External APIs
OPENWEATHER_API_KEY=your-openweather-key
GEMINI_API_KEY=your-gemini-key
```

Add any remote database credentials as `PG_HOST`, `PG_PORT`, `PG_DB`, `PG_USER`, `PG_PASS` if different from the defaults. Restart the dev server whenever the file changes.

## Installation & First Run
1. Install dependencies: `npm install`.
2. Populate `.env.local` with the values above.
3. Prepare the database (see the next section) so API routes resolve against PostgreSQL.
4. Start the app: `npm run dev` (serves on `http://localhost:9002`).

## Database Workflow
- `npm run db:setup` bootstraps the database, schema, tables, and views defined in `database/schema.sql`.
- `npm run db:migrate` ingests historical JSON/CSV predictions into PostgreSQL (see `database/migrate.ts`).
- `npm run db:reset` reruns both scripts if you need a clean slate.
- Detailed instructions, ERDs, and verification queries live in `database/README.md`, while migration status is tracked in `MIGRATION_COMPLETE.md`.

## Running & Tooling
- `npm run dev` – Next.js dev server with Turbopack on port 9002.
- `npm run build` – Production build; respects `next.config.ts` overrides for lint/type errors.
- `npm run start` – Serve the production build on port 9002.
- `npm run lint` – Next.js ESLint harness (disabled during build by design).
- `npm run typecheck` – Standalone TypeScript validation.
- `npm run genkit:dev` / `npm run genkit:watch` – Launch Genkit flows (`src/ai/dev.ts`) for local agent development.

## Application Walkthrough
- **Overview tab**: National metrics, time-series charting with uncertainty bands, live weather tiles, and acceleration alerts from `/api/acceleration-alerts`.
- **Alert tab**: District readiness gauges, weekly change monitors, and baseline comparisons powered by DB-derived aggregates.
- **Disease Maps tab**: MapLibre choropleths for dengue and diarrhoea predictions with malaria risk overlays via `/api/disease-map-predictions`.
- **Drilldown tab**: Climate impact explorer and feature-importance visualizations consuming `/api/climate-influence` and `/api/feature-importance`.
- **Simulation tab**: Scenario timelines, response levers, and generated insights intended for preparedness exercises.
- **Model tab**: Performance KPIs (R², SMAPE, coverage) and climate feature cards fetched from `/api/model-metrics` and `/api/climate-influence`.
- **Data Entry tab**: UI scaffolding for upcoming manual/CSV/API ingestion flows, currently presented as guided placeholders.

## Data & Modeling Assets
- Disease predictions originate from the PostgreSQL schema `dashboard.*`, with helper utilities in `src/lib/data-db.ts`.
- Legacy JSON datasets remain in `src/lib/model-output.json` and `src/lib/diarrhoea-data.json`; some widgets still fall back to these during transition.
- Climate correlations, acceleration alerts, and feature importance derive from SQL views defined in `database/schema.sql`.
- Analytical notebooks for epidemiological modelling are stored under `models/notebooks/*.ipynb` (malaria, dengue, AWD pipelines).

## Generative AI Assistants
- `data-qa` flow answers natural-language questions using dataset descriptions and samples.
- `generate-report-from-prompt` returns Gemini-authored PDF/CSV payloads for ad-hoc reporting.
- `data-insights-from-prompt` summarizes trends and suggests visualizations for dashboards.
- Run `npm run genkit:dev` alongside the app to work with these flows; ensure `GEMINI_API_KEY` is set and Google credentials are configured if required.

## Codebase Map
```text
bdewarspred/
├── src/
│   ├── app/                # App Router pages, layouts, middleware, API routes
│   ├── components/         # Dashboard widgets, layout chrome, shadcn wrappers
│   ├── ai/                 # Genkit configuration and flow definitions
│   ├── lib/                # Data access, types, utilities, static datasets
│   └── styles              # (via src/app/globals.css) Tailwind base styles
├── database/               # SQL schema, migration scripts, database docs
├── docs/blueprint.md       # Interaction and design blueprint
├── public/                 # Static assets and map resources
└── models/notebooks/       # Jupyter notebooks for forecasting workflows
```

## Additional Documentation
- `AUTHENTICATION_SETUP.md` – NextAuth configuration, demo credentials, and production hardening guidance.
- `DATABASE_QUICKSTART.md` – Step-by-step walkthrough for provisioning PostgreSQL.
- `MIGRATION_COMPLETE.md` – Status log of the JSON → PostgreSQL migration.
- `docs/blueprint.md` – Product blueprint, UX conventions, and visual guidelines.

## Known Limitations & Next Steps
- Several charts (for example malaria risk panels) still use placeholder JSON until full database ingestion is complete.
- Data Entry flows are UI-only; backend services and validation need to be wired before enabling uploads.
- Genkit flows currently return Gemini-generated prose/base64 content; integrate with curated datasets before exposing to end users.
- Harden authentication by replacing demo users with a persistent user store and enabling HTTPS-secure cookies in production.
- Tighten build gates by re-enabling TypeScript and ESLint checks once outstanding issues are resolved.

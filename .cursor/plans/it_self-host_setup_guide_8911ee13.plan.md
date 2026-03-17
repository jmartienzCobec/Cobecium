---
name: IT self-host setup guide
overview: Create a single, step-by-step guide for the Chief IT officer to deploy the Convex self-hosted backend, dashboard, and web app on internal servers (replacing Netlify), including prerequisites, env configuration, optional production build path, and troubleshooting.
todos: []
isProject: false
---

# Internal server setup guide for Chief IT officer

## Goal

One document the CIO can follow to run the full Lynx stack on internal server(s): Convex backend + dashboard (Docker), web app (Docker today; optional production build path), and related config. This replaces reliance on Netlify for hosting the app.

## Current architecture (no code changes required to run)

- **Backend** – `ghcr.io/get-convex/convex-backend:latest`, ports 3210 (API) and 3211 (site). Data in Docker volume `convex_data`.
- **Dashboard** – `ghcr.io/get-convex/convex-dashboard:latest`, port 6791. Used to view data and set Convex env vars (Clerk, first admin, orchestrator, etc.).
- **App** – Built from repo [Dockerfile](Dockerfile); runs Vite dev server (port 5173) + `convex dev` (push only). Source is mounted; no production build in current setup.

Existing docs to leverage: [docs/CONVEX_LOCAL_SETUP.md](docs/CONVEX_LOCAL_SETUP.md), [docs/AUTH_AND_ADMIN_SETUP.md](docs/AUTH_AND_ADMIN_SETUP.md), [AGENTS.md](AGENTS.md) (Convex CLI / env conflict).

## What the new guide will contain

### 1. Audience and scope

- Chief IT officer; internal server(s); moving off Netlify.
- Covers: Convex (backend + dashboard), Dockerized web app, env vars, optional HTTPS/reverse proxy and production-style serving.

### 2. Prerequisites

- Docker and Docker Compose on the host.
- Git (clone repo).
- (Optional) Tailscale or internal DNS so staff reach the server by hostname (e.g. `lynx.internal` or existing Spark hostname).
- Clerk account unchanged (Clerk remains external; only hosting moves in-house).

### 3. Step-by-step setup

- **Clone and env**
  - Clone repo; create `.env.local` from a **template** (see below). Do **not** set `CONVEX_DEPLOYMENT` when using self-hosted (per [AGENTS.md](AGENTS.md)).
- **Start stack**
  - `docker compose --env-file .env.local up --build`.
- **First-time Convex admin key**
  - `docker compose exec backend ./generate_admin_key.sh`; put the key into `.env.local` as `CONVEX_SELF_HOSTED_ADMIN_KEY`.
  - Restart: `docker compose --env-file .env.local up`.
- **Dashboard**
  - Open dashboard URL (e.g. `http://<server>:6791`), enter admin key. In dashboard **Settings → Environment variables**, set Convex backend vars: `CLERK_JWT_ISSUER_DOMAIN`, optionally `LYNX_FIRST_ADMIN_CLERK_ID`, `ORCHESTRATOR_DOCS_URL`, `ORCHESTRATOR_BASE_URL`, `HYDRA_KEY` (see [docs/AUTH_AND_ADMIN_SETUP.md](docs/AUTH_AND_ADMIN_SETUP.md)).
- **App URL**
  - App at `http://<server>:5173`. Use `VITE_CONVEX_URL` (and related URLs in `.env.local`) so the **browser** can reach Convex (use server hostname, not `127.0.0.1`, when accessing from other machines).

### 4. Environment variable reference (in the guide)

**In `.env.local` (app + compose):**


| Variable                                                                  | Purpose                                                                                                                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_SELF_HOSTED_ADMIN_KEY`                                            | From `generate_admin_key.sh`; required for app to push Convex functions.                                                           |
| `VITE_CONVEX_URL`                                                         | URL the **browser** uses to reach Convex (e.g. `http://lynx.internal:3210`).                                                       |
| `VITE_CLERK_PUBLISHABLE_KEY`                                              | Clerk publishable key (from Clerk Dashboard).                                                                                      |
| `CONVEX_CLOUD_ORIGIN`, `CONVEX_SITE_ORIGIN`, `NEXT_PUBLIC_DEPLOYMENT_URL` | For backend/dashboard; set to same base URL as Convex (e.g. `http://lynx.internal:3210`, `...:3211`) when using internal hostname. |
| `VITE_ORCHESTRATOR_DOCS_URL`                                              | Optional; docs link in app header.                                                                                                 |


**In Convex Dashboard (Settings → Environment variables):**

- `CLERK_JWT_ISSUER_DOMAIN`, optional `LYNX_FIRST_ADMIN_CLERK_ID`, optional `ORCHESTRATOR_DOCS_URL`, `ORCHESTRATOR_BASE_URL`, `HYDRA_KEY`.

### 5. Replacing Netlify

- Today Netlify builds the SPA (`npm run build`) and serves `dist` with an SPA rewrite. On the internal server:
  - **Option A (current):** Use the existing app container (Vite dev server). Simple, good for internal use; no separate build step.
  - **Option B (production-style):** Add a small “production app” path: build the SPA once (e.g. in CI or on the server), serve `dist` with a static server or nginx in a second Docker setup. The guide will describe Option A in full; Option B can be a short “Optional: serving production build” subsection (high-level steps only, e.g. build with `npm run build`, serve `dist` via nginx/Caddy and proxy to it).

### 6. Optional: HTTPS and reverse proxy

- If the CIO wants HTTPS on the internal server: put a reverse proxy (e.g. Caddy or nginx) in front; proxy to 5173 (app), 6791 (dashboard), 3210 (Convex API). Use internal CA or existing PKI for certs. One short subsection with pointers (no full config).

### 7. Data and operations

- Convex data: Docker volume `convex_data`. Backups: backup the volume (or the host path Docker uses). Wipe: `docker compose down -v` then regenerate admin key and reconfigure `.env.local`.
- Upgrades: backend/dashboard use `:latest`; pin tags in `docker-compose.yml` if needed.

### 8. Troubleshooting

- Point to [docs/CONVEX_LOCAL_SETUP.md](docs/CONVEX_LOCAL_SETUP.md) “If something fails” (app hang, dashboard “can’t connect”, Vite can’t reach Convex, dashboard empty). Add one line: if CLI errors about `CONVEX_DEPLOYMENT`, ensure it is unset in `.env.local` (see [AGENTS.md](AGENTS.md)).

### 9. Where the guide will live and template

- **Location:** `docs/INTERNAL_SERVER_SETUP.md` (or `docs/IT_SELF_HOST_GUIDE.md`).
- **Env template:** Either (1) add a committed **env template** file (e.g. `docs/env.local.example` or `env.example` with a note in `.gitignore` that the *example* is committed but `.env.local` is not), or (2) embed a copy-paste block in the guide. Recommendation: add `docs/env.local.example` with all variable names and short comments (no secrets); guide says “copy to `.env.local` and fill in values.” This gives the CIO one place to look and keeps secrets out of the repo.

## Out of scope for this guide

- Changing Clerk to self-hosted auth (Clerk stays as SaaS).
- Detailed reverse-proxy configs (only pointers).
- Netlify-specific cleanup (e.g. removing `netlify.toml` or Netlify references in footer) — can be a separate change.

## Deliverables

1. **New guide** – `docs/INTERNAL_SERVER_SETUP.md` (or agreed name) with sections above: prerequisites, step-by-step setup, env reference, Netlify replacement (Option A + optional B), optional HTTPS, data/ops, troubleshooting.
2. **Env template** – `docs/env.local.example` (or repo-root `env.example` if preferred) listing all `.env.local` variables with comments so the CIO can copy to `.env.local` and fill in.

No changes to Dockerfile, docker-compose.yml, or start.sh are required for the guide to be accurate; the guide will describe the current behavior. Optional production build (Option B) can be a brief subsection without implementing a new Dockerfile in this plan.
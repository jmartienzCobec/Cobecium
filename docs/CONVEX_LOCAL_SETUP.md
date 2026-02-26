# Convex local setup (self-hosted in Docker)

This project uses **separate Docker services** for the Convex backend, dashboard, and app so the app container stays small and startup is reliable (no hang). Same pattern as other services on your Spark (e.g. LM Studio, AnythingLLM).

---

## Quick start

0. **Create `.env.local`** (required for the app service)
   ```bash
   cp .env.example .env.local
   ```
   Leave `CONVEX_SELF_HOSTED_ADMIN_KEY` empty for now; you’ll set it after step 2.  
   **Do not set** `CONVEX_DEPLOYMENT` when using self-hosted (the CLI will refuse to push and the dashboard will stay empty). The app container mounts `.env.local` read-only so `convex dev` cannot re-inject `CONVEX_DEPLOYMENT` into it.

1. **Start everything**
   ```bash
   docker compose up --build
   ```

2. **First time only: generate Convex admin key**
   ```bash
   docker compose exec backend ./generate_admin_key.sh
   ```
   Copy the printed key into `.env.local` as `CONVEX_SELF_HOSTED_ADMIN_KEY=...`.

3. **Restart so the app can push Convex functions**
   ```bash
   docker compose --env-file .env.local up
   ```

4. **URLs**
   - **App:** http://localhost:5173  
   - **Convex dashboard:** http://localhost:6791 (enter the admin key when prompted)

---

## Access from Windows over Tailscale

Docker publishes ports on all interfaces (0.0.0.0), so from your Windows machine on the same Tailscale network you can use your Spark’s hostname (e.g. `cobec-spark`).

1. **Set Tailscale-friendly URLs** in `.env.local` (replace `cobec-spark` with your Spark’s Tailscale name or IP):

   ```bash
   CONVEX_SELF_HOSTED_ADMIN_KEY=<from generate_admin_key.sh>
   VITE_CONVEX_URL=http://cobec-spark:3210
   CONVEX_CLOUD_ORIGIN=http://cobec-spark:3210
   CONVEX_SITE_ORIGIN=http://cobec-spark:3211
   NEXT_PUBLIC_DEPLOYMENT_URL=http://cobec-spark:3210
   ```
   Use `VITE_CONVEX_URL=http://cobec-spark:3210` (not `127.0.0.1`) so the **browser** can reach Convex when you open the app at `http://cobec-spark:5173` from another device.

2. **Start with env**
   ```bash
   docker compose --env-file .env.local up --build
   ```

3. **From Windows browser**
   - **App:** http://cobec-spark:5173  
   - **Convex dashboard:** http://cobec-spark:6791  

Same idea as reaching LM Studio or AnythingLLM over Tailscale: one hostname, different ports.

---

## Architecture

| Service           | Image / build | Ports   | Role                          |
|------------------|---------------|---------|-------------------------------|
| `backend`        | convex-backend | 3210, 3211 | Convex API + data (SQLite in volume) |
| `dashboard`      | convex-dashboard | 6791 | Dashboard UI (browser talks to backend via `NEXT_PUBLIC_DEPLOYMENT_URL`) |
| `app`            | This repo     | 5173    | Vite dev server + `convex dev` (push only) |

The app container **does not** run the Convex backend binary; it only runs `convex dev` (to push functions) and Vite. That avoids the previous hang and keeps the app container light.

---

## Data and upgrades

- **Convex data** is in the `convex_data` Docker volume. To wipe and start fresh: `docker compose down -v` (then generate a new admin key and reconfigure `.env.local`).
- **Backend/dashboard images** use `:latest`. To pin versions, set the image tags in `docker-compose.yml` to a specific digest or tag.

---

## If something fails

- **App exits or hangs:** Check that `backend` is healthy: `docker compose ps`. The app waits for backend port 3210 before starting Convex dev and Vite.
- **Dashboard shows “can’t connect”:** Ensure `NEXT_PUBLIC_DEPLOYMENT_URL` (and from Windows, that it uses the Tailscale hostname) matches how the browser reaches the backend (e.g. `http://cobec-spark:3210`).
- **Vite app can’t reach Convex:** Set `VITE_CONVEX_URL` to the URL the **browser** uses to reach the backend (e.g. `http://cobec-spark:3210` when opening the app at `http://cobec-spark:5173`). Using `127.0.0.1:3210` only works when the browser is on the same machine as the backend.
- **Dashboard shows no tables/functions:** Ensure `CONVEX_DEPLOYMENT` is not set in `.env.local` when using self-hosted. If you see "CONVEX_DEPLOYMENT must not be set when ...", remove or comment out the `CONVEX_DEPLOYMENT` line, then restart the stack so `convex dev` can push.

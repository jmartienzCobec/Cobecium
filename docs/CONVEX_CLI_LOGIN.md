# Convex CLI: login, logout, and self-hosted

## Refreshing Convex credentials / switching accounts

If you have multiple Convex accounts and need the CLI to use a different account for this project:

1. **Log out** (clears the cached account):
   ```bash
   npx convex logout
   ```

2. **Log in again** (browser will open; choose the account you need):
   ```bash
   npx convex login
   ```
   To force a fresh login and pick a different account:
   ```bash
   npx convex login --force
   ```

Credentials are stored in `~/.convex/config.json`. Changing only `.env.local` does **not** switch which Convex account the CLI uses—you need to run `logout` then `login` (or `login --force`).

---

## Self-hosted setup

This project can use **Convex self-hosted** (Docker backend). In that case:

- Set `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY` in your environment (e.g. in `.env.local`).
- Do **not** set `CONVEX_DEPLOYMENT`—the CLI will refuse to run if both self-hosted vars and `CONVEX_DEPLOYMENT` are set.

See [CONVEX_LOCAL_SETUP.md](CONVEX_LOCAL_SETUP.md) for full Docker setup and [AGENTS.md](../AGENTS.md) for the self-hosted vs cloud conflict and codegen notes.

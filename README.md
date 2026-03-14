# Lynx

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

**Self-hosted setup:** This project can use Convex self-hosted (Docker). In that case, set `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY` in your environment (e.g. in `.env.local`) and do **not** set `CONVEX_DEPLOYMENT`. See [docs/CONVEX_LOCAL_SETUP.md](docs/CONVEX_LOCAL_SETUP.md) and [AGENTS.md](AGENTS.md) for details.

#!/bin/sh
set -e

# Wait for Convex backend to be ready (same network as backend service)
# Use Bun for the check — the app image has no curl
echo "Waiting for Convex backend..."
until bun -e "const r=await fetch('http://backend:3210/version'); process.exit(r.ok?0:1)" 2>/dev/null; do
  echo "  backend not ready, retrying in 2s..."
  sleep 2
done
echo "Convex backend is up."

# Push Convex functions and watch (background); uses CONVEX_SELF_HOSTED_URL + CONVEX_SELF_HOSTED_ADMIN_KEY from env
echo "Starting convex dev..."
bunx convex dev &
CONVEX_PID=$!

# Start Vite dev server (foreground so container stays up)
echo "Starting Vite..."
exec bun run dev --host

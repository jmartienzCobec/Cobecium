# Slim app image: Vite + Convex CLI (push only). Backend runs in convex-backend service.
FROM oven/bun:latest

WORKDIR /app

# Install deps only; app code is mounted for dev
COPY package.json bun.lock bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .

EXPOSE 5173

# Convex dev pushes to CONVEX_SELF_HOSTED_URL; Vite serves the app
ENTRYPOINT ["sh", "-c", "chmod +x start.sh && ./start.sh"]

import type { AuthConfig } from "convex/server";

/**
 * Clerk JWT issuer domain (Clerk Frontend API URL).
 * Set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard (or .env for local dev).
 * Format: https://verb-noun-00.clerk.accounts.dev (dev) or https://clerk.<your-domain>.com (prod).
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

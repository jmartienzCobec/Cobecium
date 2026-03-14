# Auth and admin setup (Clerk + Convex)

Lynx uses **Clerk** for sign-in and **Convex** for identity and roles. The Convex backend validates Clerk JWTs and stores users in the `lynxUsers` table with a `role` (`"admin"` or `"user"`).

## Environment variables

### Frontend (Vite / `.env` / `.env.local`)

- **`VITE_CLERK_PUBLISHABLE_KEY`** – From [Clerk Dashboard → API Keys](https://dashboard.clerk.com/~/api-keys) (React / Publishable key).

### Convex (Dashboard only for Convex Cloud)

The Convex **backend** does not read `.env` or `.env.local`. It only uses variables set in the **Convex Dashboard** for the deployment you’re pushing to. If you see “Environment variable CLERK_JWT_ISSUER_DOMAIN is used in auth config file but its value was not set”:

1. Open your deployment’s **Settings → Environment variables** in the [Convex Dashboard](https://dashboard.convex.dev).
2. Ensure you’re on the **same deployment** (and branch) that `convex dev` uses (e.g. **Development** for `dev:ceaseless-elk-79`). Development and Production often have separate env var lists.
3. Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk Frontend API URL (e.g. `https://prime-dingo-70.clerk.accounts.dev`), save, then run `npx convex dev` again.

Set these in the **Convex dashboard** (Settings → Environment Variables):

- **`CLERK_JWT_ISSUER_DOMAIN`** – Clerk Frontend API URL (JWT issuer).
  - **Development:** `https://<your-clerk-frontend-api>.clerk.accounts.dev` (e.g. `https://prime-dingo-70.clerk.accounts.dev`).
  - **Production:** `https://clerk.<your-domain>.com` if you use a custom domain.
  - You can copy this from the Clerk Dashboard (API Keys or Configure → Paths).

- **`LYNX_FIRST_ADMIN_CLERK_ID`** *(optional)* – Clerk user ID of the first admin. When the app has **no** admin yet and the signing-in user’s ID matches this value, `ensureMe` will set their role to `"admin"`.  
  - **How to get the Clerk user ID:** In [Clerk Dashboard → Users](https://dashboard.clerk.com/~/users), open a user and copy the **User ID** (e.g. `user_2abc...`). Or temporarily log `identity.subject` in the app (e.g. in a debug component that calls `useUser()` from Clerk and displays the id).

After adding or changing these, run `npx convex dev` or `npx convex deploy` so the Convex backend picks them up.

## First admin

1. Set `LYNX_FIRST_ADMIN_CLERK_ID` in Convex to your Clerk user ID.
2. Sign in with that Clerk account and open the app so `ensureMe` runs (it runs automatically when authenticated).
3. That user will get `role: "admin"` and can open **Admin** and **Analytics**, and can elevate/demote other users.

If you don’t set `LYNX_FIRST_ADMIN_CLERK_ID`, you can still create the first admin by inserting or updating a row in the `lynxUsers` table in the Convex dashboard (set `role` to `"admin"` for the desired `clerkUserId`).

## Admin-only features

- **Routes:** `/admin` and `/analytics` are wrapped in `AdminOnlyRoute`; non-admins are redirected to `/`.
- **Nav:** The **Admin** and **Analytics** links in the header are shown only when `getMyRole` returns `"admin"`.
- **Backend:** `getHuntCountsByState` (analytics) and `listForAdmin` / `setRole` require the caller to be an admin; otherwise they throw.

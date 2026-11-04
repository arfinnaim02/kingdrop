# KINGDROPP

**Rule Your Style.** KINGDROPP is a premium men's fashion storefront built with Next.js 16, React 19, TypeScript, PostgreSQL, Prisma and Tailwind CSS 4.

This repository is independent from the Gameon Garb website. Treat its database, deployment, uploads, payment provider credentials, email sender, social logins, tracking IDs, courier configuration and Telegram integrations as **separate services**.

## Current migration status

Phases 1–3A establish the brand foundation, premium storefront presentation, and admin/account/email messaging. Phase 3B introduces KD-prefixed new orders, coordinated Telegram identifiers, and guarded initial setup. Full separation is still incomplete until deployment-specific integration verification and legal/content cleanup.

**Before public launch:** the logo and favicon are still original placeholder assets pending official KINGDROPP artwork. Database-managed product/catalogue, campaign imagery, About/Terms/Privacy content, and any external provider setup still need review. Existing records are not rewritten by the new KD order prefix. Do not deploy as a production KINGDROPP storefront until these remaining issues and external configurations have been verified.

## Stack

- Next.js App Router, React and TypeScript
- Prisma ORM with PostgreSQL (use a separate KINGDROPP Neon database)
- Tailwind CSS and existing CSS design tokens
- User accounts, product catalogue, inventory and order administration
- COD/bKash integration architecture, notifications, courier integrations and analytics

## Getting started (development only)

1. Install Node.js 22 or 24 and npm.
2. Clone this repository and run `npm ci`.
3. Create a **new**, isolated KINGDROPP PostgreSQL database.
4. Configure environment variables locally in `.env.local` or `.env` (both are gitignored). Never reuse credentials from the other website.
5. Apply migrations only after confirming the database URL belongs to KINGDROPP: `npx prisma migrate deploy`.
6. Generate the Prisma client with `npx prisma generate`.
7. Start the app using `npm run dev` and open `http://localhost:3000`.

**Do not run migrations or seeding against any existing database.** `npm run setup` now only generates the Prisma client. The new `npm run db:seed` is guarded, refuses non-empty databases, and requires verified KINGDROPP-specific environment variables. It never inserts demo products, orders or customers.

## Brand configuration

Public identity constants are defined in `src/lib/brand.ts`:

- Name: **KINGDROPP**
- Tagline: **Rule Your Style**
- Positioning: premium men's fashion
- Palette: dark neutrals, warm whites and subtle taupe accents

Official logo and favicon assets are intentionally **unchanged** until approved artwork is available.

## Site URL and SEO safety

Set `APP_URL` (preferred) or `NEXT_PUBLIC_SITE_URL` to the actual KINGDROPP origin once deployment is ready, for example the exact HTTPS address of your own deployment. Do **not** use a Gameon Garb domain.

Without a valid site URL, the Phase 1 configuration deliberately blocks indexing in `robots.txt`, omits a metadata-base override, and returns an empty sitemap. Production requires HTTPS. Review the robots/sitemap configuration after a domain is selected, and audit all routes before enabling indexing.

## Commands

```bash
npm ci
npx prisma generate
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run config:check  # offline check; does not connect to any provider
```

Run `npx prisma migrate deploy` **only** against an explicitly verified KINGDROPP database.

## Guarded initial database setup

The new `prisma/seed.ts` does not run without all of the following **manually verified** values in a private environment (never commit their real values):

- `DATABASE_URL` — a **new, empty** KINGDROPP PostgreSQL database
- `KINGDROPP_DATABASE_ISOLATED=true` — human confirmation that it is not the Gameon Garb database
- `KINGDROPP_SEED_CONFIRM=INITIALIZE_KINGDROPP_ONLY` — explicit initialization authorization
- `KINGDROPP_ADMIN_EMAIL` — KINGDROPP administrator email, not a demo account
- `KINGDROPP_ADMIN_PASSWORD` — a unique password with at least 16 characters

After manually checking those requirements, `npm run db:seed` creates only the initial SUPER_ADMIN and safe store settings (store offline/maintenance, COD and bKash disabled). It refuses a populated database and never overwrites accounts, orders, catalogue data, or existing settings. **This code-level guard is not proof of physical database isolation**; verify the Neon project/database and credentials yourself before execution.

**Order numbers:** new orders use `KD-20260001` onward with a dedicated PostgreSQL advisory lock. Old `GOG-` records, if any, are left unchanged. This does not migrate historical order numbers.

**Telegram:** button callbacks and webhook status parsing use the `kd:` prefix. Both outbound bot messages and inbound webhook handling require `KINGDROPP_TELEGRAM_ENABLED=true`; leave it unset until a separate bot token, chat ID, webhook secret and approved user list belong exclusively to KINGDROPP. Do not reuse historical callback buttons.

## Offline integration verification

Run `npm run config:check` in an environment where KINGDROPP variables are configured. It checks configuration presence, basic URL consistency, and common source-brand mixups, but **does not contact Neon, bKash, OAuth, Resend, Telegram or any external service**. It does not print secrets. The check is a preflight aid, not a substitute for verifying separate account ownership.

Keep `BKASH_PUBLIC_ENABLED` off and `NOTIFICATION_WORKER_ENABLED` off until dedicated provider accounts and callbacks are fully tested. Configure `APP_URL` as the actual HTTPS KINGDROPP origin. Verify courier/storage/tracking settings independently.

## Phase 4B — launch safety (review before deployment)

- **Fail-closed storefront:** the shop UI and order-creation API require `general.storeLive === true` and `general.maintenanceMode === false`. When missing, invalid or in maintenance, checkout is unavailable. Payment settings default to **both methods disabled** unless individually enabled. Existing shipping, pricing, coupons and inventory rules are not changed.
- **Session cookie isolation:** KINGDROPP now uses `kingdropp_session` and `kingdropp_order_access`, plus `kingdropp_oauth_*` transient cookies. The old `gog_*` auth cookies are **not accepted**, so previously signed-in KINGDROPP browsers will be signed out on rollout. Keep this change atomic with all login/register/OAuth/admin/order/payment handlers.
- **Password reset:** in production set `KINGDROPP_PASSWORD_RESET_EMAIL_ENABLED=true` only after verifying an isolated `RESEND_API_KEY`, `EMAIL_FROM`, and a HTTPS `APP_URL`. Until then recovery is unavailable (503); it never exposes reset tokens. The provider sends a 30-minute reset link, uses generic responses to avoid account enumeration, consumes tokens once, and revokes existing sessions.
- **Payment safety:** the mock bKash completion endpoint is restricted to non-production sandbox execution, even when `BKASH_MODE` is accidentally set to `sandbox` on a production deployment. Real payment gateway operations remain unchanged.\n- **Rate limiting:** sensitive login, registration, OAuth completion, password reset and order tracking endpoints call the distributed `strictRateLimit` adapter. In production it requires a dedicated KINGDROPP `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If missing or unreachable, the protected operations **deny requests**. Non-production retains local limits for development.
- **Testing:** run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` in an isolated development/staging checkout. Tests for store flags and simulated rate-limit failures do not connect to external services.
- **Configuration:** use the tracked secret-free `.env.example` as a checklist; never commit real credentials. Verify trusted-client-IP forwarding on the deployment platform before launch.

**Rollout order:** provision separate KINGDROPP Neon/Vercel/Resend/Upstash accounts; verify `APP_URL` and isolated credentials; run offline `npm run config:check`; run unit/build tests; verify cookies, forgot-password, checkout-disabled status and payment gates in staging; manually approve live activation. Do **not** enable payments or send production emails during repository review.

## Before enabling integrations

- Configure independent Neon/PostgreSQL and Vercel projects.
- Set a fresh session secret and securely provision KINGDROPP admin credentials.
- Configure separate bKash merchant credentials and callback URLs; keep public payment disabled until tested.
- Set distinct OAuth callback URLs, sender domain, Cloudinary account/folder, courier credentials, Telegram bot/chat, GTM and Meta Pixel identifiers.
- Audit the inherited daily notifications cron in `vercel.json` before connecting live email delivery.
- Verify products, order flows, security controls and policy/contact pages before launch.

Never commit production secrets or customer data.

## Repository and review workflow

All KINGDROPP updates require discussion and explicit approval. Implement changes on a feature branch for review, and do not merge to `main` until reviewed. The separate Gameon Garb repository must remain untouched.

# KINGDROPP

**Rule Your Style.** KINGDROPP is a premium men's fashion storefront built with Next.js 16, React 19, TypeScript, PostgreSQL, Prisma and Tailwind CSS 4.

This repository is independent from the Gameon Garb website. Treat its database, deployment, uploads, payment provider credentials, email sender, social logins, tracking IDs, courier configuration and Telegram integrations as **separate services**.

## Current migration status

Phase 1 establishes package identity, centralized brand constants, SEO defaults and a restrained neutral design-token foundation. It does **not** complete the full storefront rebrand.

**Before public launch:** the logo and favicon are still placeholders from the original project pending official KINGDROPP artwork; some storefront pages, About/Terms/Privacy text, emails, admin labels, legacy order-number format, sample catalogue data and Telegram callbacks still reference the original brand. Do not deploy as a production KINGDROPP storefront until those later phases have been reviewed and implemented.

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

**Do not run `npm run db:seed` or `npm run setup` yet.** The inherited seed script still contains predictable demo administrator/customer credentials, sample products and old brand information. It must be rewritten in a later, explicitly approved phase before being used.

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
```

Run `npx prisma migrate deploy` **only** against an explicitly verified KINGDROPP database.

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

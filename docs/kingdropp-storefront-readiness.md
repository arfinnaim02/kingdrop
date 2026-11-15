# KINGDROPP storefront readiness — staged-release checks

This document is **read-only guidance** until the store owner separately approves a production migration and release. Never run queries against the other Game On Garb database.

## 1. Verify the actual store flags in the isolated KINGDROPP Neon SQL Editor

```sql
SELECT "key", "value"
FROM "StoreSetting"
WHERE "key" IN ('general', 'payments', 'shipping')
ORDER BY "key";
```

The public storefront is available only when `general.storeLive === true` AND `general.maintenanceMode === false`. Both payment methods may remain false during a staged content-only launch, but then checkout will not accept new orders.

## 2. Detect schema drift before any public launch

Logs on 2026-11-15 reported missing `Product.sizeChartId` and `HomepageSection.imagePublicId`. These queries only inspect metadata:

```sql
SELECT e.table_name, e.column_name,
       CASE WHEN c.column_name IS NULL THEN 'MISSING' ELSE 'EXISTS' END AS status
FROM (VALUES
 ('Product','sizeChartId'),
 ('HomepageSection','imagePublicId'),
 ('HomepageSection','mobileImagePublicId'),
 ('HeroSlide','imagePublicId'),
 ('HeroSlide','mobileImagePublicId'),
 ('ShopHeroSlide','imagePublicId'),
 ('ShopHeroSlide','mobileImagePublicId')
) AS e(table_name,column_name)
LEFT JOIN information_schema.columns AS c
 ON c.table_schema = 'public'
 AND c.table_name = e.table_name
 AND c.column_name = e.column_name;
```

The repository's existing migrations may not reflect every field in the Prisma schema. Do not use `prisma migrate reset`, `prisma db push --force-reset`, or hand-written guessed ALTER TABLE operations. Compare the actual isolated database with `prisma/schema.prisma`, review the generated diff including indexes and foreign keys, back up before any schema update, and seek explicit deployment approval.

## 3. Admin save check

- Admin → Settings: enter KINGDROPP as store name.
- For content-only storefront visibility, select `Store is live`, deselect `Maintenance mode`, and keep COD/bKash **unchecked** until integration verification.
- Click Save Settings and confirm the success message, then reload Settings to ensure checkboxes persisted.
- Verify `StoreSetting.general` via the read-only SQL above, then refresh the storefront in a private browser tab.
- On an error, capture the response status and JSON from browser DevTools → Network → `PUT /api/admin/settings` (remove secrets), and Vercel Runtime Logs.

## 4. Brand and launch gates

Phase 4D source-level brand cleanup remains draft until reviewed and merged. Source defaults do **not** rewrite existing DB-managed products, homepage sections, site settings, banners or blogs. The official logo/favicon/campaign artwork must be supplied and approved separately.

Verify: migrations, homepage, product catalogue, category navigation, mobile layouts, admin permissions, Cloudinary account separation, email/Redis/session credentials, checkout/payment integrations, legal pages, orders and notification flow. Do not activate public checkout before these checks pass.

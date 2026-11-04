/**
 * Explicitly opt-in to a NEW KINGDROPP database.
 *
 * This seed intentionally does not create demo products, customers, orders,
 * coupons, or integrations. It never resets existing accounts or settings.
 * It must NEVER be pointed at the separate Gameon Garb database.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required KINGDROPP seed setting: ${name}`);
  return value;
}

function validateSeedEnvironment(): { email: string; password: string } {
  if (process.env.KINGDROPP_SEED_CONFIRM !== "INITIALIZE_KINGDROPP_ONLY") {
    throw new Error("Seeding is disabled. Explicit KINGDROPP_SEED_CONFIRM is required.");
  }
  if (process.env.KINGDROPP_DATABASE_ISOLATED !== "true") {
    throw new Error("Verify an independent KINGDROPP database before seeding.");
  }

  const dbUrl = required("DATABASE_URL");
  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
  if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
    throw new Error("Seed requires an independent PostgreSQL database.");
  }
  if (/game[ -]?on[ -]?garb|gameongarb/i.test(dbUrl)) {
    throw new Error("Refusing a database URL containing the other brand's identifier.");
  }

  const email = required("KINGDROPP_ADMIN_EMAIL").toLowerCase();
  const password = required("KINGDROPP_ADMIN_PASSWORD");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("KINGDROPP_ADMIN_EMAIL must be a valid email address.");
  }
  if (password.length < 16) {
    throw new Error("KINGDROPP_ADMIN_PASSWORD must have at least 16 characters.");
  }
  if (/gameon|gameongarb|kingdropp|password123/i.test(password)) {
    throw new Error("Use a unique administrator password, not a brand-based demo password.");
  }
  return { email, password };
}

// Validate all safeguards BEFORE constructing the Prisma client.
const admin = validateSeedEnvironment();
const db = new PrismaClient();

async function main() {
  // This is an initial setup only: refuse any populated database.
  const [users, products, orders] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.order.count(),
  ]);
  if (users > 0 || products > 0 || orders > 0) {
    throw new Error("Database is not empty. Seeding would risk existing data; operation refused.");
  }

  const existingAdmin = await db.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });
  if (existingAdmin) {
    throw new Error("A super administrator already exists. Seed refused; no account will be reset.");
  }

  const existingEmail = await db.user.findUnique({
    where: { email: admin.email },
    select: { id: true },
  });
  if (existingEmail) {
    throw new Error("Administrator email already exists. Seed refused; no role escalation.");
  }

  const passwordHash = await bcrypt.hash(admin.password, 12);
  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        name: "KINGDROPP Administrator",
        email: admin.email,
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });

    // Safe defaults: do not expose a fresh store or enable payment methods.
    // These are create-only; existing business configuration is never overwritten.
    const general = await tx.storeSetting.findUnique({ where: { key: "general" } });
    if (!general) {
      await tx.storeSetting.create({
        data: {
          key: "general",
          value: {
            storeName: "KINGDROPP",
            currency: "BDT",
            timezone: "Asia/Dhaka",
            storeLive: false,
            maintenanceMode: true,
            itemsPerPage: 12,
          },
        },
      });
    }
    const payments = await tx.storeSetting.findUnique({ where: { key: "payments" } });
    if (!payments) {
      await tx.storeSetting.create({
        data: {
          key: "payments",
          value: { codEnabled: false, bkashEnabled: false },
        },
      });
    }
  });

  console.log("KINGDROPP initial administrator and disabled-store defaults created.");
  console.log("No products, customers, orders, coupons or provider credentials were seeded.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "KINGDROPP seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());

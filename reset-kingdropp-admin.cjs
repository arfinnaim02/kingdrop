
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  if (
    process.env.KINGDROPP_DATABASE_ISOLATED !== "true" ||
    process.env.KINGDROPP_SEED_CONFIRM !== "INITIALIZE_KINGDROPP_ONLY"
  ) {
    throw new Error("KINGDROPP database safeguards not confirmed.");
  }

  const db = new PrismaClient();

  try {
    const email = process.env.KINGDROPP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.KINGDROPP_ADMIN_PASSWORD;

    if (!email || !password || password.length < 16) {
      throw new Error("Admin email or strong password is missing.");
    }

    if (/gameon|gameongarb|kingdropp|password123/i.test(password)) {
      throw new Error("Use a new password without brand names.");
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true, status: true }
    });

    if (!user || user.role !== "SUPER_ADMIN" || user.status !== "ACTIVE") {
      throw new Error("An active SUPER_ADMIN with this email was not found.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.user.updateMany({
      where: {
        id: user.id,
        email,
        role: "SUPER_ADMIN",
        status: "ACTIVE"
      },
      data: { passwordHash }
    });

    if (result.count !== 1) {
      throw new Error("Password was not updated.");
    }

    console.log("KINGDROPP administrator password updated successfully.");
  } finally {
    await db.$disconnect();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { BRAND, getPublicSiteUrl } from "@/lib/brand";
import { db } from "@/lib/db";
import { ResendNotificationEmailProvider } from "@/lib/email/resend-provider";
import { strictRateLimit, requestIp } from "@/lib/security/rate-limit";

const publicMessage = "If that account exists, reset instructions will be sent.";

function recoveryConfig() {
  const siteUrl = getPublicSiteUrl();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const enabled = process.env.KINGDROPP_PASSWORD_RESET_EMAIL_ENABLED === "true";

  if (!enabled || !siteUrl || !apiKey || !from ||
      /game[ -]?on[ -]?garb|gameongarb/i.test(from) ||
      (process.env.NODE_ENV === "production" && !siteUrl.startsWith("https://"))) {
    return null;
  }
  return { siteUrl, apiKey, from };
}

export async function POST(request: Request) {
  const limit = await strictRateLimit(`reset:${requestIp(request)}`, 5, 60 * 60_000);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );

  // Production must not generate unusable recovery tokens or leak reset links.
  const config = recoveryConfig();
  if (process.env.NODE_ENV === "production" && !config) {
    return NextResponse.json(
      { error: "Password recovery is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const { email } = z.object({ email: z.string().trim().email().max(180) })
      .parse(await request.json());
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, status: true },
    });

    let resetUrl: string | undefined;
    if (user?.status === "ACTIVE" && user.email) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      });
      const origin = config?.siteUrl ??
        (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
      resetUrl = `${origin}/account/reset-password?token=${encodeURIComponent(token)}`;

      if (config) {
        try {
          const provider = new ResendNotificationEmailProvider({
            apiKey: config.apiKey,
            from: config.from,
            replyTo: process.env.EMAIL_REPLY_TO,
          });
          await provider.send({
            to: user.email,
            subject: `${BRAND.name} — Reset your password`,
            html: `<div style="font-family:Arial,sans-serif;max-width:540px;margin:auto;color:#141414"><h1>${BRAND.name}</h1><p>Someone requested a password reset for your account. This link expires in 30 minutes.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If this wasn't you, you can ignore this email.</p></div>`,
            text: `Reset your ${BRAND.name} password (30-minute link): ${resetUrl}\nIf you did not request this, ignore this email.`,
          });
        } catch {
          // Avoid account enumeration: do not reveal whether delivery failed.
          console.error("KINGDROPP password-reset email delivery failed.");
        }
      }
    }
    return NextResponse.json({
      message: publicMessage,
      ...(process.env.NODE_ENV !== "production" && resetUrl
        ? { resetUrl }
        : {}),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
    console.error("KINGDROPP password reset request failed.");
    return NextResponse.json(
      { error: "Password recovery is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const limit = await strictRateLimit(`reset-submit:${requestIp(request)}`, 10, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  try {
    const input = z.object({
      token: z.string().regex(/^[0-9a-f]{64}$/),
      password: z.string().min(8).max(100),
    }).parse(await request.json());

    const tokenHash = createHash("sha256").update(input.token).digest("hex");
    const reset = await db.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await db.$transaction(async (tx) => {
      const used = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (used.count !== 1) throw new Error("Reset token already used or expired.");
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await tx.session.deleteMany({ where: { userId: reset.userId } });
    });
    return NextResponse.json(
      { message: "Password updated. You can now sign in." },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Provide a valid reset token and a password of at least 8 characters." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Password reset failed or the link has expired." },
      { status: 400 },
    );
  }
}

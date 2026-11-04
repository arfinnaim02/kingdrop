import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strictRateLimit, requestIp } from "@/lib/security/rate-limit";
export async function GET(req: NextRequest) {
  const limit = await strictRateLimit(`order-track:${requestIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }
  const order = req.nextUrl.searchParams.get("order")?.trim();
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!order || !/^01\d{9}$/.test(phone ?? ""))
    return NextResponse.json(
      { error: "Enter a valid order number and phone." },
      { status: 400 },
    );
  const found = await db.order.findFirst({
    where: { number: order, phone },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
  });
  if (!found)
    return NextResponse.json(
      { error: "No order matched those details." },
      { status: 404 },
    );
  const masked = found.shippingAddress.replace(/\d/g, "•");
  return NextResponse.json({
    number: found.number,
    status: found.status,
    subtotal: Number(found.subtotal),
    delivery: Number(found.deliveryCharge),
    discount: Number(found.discount),
    total: Number(found.total),
    address: `${masked}, ${found.thana}, ${found.district}`,
    history: found.history.map((h) => ({
      status: h.newStatus,
      at: h.createdAt.toLocaleString("en-BD"),
    })),
    items: found.items.map((i) => ({ name: i.name, quantity: i.quantity })),
  });
}

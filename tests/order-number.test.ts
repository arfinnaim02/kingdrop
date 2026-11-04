import { describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";

import { nextOrderNumber } from "../src/lib/order-number";

function transaction(max_number: bigint | null) {
  const executeRaw = vi.fn().mockResolvedValue(1);
  const queryRaw = vi.fn().mockResolvedValue([{ max_number }]);
  return {
    tx: {
      $executeRaw: executeRaw,
      $queryRaw: queryRaw,
    } as unknown as Prisma.TransactionClient,
    executeRaw,
    queryRaw,
  };
}

describe("KINGDROPP order-number generation (no database)", () => {
  it("starts new orders at KD-20260001", async () => {
    const { tx, executeRaw, queryRaw } = transaction(null);
    expect(await nextOrderNumber(tx)).toBe("KD-20260001");
    expect(executeRaw).toHaveBeenCalledOnce();
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it("increments the highest KD-prefixed number", async () => {
    const { tx } = transaction(20_260_014n);
    expect(await nextOrderNumber(tx)).toBe("KD-20260015");
  });

  it("retains the same numeric floor for older sequences", async () => {
    const { tx } = transaction(7n);
    expect(await nextOrderNumber(tx)).toBe("KD-20260001");
  });

  it("queries only the KD prefix without consulting legacy GOG records", async () => {
    const { tx, queryRaw } = transaction(null);
    await nextOrderNumber(tx);
    const sql = (queryRaw.mock.calls[0][0] as TemplateStringsArray).join("");
    expect(sql).toContain("^KD-");
    expect(sql).not.toContain("GOG-");
  });
});

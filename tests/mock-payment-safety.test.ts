import { describe, expect, it } from "vitest";
import { allowMockBkashPayment } from "../src/lib/payments/bkash/mock-access";

describe("mock bKash payment safety", () => {
  it("is disabled in production even if payment mode is unset or sandbox", () => {
    expect(allowMockBkashPayment("production", undefined)).toBe(false);
    expect(allowMockBkashPayment("production", "sandbox")).toBe(false);
    expect(allowMockBkashPayment("production", "production")).toBe(false);
  });

  it("is only available for non-production sandbox testing", () => {
    expect(allowMockBkashPayment("development", "sandbox")).toBe(true);
    expect(allowMockBkashPayment("test", undefined)).toBe(true);
    expect(allowMockBkashPayment("development", "production")).toBe(false);
  });
});

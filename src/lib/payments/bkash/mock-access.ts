/**
 * Fake bKash payment completion is for local/sandbox development only.
 * A production Next.js deployment must NEVER accept mock payments,
 * even if BKASH_MODE is accidentally unset or left at "sandbox".
 */
export function allowMockBkashPayment(
  nodeEnv: string | undefined,
  bkashMode: string | undefined,
): boolean {
  return nodeEnv !== "production" && (bkashMode ?? "sandbox") === "sandbox";
}

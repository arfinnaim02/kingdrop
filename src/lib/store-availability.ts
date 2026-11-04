/**
 * A missing or malformed setting is never permission to open the storefront.
 * These guards are shared by the UI and order/public-settings APIs.
 */
export function isStoreOpen(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const setting = value as Record<string, unknown>;
  return setting.storeLive === true && setting.maintenanceMode === false;
}

export function enabledPaymentMethods(value: unknown): {
  codEnabled: boolean;
  bkashEnabled: boolean;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { codEnabled: false, bkashEnabled: false };
  }
  const setting = value as Record<string, unknown>;
  return {
    codEnabled: setting.codEnabled === true,
    bkashEnabled: setting.bkashEnabled === true,
  };
}

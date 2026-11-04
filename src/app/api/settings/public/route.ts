import { isStoreOpen, enabledPaymentMethods } from "@/lib/store-availability";

import {
  NextResponse,
} from "next/server";

import {
  db,
} from "@/lib/db";

import {
  getBkashAccessMode,
  isBkashAllowedForPhone,
} from "@/lib/payments/bkash/access";

export const dynamic =
  "force-dynamic";

export async function GET(
  request:
    Request,
) {
  try {
    const url =
      new URL(
        request.url,
      );

    const phone =
      url.searchParams
        .get(
          "phone",
        );

    const rows =
      await db.storeSetting.findMany({
        where: {
          key: {
            in: [
              "shipping",
              "payments",
              "general",
            ],
          },
        },
      });

    const shipping =
      rows.find(
        (
          row,
        ) =>
          row.key ===
          "shipping",
      )?.value as
        | {
            insideDhaka?:
              number;

            outsideDhaka?:
              number;
          }
        | undefined;

    const general = rows.find((row) => row.key === "general")?.value;
    const storeOpen = isStoreOpen(general);
    const payments = enabledPaymentMethods(
      rows.find((row) => row.key === "payments")?.value,
    );

    const bkashAllowed =
      storeOpen && payments.bkashEnabled &&
      isBkashAllowedForPhone(
        phone,
      );

    return NextResponse.json({
      insideDhaka:
        shipping?.insideDhaka ??
        80,

      outsideDhaka:
        shipping?.outsideDhaka ??
        150,

      codEnabled:
        storeOpen && payments.codEnabled,

      bkashEnabled:
        bkashAllowed,

      bkashAccessMode:
        getBkashAccessMode(),
    });
  } catch {
    /*
     * Fail closed for bKash.
     *
     * If settings/DB temporarily fail, COD can remain
     * available but bKash must not become public by
     * accident.
     */
    return NextResponse.json({
      insideDhaka:
        80,

      outsideDhaka:
        150,

      codEnabled:
        false,

      bkashEnabled:
        false,

      bkashAccessMode:
        "DISABLED",
    });
  }
}
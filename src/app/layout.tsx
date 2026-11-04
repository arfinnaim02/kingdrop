import type { Metadata } from "next";

import "./globals.css";

import { StoreProvider } from "@/components/shared/store-provider";
import { BRAND, getPublicSiteUrl } from "@/lib/brand";

const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title: {
    default: BRAND.seoTitle,
    template: `%s | ${BRAND.name}`,
  },

  description: BRAND.seoDescription,

  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),

  openGraph: {
    title: BRAND.seoTitle,
    description: BRAND.seoDescription,
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
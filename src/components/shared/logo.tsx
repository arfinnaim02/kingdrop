import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo({
  admin = false,
}: {
  admin?: boolean;
}) {
  return (
    <Link
      href={
        admin
          ? "/admin"
          : "/"
      }
      className="brand-logo"
      aria-label={
        admin
          ? `${BRAND.name} Admin`
          : `${BRAND.name} Home`
      }
    >
      <Image
        src="/brand/game-on-garb-logo.svg"
        alt=""
        width={587}
        height={375}
        className="brand-logo-image"
                priority={!admin}
        loading={
          admin
            ? "lazy"
            : "eager"
        }
      />
    </Link>
  );
}
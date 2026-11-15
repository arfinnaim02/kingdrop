
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
      href={admin ? "/admin" : "/"}
      className="brand-logo"
      aria-label={
        admin
          ? `${BRAND.name} Admin`
          : `${BRAND.name} Home`
      }
    >
      <Image
        src="/brand/kingdropp-header-logo.png"
        alt="KINGDROPP"
        width={1540}
        height={656}
        className="brand-logo-image"
        priority={!admin}
      />
    </Link>
  );
}

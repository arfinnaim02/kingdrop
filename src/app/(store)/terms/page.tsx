import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getPublicBusinessContacts } from "@/lib/public-business-contact";

export const metadata = {
  robots: { index: false, follow: true },
  title: `Terms & Conditions | ${BRAND.name}`,
  description: "Review KINGDROPP's draft terms for orders, payments, delivery, accounts and returns.",
};

export default function TermsPage() {
  const contact = getPublicBusinessContacts();
  return (
    <main className="legal-page">
      <div className="container legal-page-inner">
        <div className="legal-page-heading">
          <span className="eyebrow">{BRAND.name}</span>
          <h1 className="display">Terms & Conditions</h1>
          <p className="muted">Draft for business and legal review — not final terms.</p>
        </div>
        <div className="legal-content">
          <section>
            <h2>1. About these terms</h2>
            <p>This draft describes how the KINGDROPP online store is intended to operate. The business operator must confirm its identity, support contacts and final terms before publication as an effective customer agreement.</p>
          </section>
          <section>
            <h2>2. Products and pricing</h2>
            <p>Products may display prices, sizes, colors, available variants and stock information. Confirm all product details and the total shown at checkout before submitting an order.</p>
          </section>
          <section>
            <h2>3. Ordering and accounts</h2>
            <p>Ordering may be offered to guests and registered customers. The site can provide order tracking and order-status updates. Any rules concerning confirmation, cancellation or rejection of orders require final business approval.</p>
          </section>
          <section>
            <h2>4. Payment</h2>
            <p>The checkout may offer Cash on Delivery or bKash where enabled. The available method and charge summary should be checked during checkout. Any requirements for advance delivery payments must be confirmed and clearly disclosed before launch.</p>
          </section>
          <section>
            <h2>5. Delivery</h2>
            <p>Shipping charges depend on the delivery location and configured store rates. Final delivery estimates, coverage, courier arrangements and handling of delays need business confirmation.</p>
          </section>
          <section>
            <h2>6. Returns, exchanges and refunds</h2>
            <p>The eligibility window, product condition requirements, exclusions, shipping responsibility, refund method and any deductions have not yet been approved for KINGDROPP. They must be finalized in the <Link href="/returns">Return & Exchange Policy</Link> before public orders are accepted.</p>
          </section>
          <section>
            <h2>7. Privacy and contact</h2>
            <p>Details about personal information appear in the <Link href="/privacy-policy">Privacy Policy draft</Link>. Verified business contact details will be published when approved.</p>
            {contact.email ? <p>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></p> : null}
            {contact.phone ? <p>Phone: {contact.phone}</p> : null}
          </section>
          <section>
            <h2>Before these terms take effect</h2>
            <p>Confirm business identity, delivery commitments, returns and refund practices, consumer rights, applicable laws, contact details and the effective date. This page is a working draft rather than a claim that those details are finalized.</p>
          </section>
          <div className="legal-back"><Link href="/">Back to {BRAND.name}</Link></div>
        </div>
      </div>
    </main>
  );
}

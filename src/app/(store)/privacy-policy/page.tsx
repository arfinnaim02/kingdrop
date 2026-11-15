import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { getPublicBusinessContacts } from "@/lib/public-business-contact";

export const metadata = {
  robots: { index: false, follow: true },
  title: `Privacy Policy | ${BRAND.name}`,
  description: "Review KINGDROPP's draft explanation of customer and website data practices.",
};

export default function PrivacyPolicyPage() {
  const contact = getPublicBusinessContacts();
  return (
    <main className="legal-page">
      <div className="container legal-page-inner">
        <div className="legal-page-heading">
          <span className="eyebrow">{BRAND.name}</span>
          <h1 className="display">Privacy Policy</h1>
          <p className="muted">Draft for business and privacy review — not final policy.</p>
        </div>
        <div className="legal-content">
          <section>
            <h2>1. Scope</h2>
            <p>This working draft describes the personal-information flows that may be involved in using the KINGDROPP website. The responsible business entity and effective date need confirmation before publication as a final policy.</p>
          </section>
          <section>
            <h2>2. Information involved</h2>
            <p>Account registration, checkout, delivery and support features may collect names, phone numbers, email addresses, delivery details, order details and authentication information. The site may also process technical records used for security and operation.</p>
          </section>
          <section>
            <h2>3. Use of information</h2>
            <p>Information may be needed to create accounts, process orders, arrange delivery, communicate updates, respond to support requests and protect against misuse. Any additional marketing use or consent arrangements must be verified separately.</p>
          </section>
          <section>
            <h2>4. Payment and external services</h2>
            <p>Where enabled, third-party payment, courier, email and sign-in services may handle information needed for their functions. Actual service providers, international transfers and their handling of data must be verified before launch.</p>
          </section>
          <section>
            <h2>5. Cookies and analytics</h2>
            <p>The website uses session and order-access identifiers to support authentication and purchases. Analytics and advertising integrations, if enabled, require an appropriate disclosure and applicable consent approach.</p>
          </section>
          <section>
            <h2>6. Retention, security and requests</h2>
            <p>Retention periods, deletion procedures, security controls, user rights, contact channels and any legally required disclosures must be confirmed with the business and reviewed for applicable law. Do not treat this draft as a finalized retention or deletion promise.</p>
          </section>
          <section>
            <h2>7. Contact</h2>
            <p>Verified KINGDROPP privacy-contact details will be shown here after approval.</p>
            {contact.email ? <p>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></p> : null}
            {contact.phone ? <p>Phone: {contact.phone}</p> : null}
          </section>
          <section>
            <h2>Before publication</h2>
            <p>Confirm the operator's identity, actual data inventory, legal grounds, tracking technologies, processors, retention rules, rights handling, privacy contact and effective date. Obtain appropriate business and legal approval.</p>
          </section>
          <div className="legal-back"><Link href="/">Back to {BRAND.name}</Link></div>
        </div>
      </div>
    </main>
  );
}

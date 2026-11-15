import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BRAND } from "@/lib/brand";
import { getPublicBusinessContacts } from "@/lib/public-business-contact";

const pages: Record<string, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  "size-guide": {
    title: "Size Guide",
    intro: "Find a fit that works for you.",
    sections: [
      { heading: "How to measure", body: "Measure your chest, waist and hips with a relaxed tape. Compare your measurements with the chart shown on the relevant product." },
      { heading: "Choosing your size", body: "Sizes and measurements can differ by product. Refer to the specific product chart rather than assuming the same fit across all styles." },
    ],
  },
  shipping: {
    title: "Shipping Information",
    intro: "Delivery information for KINGDROPP orders.",
    sections: [
      { heading: "Delivery charges", body: "Shipping charges depend on the delivery address and the shipping settings presented during checkout. Review the final total before submitting your order." },
      { heading: "Delivery times", body: "The delivery schedule, service coverage and courier terms are pending business confirmation. Any estimate shown at checkout should be reviewed before launch." },
    ],
  },
  returns: {
    title: "Return & Exchange Policy — Draft",
    intro: "Return and exchange arrangements are awaiting business approval.",
    sections: [
      { heading: "Approval required", body: "KINGDROPP has not yet approved the return window, eligible product conditions, exceptions, refund method, costs or processing timeline. These details must be published before accepting public orders." },
      { heading: "Order assistance", body: "Use your account or order-tracking page to review an order. Verified customer support details will be published after business confirmation." },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "A quick guide to the KINGDROPP shopping experience.",
    sections: [
      { heading: "Where can I find size information?", body: "Open the product page and look for its product-specific size chart." },
      { heading: "How can I check an order?", body: "Use the Track Order page or sign in to see orders linked to your account." },
      { heading: "Which payment methods are available?", body: "The checkout shows the payment methods currently enabled for your order. Availability can depend on the configured store settings." },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ content: string }>;
}): Promise<Metadata> {
  const { content } = await params;
  if (content === "contact") return { title: `Contact | ${BRAND.name}` };
  return { title: `${pages[content]?.title ?? "Page"} | ${BRAND.name}` };
}

export default async function Content({
  params,
}: {
  params: Promise<{ content: string }>;
}) {
  const { content } = await params;
  const contacts = getPublicBusinessContacts();
  const page = content === "contact"
    ? {
        title: "Contact Us",
        intro: "Official KINGDROPP contact channels will be displayed once verified.",
        sections: [
          { heading: "Customer assistance", body: "You can review your account and track orders online. Direct support details are being verified." },
        ],
      }
    : pages[content];
  if (!page) notFound();

  return (
    <main className="container" style={{ padding: "60px 0 80px", maxWidth: 850 }}>
      <span className="eyebrow">{BRAND.name}</span>
      <h1 className="display" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", margin: "12px 0" }}>{page.title}</h1>
      <p style={{ fontSize: 19 }}>{page.intro}</p>
      {page.sections.map((section) => (
        <section key={section.heading} style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
          <h2>{section.heading}</h2>
          <p className="muted">{section.body}</p>
        </section>
      ))}
      {content === "contact" && (contacts.email || contacts.phone || contacts.address || contacts.socials.length > 0) ? (
        <section style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
          <h2>Verified contacts</h2>
          {contacts.email ? <p><a href={`mailto:${contacts.email}`}>{contacts.email}</a></p> : null}
          {contacts.phone ? <p>{contacts.phone}</p> : null}
          {contacts.address ? <p>{contacts.address}</p> : null}
          {contacts.whatsappUrl ? <p><a href={contacts.whatsappUrl}>WhatsApp</a></p> : null}
          {contacts.mapUrl ? <p><a href={contacts.mapUrl}>Directions</a></p> : null}
          {contacts.socials.map((item) => <p key={item.label}><a href={item.href}>{item.label}</a></p>)}
        </section>
      ) : null}
      <p><Link href="/track-order">Track an Order</Link> · <Link href="/shop">Explore the Collection</Link></p>
    </main>
  );
}

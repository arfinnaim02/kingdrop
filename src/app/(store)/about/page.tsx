import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  HeartHandshake,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { getPublicBusinessContacts } from "@/lib/public-business-contact";

import styles from "./about.module.css";

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
  title: {
    absolute:
      "About KINGDROPP | Premium Men\'s Fashion",
  },

  description:
    "Learn about KINGDROPP, a contemporary premium menswear brand built around refined everyday style and confidence.",

  alternates: {
    canonical:
      "/about",
  },

  openGraph: {
    title:
      "About KINGDROPP",

    description:
      "Discover KINGDROPP and our approach to premium men\'s fashion. Rule Your Style.",

    url:
      "/about",

    type:
      "website",
  },
};

const VALUES = [
  {
    icon:
      BadgeCheck,

    title:
      "Quality First",

    body:
      "We focus on wearable quality, dependable finishing and pieces that feel right from the first wear.",
  },
  {
    icon:
      Sparkles,

    title:
      "Modern Style",

    body:
      "Our collections bring together sports culture, streetwear energy and everyday versatility.",
  },
  {
    icon:
      HeartHandshake,

    title:
      "Customer Focus",

    body:
      "From product selection to delivery and after-sales support, we aim to keep the experience simple and dependable.",
  },
  {
    icon:
      ShieldCheck,

    title:
      "Built on Trust",

    body:
      "Clear pricing, secure payment options, order tracking and responsive support are part of how we serve our customers.",
  },
];

const EXPERIENCE = [
  {
    icon:
      ShoppingBag,

    label:
      "Easy Shopping",

    value:
      "Guest checkout and customer accounts",
  },
  {
    icon:
      CreditCard,

    label:
      "Flexible Payment",

    value:
      "Cash on Delivery and bKash",
  },
  {
    icon:
      Truck,

    label:
      "Nationwide Delivery",

    value:
      "Inside and outside Dhaka",
  },
  {
    icon:
      PackageCheck,

    label:
      "Order Visibility",

    value:
      "Track your order from the website",
  },
];

export default function AboutPage() {
  const contact = getPublicBusinessContacts();
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, "")}` : null;
  const hasPublicContact = Boolean(contact.phone || contact.email || contact.address || contact.mapUrl || contact.whatsappUrl || contact.socials.length);

  return (
    <main className={styles.page}>
      {/* ===================================================
          HERO
          =================================================== */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              KINGDROPP
            </span>

            <h1>
              More Than
              <br />
              What You Wear.
            </h1>

            <p className={styles.heroLead}>
              KINGDROPP brings
              refined essentials and
              everyday style together
              for people who move with
              confidence, energy and
              purpose.
            </p>

            <div className={styles.heroActions}>
              <Link
                href="/shop"
                className={styles.primaryAction}
              >
                Shop the Collection

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>

              <Link href="/track-order" className={styles.secondaryAction}>
                Track Your Order
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.heroStatement}>
            <span>
              Our Mindset
            </span>

            <strong>
              Rule Your
              <br />
              The Thrill.
            </strong>

            <p>
              Built in Bangladesh.
              Designed for movement,
              expression and everyday
              life.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          STORY
          =================================================== */}
      <section className={styles.story}>
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.sectionIntro}>
            <span>
              Our Story
            </span>

            <h2>
              Built for people who
              live in motion.
            </h2>
          </div>

          <div className={styles.storyCopy}>
            <p>
              KINGDROPP is a
              Bangladesh-based sports,
              fashion and lifestyle
              brand created for people
              who want comfort, energy
              and modern style in the
              same wardrobe.
            </p>

            <p>
              Our collections move
              across sneakers,
              football jerseys,
              sportswear, polo shirts,
              drop-shoulder styles,
              baggy trousers and other
              everyday essentials. The
              goal is simple: make
              pieces that look good,
              feel comfortable and fit
              naturally into real life.
            </p>

            <p>
              From match day to
              everyday wear, we want
              KINGDROPP to feel
              active, confident and
              easy to choose.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          VALUES
          =================================================== */}
      <section className={styles.valuesSection}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span>
              What We Stand For
            </span>

            <h2>
              A better everyday
              shopping experience.
            </h2>
          </div>

          <div className={styles.valuesGrid}>
            {VALUES.map(
              ({
                icon:
                  Icon,
                title,
                body,
              }) => (
                <article
                  key={title}
                  className={styles.valueCard}
                >
                  <span className={styles.valueIcon}>
                    <Icon
                      size={23}
                      strokeWidth={1.7}
                    />
                  </span>

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {body}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          OFFER
          =================================================== */}
      <section className={styles.offerSection}>
        <div className={`container ${styles.offerGrid}`}>
          <div className={styles.offerCopy}>
            <span>
              What We Offer
            </span>

            <h2>
              Sports energy.
              Everyday versatility.
            </h2>

            <p>
              Explore sneakers,
              football jerseys,
              sportswear, polos,
              drop shoulders, baggy
              trousers and lifestyle
              pieces selected for the
              modern Bangladesh
              customer.
            </p>

            <Link
              href="/categories"
              className={styles.textLink}
            >
              Explore Categories

              <ArrowRight
                size={15}
              />
            </Link>
          </div>

          <div className={styles.categoryStack}>
            <div>
              <strong>
                Sneakers
              </strong>

              <span>
                Everyday comfort,
                street-ready style and
                pairs built to lead the
                rotation.
              </span>
            </div>

            <div>
              <strong>
                Football &
                Sports
              </strong>

              <span>
                Match-day spirit,
                performance influence
                and fan culture.
              </span>
            </div>

            <div>
              <strong>
                Casual &
                Streetwear
              </strong>

              <span>
                Relaxed silhouettes
                built for everyday
                rotation.
              </span>
            </div>

            <div>
              <strong>
                Everyday
                Essentials
              </strong>

              <span>
                Clean, versatile pieces
                that work across your
                week.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          EXPERIENCE
          =================================================== */}
      <section className={styles.experienceSection}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <span>
              Shopping With Us
            </span>

            <h2>
              Simple from cart
              to doorstep.
            </h2>
          </div>

          <div className={styles.experienceGrid}>
            {EXPERIENCE.map(
              ({
                icon:
                  Icon,
                label,
                value,
              }) => (
                <div
                  key={label}
                  className={styles.experienceItem}
                >
                  <Icon
                    size={21}
                    strokeWidth={1.7}
                  />

                  <div>
                    <small>
                      {label}
                    </small>

                    <strong>
                      {value}
                    </strong>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className={styles.deliveryStrip}>
            <div>
              <span>
                Inside Dhaka
              </span>

              <strong>
                ৳80
              </strong>

              <small>
                Standard delivery
                charge
              </small>
            </div>

            <div>
              <span>
                Outside Dhaka
              </span>

              <strong>
                ৳150
              </strong>

              <small>
                Standard delivery
                charge
              </small>
            </div>

            <div className={styles.deliveryNote}>
              <Truck
                size={24}
                strokeWidth={1.6}
              />

              <p>
                Delivery is available
                across Bangladesh.
                Final availability and
                charges are confirmed
                during checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official contacts are shown only after owner verification. */}
      <section className={styles.contactSection}>
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.locationPanel}>
            <span className={styles.kicker}>KINGDROPP / SUPPORT</span>
            <h2>Questions about your order?</h2>
            <p>Track an order online or browse our customer information pages.</p>
            <Link href="/track-order" className={styles.mapAction}>
              Track Your Order <ArrowRight size={15} />
            </Link>
          </div>
          <div className={styles.contactPanel}>
            <span>Contact & Support</span>
            <h3>We're here to help you find your style.</h3>
            {hasPublicContact ? (
              <div className={styles.contactList}>
                {contact.phone && telHref ? (
                  <a href={telHref}>Call: {contact.phone}</a>
                ) : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`}>Email: {contact.email}</a>
                ) : null}
                {contact.address ? <p>{contact.address}</p> : null}
                {contact.mapUrl ? (
                  <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
                    Get directions
                  </a>
                ) : null}
                {contact.whatsappUrl ? (
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    WhatsApp Support
                  </a>
                ) : null}
                {contact.socials.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                ))}
              </div>
            ) : (
              <p>Official contact channels will appear here once verified. You can continue to use order tracking and your account.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          FINAL CTA
          =================================================== */}
      <section className={styles.finalCta}>
        <div className={`container ${styles.finalCtaInner}`}>
          <div>
            <span>
              Ready to Move?
            </span>

            <h2>
              Find your next
              KINGDROPP piece.
            </h2>
          </div>

          <div className={styles.finalActions}>
            <Link
              href="/shop?sort=newest"
              className={styles.primaryAction}
            >
              New Arrivals

              <ArrowRight
                size={17}
              />
            </Link>

            <Link
              href="/track-order"
              className={styles.darkOutlineAction}
            >
              Track Order
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

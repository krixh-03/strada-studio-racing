import Image from "next/image";
import { BookingForm, BookingProvider, ChoosePlanLink } from "@/components/booking";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { duration, plans, rupees, site } from "@/lib/site";
import logo from "@/public/images/logo.png";
import studioFloor from "@/public/images/studio-floor.jpg";
import rigs from "@/public/images/rigs.jpg";
import entrance from "@/public/images/entrance.jpg";
import wallCar from "@/public/images/wall-car.jpg";

const lowestPrice = Math.min(...plans.map((p) => p.price));

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Studio />
        <BookingProvider>
          <Pricing />
          <Book />
        </BookingProvider>
        <Visit />
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <a href="#top" className="brand" aria-label={`${site.name}, back to top`}>
          <Image src={logo} alt="" width={38} height={38} />
          <span className="brand-name">
            Strada<small>Racing Studio</small>
          </span>
        </a>
        <nav className="nav" aria-label="Main">
          <a href="#studio">Studio</a>
          <a href="#pricing">Pricing</a>
          <a href="#visit">Visit</a>
        </nav>
        <a
          href={`tel:${site.phones[0].tel}`}
          className="icon-button"
          aria-label={`Call ${site.phones[0].display}`}
        >
          <PhoneIcon size={18} />
        </a>
        <a href="#book" className="btn btn-primary btn-sm">
          Book now
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        <Image
          src={studioFloor}
          alt="Six white racing simulator rigs facing ultrawide screens in Strada's red-walled studio"
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 900px) 520px, 100vw"
        />
      </div>
      <div className="hero-content">
        <p className="eyebrow">Sim racing studio · Hyderabad</p>
        <h1>
          Hyderabad is on the grid. <span className="accent">Are you?</span>
        </h1>
        <p className="lead">
          Six pro-grade racing simulators, real-world circuits and a room built
          for race day. Book a slot, bring your friends, and race.
        </p>
        <div className="cta-row">
          <a href="#book" className="btn btn-primary">
            Book a slot <ArrowRightIcon size={18} />
          </a>
          <a href="#pricing" className="btn btn-ghost">
            See pricing
          </a>
        </div>
        <dl className="stats">
          <div className="stat">
            <dt>Racing rigs</dt>
            <dd>{site.rigs}</dd>
          </div>
          <div className="stat">
            <dt>Sessions from</dt>
            <dd>{rupees(lowestPrice)}</dd>
          </div>
          <div className="stat">
            <dt>Open daily</dt>
            <dd>11–11</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Studio() {
  const features = [
    {
      title: "Full racing cockpits",
      text: "Bucket seat, wheel and pedals on a rigid frame. It feels like a car, not a controller.",
    },
    {
      title: "Race each other",
      text: `Up to ${site.rigs} drivers on the same grid. Settle it on track, not in the group chat.`,
    },
    {
      title: "First time? Easy",
      text: "We set you up, adjust the seat and talk you through your first laps.",
    },
  ];

  return (
    <section className="section" id="studio">
      <div className="container studio-grid">
        <div>
          <div className="section-head">
            <p className="eyebrow">The studio</p>
            <h2>From a vision to the starting grid</h2>
            <p>
              Strada is a dedicated sim racing studio: full cockpits side by
              side, ultrawide screens, and walls lined with the circuits
              you&apos;ll be racing on.
            </p>
          </div>
          <ul className="features">
            {features.map((f) => (
              <li key={f.title} className="feature">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="gallery">
          <figure>
            <Image
              src={rigs}
              alt="A driver mid-race on a sim rig in front of a wall of circuit maps"
              fill
              placeholder="blur"
              sizes="(min-width: 900px) 270px, 50vw"
            />
          </figure>
          <figure>
            <Image
              src={entrance}
              alt="The Strada Racing Studio logo at the entrance, with a Senna print behind it"
              fill
              placeholder="blur"
              sizes="(min-width: 900px) 270px, 50vw"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="section section-alt" id="pricing">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2>Pick your session</h2>
          <p>
            Priced per driver unless noted. Every session includes setup and a
            quick briefing.
          </p>
        </div>
        <div className="plans">
          {plans.map((p) => (
            <article key={p.id} className={`plan${p.featured ? " featured" : ""}`}>
              {p.featured && <span className="plan-tag">Most booked</span>}
              <div>
                <h3>{p.name}</h3>
                <p className="plan-duration">
                  {duration(p.minutes)}
                  {p.perDriver ? "" : ` · all ${site.rigs} rigs`}
                </p>
              </div>
              <p className="plan-price">
                {rupees(p.price)}
                <span>{p.perDriver ? "/ driver" : "/ group"}</span>
              </p>
              <p className="plan-summary">{p.summary}</p>
              <ChoosePlanLink
                planId={p.id}
                className={`btn btn-block ${p.featured ? "btn-primary" : "btn-ghost"}`}
              >
                Book {p.name}
              </ChoosePlanLink>
            </article>
          ))}
        </div>
        <p className="plans-note">
          Birthday, college fest or team outing?{" "}
          <a href={`tel:${site.phones[0].tel}`}>Call us</a> for group packages.
        </p>
      </div>
    </section>
  );
}

function Book() {
  return (
    <section className="section" id="book">
      <div className="container booking-layout">
        <div className="booking-aside">
          <div className="section-head">
            <p className="eyebrow">Book</p>
            <h2>Lock in your slot</h2>
            <p>
              Choose a session and a start time, then send it to us on
              WhatsApp. We&apos;ll confirm your booking there.
            </p>
          </div>
          <div className="contact-alt">
            <p className="muted">Prefer to talk?</p>
            {site.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="contact-link">
                <PhoneIcon size={18} /> {p.display}
              </a>
            ))}
          </div>
        </div>
        <BookingForm />
      </div>
    </section>
  );
}

function Visit() {
  return (
    <section className="section section-alt" id="visit">
      <div className="container">
        <div className="visit-banner">
          <Image
            src={wallCar}
            alt="Metal F1 car silhouette mounted on Strada's orange feature wall"
            fill
            placeholder="blur"
            sizes="(min-width: 1120px) 1080px, 100vw"
          />
        </div>
        <div className="section-head">
          <p className="eyebrow">Visit</p>
          <h2>Find the studio</h2>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <MapPinIcon className="info-icon" />
            <h3>Location</h3>
            <p className="muted">{site.city}</p>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="info-link">
              Get directions <ArrowUpRightIcon size={16} />
            </a>
          </div>
          <div className="info-card">
            <ClockIcon className="info-icon" />
            <h3>Hours</h3>
            <p className="muted">{site.hours.label}</p>
          </div>
          <div className="info-card">
            <PhoneIcon className="info-icon" />
            <h3>Call</h3>
            {site.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="info-link">
                {p.display}
              </a>
            ))}
          </div>
          <div className="info-card">
            <InstagramIcon className="info-icon" />
            <h3>Follow</h3>
            <a
              href={`https://instagram.com/${site.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="info-link"
            >
              @{site.instagram} <ArrowUpRightIcon size={16} />
            </a>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="info-link"
            >
              <WhatsAppIcon size={16} /> Message on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Image src={logo} alt="" width={48} height={48} />
        <div>
          <p className="footer-name">{site.name}</p>
          <p className="muted">Racing · Esports · Motorsport</p>
        </div>
        <p className="footer-copy muted">
          © {site.name}, Hyderabad
        </p>
      </div>
    </footer>
  );
}

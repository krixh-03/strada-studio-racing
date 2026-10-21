"use client";

import {
  createContext,
  use,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { duration, plans, rupees, site, type Plan } from "@/lib/site";
import {
  CheckIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  WhatsAppIcon,
} from "./icons";

/* Selected plan is shared so the pricing cards can preselect the form. */

type PlanState = { planId: string; setPlanId: (id: string) => void };
const PlanContext = createContext<PlanState | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState("grand-prix");
  return <PlanContext value={{ planId, setPlanId }}>{children}</PlanContext>;
}

function usePlan() {
  const ctx = use(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside <BookingProvider>");
  return ctx;
}

export function ChoosePlanLink({
  planId,
  className,
  children,
}: {
  planId: string;
  className?: string;
  children: ReactNode;
}) {
  const { setPlanId } = usePlan();
  return (
    <a href="#book" className={className} onClick={() => setPlanId(planId)}>
      {children}
    </a>
  );
}

/* Current time, read on the client only and refreshed every minute so
   slots that have passed drop out without a reload. */

let nowCache: number | null = null;
function subscribeNow(onChange: () => void) {
  const id = window.setInterval(() => {
    nowCache = Date.now();
    onChange();
  }, 60_000);
  return () => window.clearInterval(id);
}
const getNow = () => (nowCache ??= Date.now());
const getServerNow = () => null;

/* Slot helpers */

const LEAD_MINUTES = 60;

type Day = { key: string; date: Date };
type Slot = { hour: number; available: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function upcomingDays(now: number): Day[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: site.bookingWindowDays }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { key: dayKey(date), date };
  });
}

function slotsFor(day: Date, plan: Plan, now: number): Slot[] {
  const slots: Slot[] = [];
  for (
    let hour = site.hours.open;
    hour * 60 + plan.minutes <= site.hours.close * 60;
    hour++
  ) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    slots.push({
      hour,
      available: start.getTime() - now >= LEAD_MINUTES * 60_000,
    });
  }
  return slots;
}

function formatTime(minutesFromMidnight: number) {
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const m = minutesFromMidnight % 60;
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

const weekday = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short" });
const month = (d: Date) => d.toLocaleDateString("en-IN", { month: "short" });
const longDate = (d: Date) =>
  `${weekday(d)}, ${d.getDate()} ${month(d)} ${d.getFullYear()}`;

function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

// Short, unambiguous code the studio can quote back on WhatsApp.
function bookingRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `SRS-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

const MAX_DRIVERS = site.rigs;

// Stable identity, so it runs once on mount rather than on every re-render.
const scrollIntoViewOnMount = (el: HTMLElement | null) =>
  el?.scrollIntoView({ block: "start" });

type Confirmation = { ref: string; whatsappUrl: string; lines: string[][] };

export function BookingForm() {
  const now = useSyncExternalStore(subscribeNow, getNow, getServerNow);
  const { planId, setPlanId } = usePlan();
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  const [dateKey, setDateKey] = useState<string | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [drivers, setDrivers] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const days = now === null ? [] : upcomingDays(now);
  const hasSlots = (d: Day) =>
    now !== null && slotsFor(d.date, plan, now).some((s) => s.available);
  const day =
    days.find((d) => d.key === dateKey && hasSlots(d)) ?? days.find(hasSlots);
  const slots = day && now !== null ? slotsFor(day.date, plan, now) : [];
  // A plan or date change can rule out the chosen time; treat it as unset.
  const time = slots.some((s) => s.hour === hour && s.available) ? hour : null;

  const total = plan.perDriver ? plan.price * drivers : plan.price;
  const phoneDigits = normalisePhone(phone);

  const errors = {
    time: time === null ? "Pick a start time." : null,
    name: name.trim().length < 2 ? "Enter your name." : null,
    phone: phoneDigits ? null : "Enter a 10-digit mobile number.",
  };
  const show = (key: keyof typeof errors) => (attempted ? errors[key] : null);

  const timeRange =
    time === null
      ? null
      : `${formatTime(time * 60)} – ${formatTime(time * 60 + plan.minutes)}`;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);
    if (!day || time === null || errors.name || !phoneDigits) {
      const firstInvalid = errors.time
        ? "[name=time]:not(:disabled)"
        : errors.name
          ? "#booking-name"
          : "#booking-phone";
      const el = e.currentTarget.querySelector<HTMLElement>(firstInvalid);
      // Centre it so the sticky summary bar doesn't cover the field.
      el?.scrollIntoView({ block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }

    const ref = bookingRef();
    const lines = [
      ["Session", `${plan.name} (${duration(plan.minutes)})`],
      ["Date", longDate(day.date)],
      ["Time", timeRange ?? ""],
      ["Drivers", plan.perDriver ? String(drivers) : `Private grid, up to ${MAX_DRIVERS}`],
      ["Total", rupees(total)],
      ["Name", name.trim()],
      ["Mobile", `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`],
      ["Booking ref", ref],
    ];
    const message = [
      `Hi ${site.name}! I'd like to book a session.`,
      "",
      ...lines.map(([k, v]) => `${k}: ${v}`),
    ].join("\n");
    const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

    setConfirmation({ ref, whatsappUrl, lines });
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function reset() {
    setConfirmation(null);
    setHour(null);
    setAttempted(false);
  }

  if (confirmation) {
    return (
      <div
        className="booking-card confirmation"
        role="status"
        ref={scrollIntoViewOnMount}
      >
        <span className="confirmation-badge">
          <CheckIcon size={22} />
        </span>
        <h3>Request ready to send</h3>
        <p className="muted">
          We&apos;ve opened WhatsApp with your booking details. Hit send and
          we&apos;ll confirm your slot.
        </p>
        <dl className="confirmation-list">
          {confirmation.lines.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="confirmation-actions">
          <a
            className="btn btn-primary btn-block"
            href={confirmation.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon /> Open WhatsApp again
          </a>
          <a className="btn btn-ghost btn-block" href={`tel:${site.phones[0].tel}`}>
            <PhoneIcon /> Call to confirm
          </a>
          <button type="button" className="text-button" onClick={reset}>
            Book another slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="booking-card" onSubmit={submit} noValidate>
      <fieldset className="step">
        <legend>
          <span className="step-num">1</span> Session
        </legend>
        <div className="plan-options">
          {plans.map((p) => (
            <label key={p.id} className="choice">
              <input
                type="radio"
                name="plan"
                value={p.id}
                checked={p.id === plan.id}
                onChange={() => setPlanId(p.id)}
              />
              <span className="choice-body plan-choice">
                <span className="plan-choice-name">{p.name}</span>
                <span className="plan-choice-meta">
                  {duration(p.minutes)} · {rupees(p.price)}
                  {p.perDriver ? "/driver" : "/group"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="step">
        <legend>
          <span className="step-num">2</span> Date
        </legend>
        {now === null ? (
          <div className="date-strip" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="choice-body date-choice placeholder" />
            ))}
          </div>
        ) : (
          <div className="date-strip">
            {days.map((d, i) => {
              const open = hasSlots(d);
              return (
                <label key={d.key} className="choice">
                  <input
                    type="radio"
                    name="date"
                    value={d.key}
                    checked={d.key === day?.key}
                    disabled={!open}
                    onChange={() => setDateKey(d.key)}
                  />
                  <span className="choice-body date-choice">
                    <span className="date-weekday">
                      {i === 0 ? "Today" : i === 1 ? "Tmrw" : weekday(d.date)}
                    </span>
                    <span className="date-day">{d.date.getDate()}</span>
                    <span className="date-month">{month(d.date)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="step" aria-describedby={show("time") ? "time-error" : undefined}>
        <legend>
          <span className="step-num">3</span> Start time
        </legend>
        <div className="time-grid">
          {now === null
            ? Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="choice-body time-choice placeholder" />
              ))
            : slots.map((s) => (
                <label key={s.hour} className="choice">
                  <input
                    type="radio"
                    name="time"
                    value={s.hour}
                    checked={s.hour === time}
                    disabled={!s.available}
                    onChange={() => setHour(s.hour)}
                  />
                  <span className="choice-body time-choice">
                    {formatTime(s.hour * 60)}
                  </span>
                </label>
              ))}
        </div>
        {show("time") && (
          <p id="time-error" className="field-error">
            {errors.time}
          </p>
        )}
      </fieldset>

      <fieldset className="step">
        <legend>
          <span className="step-num">4</span> Drivers
        </legend>
        {plan.perDriver ? (
          <div className="stepper">
            <button
              type="button"
              className="stepper-button"
              aria-label="Remove a driver"
              disabled={drivers <= 1}
              onClick={() => setDrivers((n) => Math.max(1, n - 1))}
            >
              <MinusIcon />
            </button>
            <output className="stepper-value" aria-live="polite">
              {drivers} {drivers === 1 ? "driver" : "drivers"}
            </output>
            <button
              type="button"
              className="stepper-button"
              aria-label="Add a driver"
              disabled={drivers >= MAX_DRIVERS}
              onClick={() => setDrivers((n) => Math.min(MAX_DRIVERS, n + 1))}
            >
              <PlusIcon />
            </button>
            <span className="stepper-hint">Up to {MAX_DRIVERS} rigs</span>
          </div>
        ) : (
          <p className="muted">
            The whole studio is yours: all {MAX_DRIVERS} rigs for your group.
          </p>
        )}
      </fieldset>

      <fieldset className="step">
        <legend>
          <span className="step-num">5</span> Your details
        </legend>
        <div className="field">
          <label htmlFor="booking-name">Name</label>
          <input
            id="booking-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(show("name"))}
            aria-describedby={show("name") ? "name-error" : undefined}
          />
          {show("name") && (
            <p id="name-error" className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="booking-phone">Mobile number</label>
          <div className="phone-input">
            <span aria-hidden="true">+91</span>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={18}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(show("phone"))}
              aria-describedby={show("phone") ? "phone-error" : undefined}
            />
          </div>
          {show("phone") && (
            <p id="phone-error" className="field-error">
              {errors.phone}
            </p>
          )}
        </div>
      </fieldset>

      <div className="booking-summary">
        <div className="summary-text">
          <p className="summary-line">
            {plan.name}
            {day && ` · ${weekday(day.date)} ${day.date.getDate()} ${month(day.date)}`}
            {timeRange ? ` · ${timeRange}` : ""}
          </p>
          <p className="summary-total">
            {rupees(total)}
            <span>
              {plan.perDriver
                ? `${drivers} × ${rupees(plan.price)}`
                : `flat · up to ${MAX_DRIVERS} drivers`}
            </span>
          </p>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          <WhatsAppIcon /> Book on WhatsApp
        </button>
      </div>
    </form>
  );
}

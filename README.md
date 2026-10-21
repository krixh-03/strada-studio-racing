# Strada Racing Studio

A mobile-first, single-page site for Strada Racing Studio, a sim racing venue in Hyderabad. It has a hero, a studio overview, pricing, a slot booking flow and a visit section.

Built with Next.js (App Router) and plain CSS. There is no database: a booking request opens WhatsApp with the details filled in, and the studio confirms the slot there.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where to edit things

| What | File |
| --- | --- |
| Phone numbers, WhatsApp number, maps link, hours, rig count | `lib/site.ts` |
| Session names, durations and prices | `lib/site.ts` (`plans`) |
| Page copy and sections | `app/page.tsx` |
| Booking flow | `components/booking.tsx` |
| Colours, type, layout | `app/globals.css` |
| Photos and logo | `public/images/` |

## How booking works

1. The visitor picks a session, a date (the next 14 days), a start time, the number of drivers and enters their name and mobile number.
2. Start times run hourly from opening time. The session has to finish by closing time. Slots less than an hour away are disabled.
3. On submit, WhatsApp opens to `site.whatsapp` with the booking details filled in and a reference code such as `SRS-7K2QF`. The studio replies to confirm.

Slot availability isn't tracked. To block out slots that are already taken, add a store (for example Vercel Postgres or Supabase) and a route handler that holds a slot when a request comes in.

## Placeholder content to confirm with the studio

- Prices and session formats in `lib/site.ts`
- Opening hours (currently 11 AM – 11 PM daily)
- That +91 85006 19593 is on WhatsApp
- Street address (the site currently shows "Hyderabad, Telangana" with a Google Maps link)
- Photos, which were cropped from Instagram and Google Maps screenshots. Swap in the originals for sharper images.

## Deploy

Import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js, so no settings are needed.

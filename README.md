# AI Project Launchpad — Growth Engine

A local demo growth-operations console for a simulated seven-day campaign to acquire 500 workshop registrations on a ₹2,000 budget.

## Run locally

Install Node.js 20+ and run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Build with `npm run build`.

## Included functionality

- Public registration with validation, email normalization, duplicate blocking, first-touch referral attribution, and WhatsApp/copy sharing.
- Protected local-demo operations pages for dashboard, registrations, ambassadors, analytics, budget, and settings.
- Persistent browser-local demo scenarios, filters, CSV export, referrals, expense editing, and deterministic insights.

## Data and security

This repository currently runs only in clearly labelled demo mode using browser local storage. It has no Supabase project, credentials, server, or production administrator authentication. Do not use the demo store for real student personal data. A production deployment requires Supabase Auth, database migrations, RLS policies, and server-side registration validation/deduplication.

## Environment variables

None are required for demo mode. A future Supabase integration should use only public client configuration in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never expose a service-role key in the browser.

## Verification

`npm run build` passed on 29 October 2026. There are no automated tests yet.

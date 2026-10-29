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

Demo mode uses browser local storage. Production registration is available when Demo Mode is disabled and Supabase is configured. Do not use the current dashboard, registrations list, or admin controls for real student data yet: production administrator authentication and server-backed dashboard queries still need to be connected.

## Environment variables

Demo mode needs no environment variables. For Supabase registration, copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never expose a service-role key in the browser.

## Supabase activation

1. In the Supabase SQL Editor, run `supabase/migrations/20261029_initial_growth_engine.sql` once.
2. Create an administrator with Supabase Auth, then insert its `auth.users.id` into `public.profiles` with `is_admin = true`.
3. In Render, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build-time environment variables, then redeploy.
4. Disable Demo Mode before accepting production registrations. The public registration form then uses the `register_workshop` RPC, which normalizes email, blocks duplicates through a database constraint, validates active referral codes, and does not grant browser users read access to registration records.

The migration enables RLS and exposes only two anonymous RPCs: referral-code validation and registration creation. It does not expose `registrations` through table select policies.

## Verification

`npm run build` passed on 29 October 2026. There are no automated tests yet.

# FocusCircle

FocusCircle is a productivity and collaboration SaaS for individuals and small groups (“Circles”) to manage tasks, share goals, track progress, and stay accountable together.

## Features
- Personal task management with priorities, due dates, and statuses
- Circle workspaces with roles, members, and activity feeds
- Kanban task board
- Shared goals with progress tracking
- Threaded comments with mentions and reactions
- In-app notifications and email delivery
- Productivity analytics dashboards
- Supabase Auth, Realtime, and Storage integrations

## Tech Stack
- Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- Supabase Postgres, Auth, Realtime, Storage
- Recharts for analytics
- Vitest + Testing Library for tests

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Configure environment variables in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
3. Run the dev server:
```bash
npm run dev
```

## Database & Supabase
- Apply the schema in `supabase/schema.sql`
- Demo data is available in `supabase/seed.sql`
- Enable RLS policies in Supabase
- Create a public Storage bucket named `avatars`
- Configure Supabase Auth redirect URLs for:
  - `/login`
  - `/reset-password`

## Demo Seed
Run `supabase/seed.sql` in Supabase Dashboard -> SQL Editor after migrations/schema are applied.

Demo logins:
- `owner@focuscircle.test` / `Password123!`
- `admin@focuscircle.test` / `Password123!`
- `member@focuscircle.test` / `Password123!`

## Email Notifications
- Email delivery uses Resend.
- Users can toggle email preferences in Profile Settings.
- Deadline reminders are sent by calling `/api/notifications/deadlines` with `Authorization: Bearer <CRON_SECRET>`.

## Billing (Stripe)
- Pro is billed via Stripe subscriptions (`$9 per user / month`).
- Set `STRIPE_PRO_PRICE_ID` to the Stripe Price ID for the Pro monthly plan.
- Configure a Stripe webhook endpoint to `POST /api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
- The webhook listens for `customer.subscription.*` events and updates `public.subscriptions` + the user plan/limits.

## Scripts
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run test` — test suite
- `npm run typecheck` — TypeScript validation

## CI/CD
- GitHub Actions CI is defined in `.github/workflows/ci.yml`.
- CI runs install, typecheck, tests, and build.

## Vercel Deployment
Build settings:
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

Set Production env vars in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

## Troubleshooting
- Build fails with missing Supabase env: ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set in the build environment.
- Middleware errors on Vercel: check edge logs and verify env values exist in Production.

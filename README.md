# Local Service Lead Machine (Next.js + Prisma)

Production-ready MVP for selling done-for-you lead capture systems to local service businesses.

## Tech stack
- Next.js 14 App Router + TypeScript + Tailwind
- Prisma ORM + SQLite (MVP)
- Resend email notifications + Twilio SMS notifications
- Zod + React Hook Form for validation
- Custom secure admin session cookie auth

## Local setup
1. `cp .env.example .env`
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run dev`
6. Open `http://localhost:3000` and admin at `/admin`.

## Deploy on Vercel
1. Push repo to GitHub.
2. Import project in Vercel.
3. Add environment variables from `.env.example`.
4. Set build command: `npm run build` (default is fine).
5. Set install command: `npm install`.
6. Add post-deploy command: `npx prisma migrate deploy && npm run prisma:seed` (via CI or Vercel build step).
7. Deploy and verify `/`, `/admin`, `/sitemap.xml`, `/robots.txt`.

## Create a new client in under 10 minutes
1. `npm run new:client -- --name "ACME Detailing"`
2. Open generated file in `clients/<slug>.json` and customize all content.
3. Visit `/admin/settings` and fine tune JSON and business settings.
4. Preview via `/?client=<slug>`.
5. Point DNS and set client hostname in DB for automatic host-based rendering.

## Resend + Twilio setup
- Resend: create API key + verified sender domain, fill `RESEND_API_KEY` and `RESEND_FROM`.
- Twilio: create phone number + API credentials, fill `TWILIO_*` and destination `NOTIFY_SMS_TO`.
- Toggle channels per client in `/admin/settings`.

## Sales checklist (for onboarding business owner)
- Business name + logo URL
- Services + pricing tiers + offers
- Service area cities/ZIPs
- Phone number + lead recipient email
- Stripe Payment Link for deposit CTA
- Testimonials + FAQ
- Preferred booking lead time and hours
- Domain/hostname to map this client

## Commands
- `npm run dev`
- `npm run build`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run new:client -- --name "Business Name"`

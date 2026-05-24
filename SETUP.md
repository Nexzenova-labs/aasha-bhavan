# Aasha Bhavan — Complete Setup & Deployment Guide

> Full-stack Next.js 14 app for Aasha Bhavan orphanage, Hyderabad.
> Stack: Next.js 14 · Supabase · Razorpay · Resend · nodemailer · pdf-lib

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Environment Variables](#2-environment-variables)
3. [Supabase Setup](#3-supabase-setup)
4. [Storage Buckets](#4-storage-buckets)
5. [Razorpay Setup](#5-razorpay-setup)
6. [Resend Setup (Donation Receipts)](#6-resend-setup-donation-receipts)
7. [SMTP Setup (Newsletter Campaigns)](#7-smtp-setup-newsletter-campaigns)
8. [Admin Panel — First-Time Setup](#8-admin-panel--first-time-setup)
9. [Cron Jobs (Scheduled Email Campaigns)](#9-cron-jobs-scheduled-email-campaigns)
10. [Vercel Deployment](#10-vercel-deployment)
11. [Post-Deployment Checklist](#11-post-deployment-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Structure

```
aasha-bhavan-app/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, SEO, Razorpay script
│   ├── page.tsx                  # Public homepage (hero, residents, donate, events…)
│   ├── globals.css               # Design system CSS variables
│   │
│   ├── admin/                    # Admin panel (protected by middleware)
│   │   ├── layout.tsx            # Sidebar + topbar shell
│   │   ├── page.tsx              # Dashboard — stats, chart, quick actions
│   │   ├── login/page.tsx        # Login page (Supabase auth)
│   │   ├── donations/page.tsx    # Donations table + bulk CSV import
│   │   ├── volunteers/page.tsx   # Volunteer applications + approve/reject/delete
│   │   ├── residents/page.tsx    # Residents CRUD + bulk CSV import
│   │   ├── messages/page.tsx     # Contact inbox — read, reply, delete
│   │   ├── gallery/page.tsx      # Photo gallery — upload, feature, delete
│   │   ├── campaigns/page.tsx    # Email campaigns — create, preview, schedule, send
│   │   └── settings/page.tsx     # Org info, contact, bank, SMTP, social media
│   │
│   └── api/                      # Server-side API routes
│       ├── donations/
│       │   ├── create-order/     # POST — creates Razorpay order
│       │   └── verify/           # POST — verifies payment, saves to DB, sends receipt
│       ├── contact/              # POST — saves message, sends ack email
│       ├── volunteer/            # POST — saves application
│       ├── newsletter/           # POST — subscribes email to newsletter_subscribers
│       ├── activity/             # GET  — returns latest 20 activity feed items
│       ├── campaigns/
│       │   ├── route.ts          # GET/POST/DELETE campaigns
│       │   └── send/route.ts     # POST — send campaign now or test email
│       └── cron/
│           └── send-campaigns/   # GET  — called by cron, sends due scheduled campaigns
│
├── lib/                          # Shared server-side utilities
│   ├── supabase.ts               # Browser Supabase client (anon key)
│   ├── supabase-admin.ts         # Server Supabase client (service role key)
│   ├── email.ts                  # Resend — donation receipts, contact acks
│   ├── mailer.ts                 # nodemailer — newsletter SMTP sending
│   ├── email-templates.ts        # 6 HTML email templates (newsletter, events…)
│   └── pdf-receipt.ts            # pdf-lib — generates 80G tax receipt PDF
│
├── database/
│   └── schema.sql                # Complete Supabase schema — run this first
│
├── middleware.ts                 # Protects /admin/* routes (redirects to /admin/login)
├── next.config.mjs               # serverExternalPackages, image domains
├── .env.local                    # Local secrets (never commit this)
├── .env.example                  # Template — fill and rename to .env.local
└── SETUP.md                      # This file
```

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in every value.

```bash
cp .env.example .env.local
```

### Full variable reference

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard → Settings → API → service_role key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Dashboard → Settings → API Keys |
| `RESEND_API_KEY` | ✅ | resend.com → API Keys → Create Key |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender in Resend (e.g. receipts@yourdomain.org) |
| `ADMIN_EMAIL` | ✅ | Your admin inbox — gets notified of new donations/contacts |
| `NEXT_PUBLIC_ORG_NAME` | ✅ | Display name (e.g. "Aasha Bhavan") |
| `NEXT_PUBLIC_ORG_PHONE` | ✅ | Org phone shown on public site |
| `NEXT_PUBLIC_ORG_WHATSAPP` | ✅ | WhatsApp number with country code, digits only |
| `NEXT_PUBLIC_ORG_EMAIL` | ✅ | Contact email shown on public site |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` dev / `https://yourdomain.org` prod |
| `NEXTAUTH_SECRET` | ✅ | Random 32-char string — `openssl rand -base64 32` |
| `CRON_SECRET` | ✅ | Random secret for cron endpoint auth — keep private |

> **Important:** `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in them.

### Generating secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -hex 24
```

---

## 3. Supabase Setup

### Step 1 — Create project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note the **Project URL** and **API keys** (Settings → API)

### Step 2 — Run the main schema

Open **SQL Editor** in Supabase Dashboard and run the entire contents of `database/schema.sql`.

This creates all 12 tables:

| Table | Purpose |
|---|---|
| `donations` | Every payment processed via Razorpay |
| `volunteers` | Volunteer applications from the website form |
| `contact_messages` | Contact form submissions |
| `residents` | Anonymised residents shown publicly (children & elders) |
| `sponsorships` | Donor ↔ resident monthly sponsorship links |
| `gallery_photos` | Photo URLs from Supabase Storage |
| `events` | Upcoming events shown on homepage |
| `event_registrations` | RSVP registrations for events |
| `newsletter_subscribers` | Email addresses collected from newsletter form |
| `goods_donations` | In-kind donation requests |
| `activity_feed` | Live ticker feed on homepage |
| `org_settings` | Key-value store for all org settings (editable from admin) |

### Step 3 — Run the campaigns table

Run this separately in SQL Editor (not in `schema.sql` yet):

```sql
CREATE TABLE email_campaigns (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject        TEXT NOT NULL,
  template_type  TEXT NOT NULL,
  html_body      TEXT NOT NULL,
  status         TEXT DEFAULT 'draft',
  scheduled_at   TIMESTAMPTZ,
  sent_at        TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Only service role can access (admin only)
-- No public policies needed — all access via service role key
```

### Step 4 — Enable Email Auth

1. Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** provider is **Enabled**
3. Go to **Authentication** → **Settings**
4. Set **"Confirm email"** to **OFF** (or manually confirm your admin user)

### Step 5 — Create admin user

1. Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Email: your admin email
3. Password: strong password
4. Click **Create User**
5. If email confirmation is ON → click the user → **Send confirmation email** → confirm it

### Step 6 — Row Level Security (RLS)

RLS is already configured in `schema.sql`:

- **Public read**: `residents`, `gallery_photos`, `events`, `activity_feed`, `org_settings`
- **Public insert**: `contact_messages`, `volunteers`, `newsletter_subscribers`, `event_registrations`, `goods_donations`
- **Admin only** (via service role key, bypasses RLS): `donations`, all writes, all reads on sensitive tables

> The service role key (`SUPABASE_SERVICE_ROLE_KEY`) **bypasses all RLS policies**. Only use it server-side in API routes — never in browser code.

---

## 4. Storage Buckets

Supabase Dashboard → **Storage** → **New Bucket**

### Bucket 1: `receipts` (private)

- **Name**: `receipts`
- **Public**: OFF
- **Max file size**: 10 MB
- **Allowed MIME types**: `application/pdf`
- **Purpose**: 80G tax receipt PDFs uploaded after each donation and linked in the email

```sql
-- Run in SQL Editor after creating the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('receipts', 'receipts', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Allow service role to upload
CREATE POLICY "Service role can upload receipts"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'receipts');
```

### Bucket 2: `gallery` (public)

- **Name**: `gallery`
- **Public**: ON
- **Max file size**: 5 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- **Purpose**: Photos uploaded from admin gallery page

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read gallery"
ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Service role can upload gallery"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Service role can delete gallery"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'gallery');
```

---

## 5. Razorpay Setup

### Create account

1. Go to [razorpay.com](https://razorpay.com) → Sign Up
2. Complete KYC (required for live payments — needs org PAN, bank account)

### Get API keys

1. Dashboard → **Settings** → **API Keys** → **Generate Key**
2. Copy **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
3. Copy **Key Secret** → `RAZORPAY_KEY_SECRET`

### Test vs Live

- Use `rzp_test_XXXX` keys during development — test payments use test cards
- Switch to `rzp_live_XXXX` keys only after KYC is approved
- Test card: `4111 1111 1111 1111` · Any future expiry · Any CVV

### Webhook (optional but recommended)

To handle payment status outside the browser flow:

1. Dashboard → **Settings** → **Webhooks** → **Add New Webhook**
2. URL: `https://yourdomain.org/api/donations/verify`
3. Events: `payment.captured`, `payment.failed`
4. Secret: add to `.env.local` as `RAZORPAY_WEBHOOK_SECRET`

---

## 6. Resend Setup (Donation Receipts)

Resend is used to send 80G tax receipts to donors and admin notifications.

### Create account

1. Go to [resend.com](https://resend.com) → Sign Up (free: 3,000 emails/month)
2. **API Keys** → **Create API Key** → Copy → `RESEND_API_KEY`

### Verify your domain

1. Resend Dashboard → **Domains** → **Add Domain**
2. Add DNS records (SPF, DKIM, DMARC) to your domain registrar
3. Once verified, set `RESEND_FROM_EMAIL` to `receipts@yourdomain.org`

> Without domain verification, emails go to spam or get blocked.

### What Resend sends

| Trigger | Recipient | Template |
|---|---|---|
| Successful donation | Donor | HTML receipt with 80G details + PDF download link |
| Successful donation | Admin (`ADMIN_EMAIL`) | Plain notification with donor + amount |
| Contact form submission | Contact submitter | Acknowledgement email |

---

## 7. SMTP Setup (Newsletter Campaigns)

SMTP is used only for newsletter campaigns created from **Admin → Campaigns**. It is configured from the admin settings panel (not `.env.local`).

### After first login

1. Go to **Admin → Settings → Email (SMTP) Configuration**
2. Fill in the details for your email provider:

### Gmail

```
Host:     smtp.gmail.com
Port:     587
Username: yourname@gmail.com
Password: [App Password — NOT your Gmail password]
From:     care@aashabhavan.org  (or your Gmail)
```

> Gmail requires an **App Password** (not your regular password).
> Google Account → Security → 2-Step Verification → App Passwords → Generate

### Zoho Mail (recommended for orgs)

```
Host:     smtp.zoho.in
Port:     587
Username: info@aashabhavan.org
Password: Your Zoho password
From:     info@aashabhavan.org
```

### Other providers

| Provider | Host | Port |
|---|---|---|
| Outlook / Hotmail | smtp-mail.outlook.com | 587 |
| Yahoo | smtp.mail.yahoo.com | 587 |
| Brevo (Sendinblue) | smtp-relay.brevo.com | 587 |
| Mailgun | smtp.mailgun.org | 587 |

### Test the connection

After filling SMTP details in Settings, click **Send Test** → enter your own email → if it arrives, SMTP is working.

---

## 8. Admin Panel — First-Time Setup

Do these steps in order after deployment.

### Step 1 — Log in

Go to `https://yourdomain.org/admin/login` → use the Supabase user credentials you created.

### Step 2 — Fill Org Settings

Admin → **Settings** → fill all sections and click **Save All Settings**:

- [ ] Organisation name, tagline, address
- [ ] Registration number, 80G certificate number
- [ ] Phone, WhatsApp, email, website
- [ ] Bank name, account holder, account number, IFSC, UPI
- [ ] SMTP details (for newsletters)
- [ ] Social media links

### Step 3 — Add real residents

Admin → **Residents** → either:
- Use **Bulk Import** with a CSV file (download sample template from the page)
- Or click **Add Resident** to add one at a time

### Step 4 — Upload gallery photos

Admin → **Gallery** → add captions, categories, upload photos. Mark key photos as Featured (⭐) — these appear on the homepage.

### Step 5 — Test a donation

1. Use Razorpay test keys in `.env.local`
2. Visit homepage → click Donate → complete a test payment
3. Check Admin → Donations — it should appear
4. Check your inbox — receipt email should arrive

### Step 6 — Send a test newsletter

1. Admin → **Campaigns** → **New Campaign**
2. Pick any template → fill details
3. Use the **Send Test** button to send to yourself
4. Verify it looks correct in your email client

---

## 9. Cron Jobs (Scheduled Email Campaigns)

When an admin schedules a campaign for a future date, it is stored in the database with `status = 'scheduled'`. An external cron job must call the following endpoint daily to trigger sending:

```
GET https://yourdomain.org/api/cron/send-campaigns
Authorization: Bearer YOUR_CRON_SECRET
```

The endpoint:
1. Finds all campaigns where `status = 'scheduled'` AND `scheduled_at <= now()`
2. Sends each one to all active newsletter subscribers via SMTP
3. Marks them `status = 'sent'`

### Option A — cron-job.org (free, recommended)

1. Go to [cron-job.org](https://cron-job.org) → Sign up (free)
2. Click **Create Cronjob**
3. Fill in:
   - **Title**: Aasha Bhavan Campaign Scheduler
   - **URL**: `https://yourdomain.org/api/cron/send-campaigns`
   - **Schedule**: Daily at 08:00 AM IST (UTC+5:30 = 02:30 UTC)
4. Under **Headers** → Add:
   - Key: `Authorization`
   - Value: `Bearer YOUR_CRON_SECRET` (from `.env.local`)
5. Save → Enable

### Option B — Vercel Cron Jobs (if deployed on Vercel)

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-campaigns",
      "schedule": "30 2 * * *"
    }
  ]
}
```

> `30 2 * * *` = 02:30 UTC = 08:00 IST daily

Add this to your Vercel project's **Environment Variables**:
```
CRON_SECRET = your-secret-here
```

Vercel automatically adds `Authorization: Bearer <CRON_SECRET>` header for you.

> Free Vercel plan: 2 cron invocations/day max. Paid plan: unlimited.

### Option C — GitHub Actions (completely free)

Create `.github/workflows/cron.yml`:

```yaml
name: Send Scheduled Campaigns
on:
  schedule:
    - cron: '30 2 * * *'   # 02:30 UTC = 08:00 IST
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger campaign send
        run: |
          curl -X GET https://yourdomain.org/api/cron/send-campaigns \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` in GitHub → Settings → Secrets → Actions.

---

## 10. Vercel Deployment

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Aasha Bhavan app"
git remote add origin https://github.com/yourorg/aasha-bhavan-app.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the GitHub repository
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `aasha-bhavan-app` (if your repo has it in a subfolder)

### Step 3 — Add Environment Variables

In Vercel project → **Settings** → **Environment Variables**, add every variable from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_EMAIL
NEXT_PUBLIC_ORG_NAME
NEXT_PUBLIC_ORG_PHONE
NEXT_PUBLIC_ORG_WHATSAPP
NEXT_PUBLIC_ORG_EMAIL
NEXT_PUBLIC_APP_URL          ← set to https://yourdomain.org
NEXTAUTH_SECRET
CRON_SECRET
```

> Set `NEXT_PUBLIC_APP_URL` to your **production URL**, not localhost.

### Step 4 — Custom Domain

1. Vercel → Project → **Settings** → **Domains** → Add `aashabhavan.org`
2. Add the CNAME/A record at your domain registrar as instructed
3. Vercel provisions HTTPS automatically

### Step 5 — Deploy

Click **Deploy** or push to `main` — Vercel auto-deploys on every push.

---

## 11. Post-Deployment Checklist

Run through these after going live:

### Database
- [ ] `schema.sql` executed in Supabase SQL Editor
- [ ] `email_campaigns` table created (SQL in Section 3, Step 3)
- [ ] Storage buckets `receipts` and `gallery` created
- [ ] RLS policies active (check Supabase → Table Editor → RLS)

### Authentication
- [ ] Admin user created in Supabase Auth
- [ ] Email confirmed (or confirmation disabled)
- [ ] Login works at `/admin/login`

### Payments
- [ ] Razorpay live keys in Vercel env vars
- [ ] KYC completed on Razorpay
- [ ] Test donation end-to-end (real payment, receipt email received)

### Email
- [ ] Resend domain verified
- [ ] `RESEND_FROM_EMAIL` is the verified domain email
- [ ] Donation receipt arrives in donor inbox (not spam)
- [ ] SMTP configured in Admin → Settings
- [ ] Test newsletter email received

### Cron
- [ ] cron-job.org or Vercel cron configured
- [ ] `CRON_SECRET` matches in both `.env` and cron header
- [ ] Test cron by calling the endpoint manually with curl

### Content
- [ ] Org settings filled (Admin → Settings)
- [ ] Real residents added (or CSV imported)
- [ ] Gallery photos uploaded
- [ ] Homepage content reviewed

### Security
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in server env vars (not `NEXT_PUBLIC_`)
- [ ] `CRON_SECRET` is a strong random string
- [ ] `.env.local` is in `.gitignore` (never committed)

---

## 12. Troubleshooting

### "Your project's URL and Key are required"
- `.env.local` file is missing or not loaded
- Make sure file is named `.env.local` (not `.env.example`)
- Restart dev server after creating/editing `.env.local`

### Admin login redirects back to login
- Session cookie not being set — check middleware is excluding `/admin/login`
- Confirm the user's email in Supabase Auth → Users

### Razorpay "Key ID is not valid"
- Using test key on production or vice versa
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` must match `RAZORPAY_KEY_SECRET` (both test or both live)

### Donation receipt email not sent
- `RESEND_API_KEY` is invalid or placeholder
- `RESEND_FROM_EMAIL` domain is not verified in Resend
- Check Vercel function logs for error details

### Newsletter not sending
- SMTP credentials not saved (go to Admin → Settings → SMTP)
- Gmail: must use App Password, not account password
- Port 465 requires `secure: true` — use port 587 instead
- Check campaign status in Admin → Campaigns (should say "Sent" after cron runs)

### Cron not triggering
- Verify `Authorization: Bearer CRON_SECRET` header matches exactly
- Call the endpoint manually: `curl -H "Authorization: Bearer <secret>" https://yourdomain.org/api/cron/send-campaigns`
- Check campaign `scheduled_at` is in the past (UTC)

### "Cannot find module './682.js'" (webpack chunk error)
- Stale `.next` build cache
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

### PDF receipt upload fails
- `receipts` storage bucket not created
- Service role policy on `storage.objects` not added (see Section 4)

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/donations/create-order` | None | Creates Razorpay order |
| POST | `/api/donations/verify` | None | Verifies payment, saves to DB, sends receipt |
| POST | `/api/contact` | None | Saves contact form message |
| POST | `/api/volunteer` | None | Saves volunteer application |
| POST | `/api/newsletter` | None | Subscribes email to newsletter |
| GET | `/api/activity` | None | Returns last 20 activity feed items |
| GET | `/api/campaigns` | Admin session | Lists all campaigns |
| POST | `/api/campaigns` | Admin session | Creates a campaign |
| DELETE | `/api/campaigns` | Admin session | Deletes a campaign |
| POST | `/api/campaigns/send` | Admin session | Sends campaign or test email |
| GET | `/api/cron/send-campaigns` | `CRON_SECRET` | Sends all due scheduled campaigns |

---

## Quick Reference — Key Files to Edit

| What to change | File |
|---|---|
| Homepage content, resident data | `app/page.tsx` |
| Email receipt template | `lib/email.ts` |
| PDF receipt layout | `lib/pdf-receipt.ts` |
| Newsletter email templates | `lib/email-templates.ts` |
| Admin sidebar navigation | `app/admin/layout.tsx` |
| Database schema | `database/schema.sql` |
| SMTP / org settings in DB | Admin panel → Settings |
| All secrets | `.env.local` (dev) / Vercel env vars (prod) |

---

*Last updated: May 2026 · Built for Aasha Bhavan, Hyderabad*

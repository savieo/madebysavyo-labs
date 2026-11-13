# MadeBySavyo Labs — Admin Dashboard Setup

This repository now contains the private admin workspace and the Supabase backend foundation. The dashboard is **not connected to a database until you create a Supabase project and configure its public URL/key**. This is intentional: no secret project credentials are stored in GitHub.

## What this module adds
- Private admin login by email magic link (no public sign-up).
- Overview metrics: new enquiries, open quotes, active print jobs and delivered orders.
- Enquiries: list, search, filter, status changes, manual entry and Gmail reply shortcut.
- Quotes: cost breakdown and draft quote records.
- Print queue: order tracking from queued through delivered, with material, colour, estimated grams and hours.
- Customer records.
- Filament inventory.
- Internal model catalogue with creator/source/format/licence and review state.
- Review moderation and project-story publishing controls.
- Manual payment recording for cash and Interac e-Transfer.
- RLS-protected Postgres tables and a private Storage bucket.
- FormSubmit webhook receiver to mirror new web enquiries/reviews into the dashboard while FormSubmit continues emailing the business inbox.

## 1. Create the Supabase project
1. Open https://supabase.com/dashboard and create a project named **MadeBySavyo Labs**.
2. Choose a strong database password and keep it in your password manager.
3. Open Project Settings → API.
4. Copy the **Project URL** and the **publishable key** (or legacy anon key).
5. Edit `admin/config.js` in this repository and paste those into `url` and `anonKey`.
6. Commit the change. The publishable/anon key is intended for browser use; do not put a service_role/secret key in this file.

## 2. Create the tables and access rules
1. In Supabase, open SQL Editor → New query.
2. Copy the full contents of `supabase/schema.sql` and run it.
3. In Authentication → Users, create/invite `savieoseb@gmail.com`.
4. Open the new Auth user and copy its UUID.
5. Run this SQL with the real UUID:

    insert into public.admin_users (user_id, email)
    values ('PASTE-AUTH-USER-UUID-HERE', 'savieoseb@gmail.com')
    on conflict (user_id) do nothing;

Only users listed in `public.admin_users` can read or change operational records. Do not add customer users to this allow-list.

## 3. Configure the magic-link redirect
In Supabase → Authentication → URL Configuration:
- Site URL: `https://savieo.github.io`
- Add redirect URL: `https://savieo.github.io/madebysavyo-labs/admin/`
- Add redirect URL: `https://savieo.github.io/madebysavyo-labs/admin/index.html`

The admin page uses a magic link and sets `shouldCreateUser: false`, so it will not create an admin account from the public login screen. Supabase limits magic-link redirects to configured URLs. Documentation: https://supabase.com/docs/guides/auth/auth-email-passwordless

## 4. Deploy the FormSubmit webhook
Use the Supabase CLI from a local clone of the repository:

    supabase login
    supabase link --project-ref YOUR_PROJECT_REF
    supabase functions deploy formsubmit-webhook --no-verify-jwt

The function uses the hosted project's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. Never commit the service-role key to GitHub or place it in browser JavaScript.

## 5. Keep Gmail notifications and mirror new requests into the dashboard
The public quote and review forms continue submitting to FormSubmit and emailing **savieoseb@gmail.com**.

After the Edge Function has deployed:
1. In `index.html`, add the following hidden field inside the customer quote form:

    <input type="hidden" name="_webhook" value="https://YOUR_PROJECT_REF.supabase.co/functions/v1/formsubmit-webhook">

2. Add the same hidden field inside the customer review form.
3. Commit the change and wait for GitHub Pages to redeploy.
4. Submit a test enquiry and review. Confirm that:
   - The original email still arrives in Gmail.
   - The enquiry or review appears in the Supabase tables.
   - The record appears in the private admin dashboard.

FormSubmit documents the `_webhook` field and shows a JSON payload containing submitted `form_data`: https://formsubmit.co/documentation

### Important webhook and file-handling limits
- FormSubmit continues sending the actual STL/3MF attachments to Gmail. The dashboard mirrors the enquiry and uploaded filenames; it does **not** yet move the file bytes into Supabase Storage.
- FormSubmit's public webhook documentation shows a basic `form_data` example but does not document a signed webhook payload on that page. The receiver can create enquiries and pending reviews only; it cannot create quotes, alter orders, record payments or change admin access.
- Keep FormSubmit CAPTCHA enabled and retain the honeypot field. Review submissions before publishing.
- Treat Gmail as the attachment source until we implement direct, private Supabase Storage uploads using a server-issued upload flow.
- Do not ask customers to submit confidential, regulated or highly sensitive design files through the current email attachment service.

## 6. Open the dashboard
After the GitHub Pages site redeploys:
- Admin: https://savieo.github.io/madebysavyo-labs/admin/
- Public site: https://savieo.github.io/madebysavyo-labs/

Sign in with `savieoseb@gmail.com`. Supabase sends a one-time magic link.

## Model catalogue and community
- The current 12-model shelf remains on the public website.
- Run `supabase/seed-model-catalog.sql` after the schema to preload those same 12 model links into the private admin catalogue.
- Seeded models are deliberately unpublished and unverified. Review the specific model page and licence before marking commercial permission verified or publishing it.
- Admin → Reviews & stories allows review moderation and project-story publishing. Only publish customer work after explicit permission.

## Still future work
- Direct private file uploads to Supabase Storage (instead of relying on email attachments).
- Public model shelf driven dynamically from the curated database.
- Secure customer order-status pages.
- Emailing quotes automatically (Gmail remains manual at this stage).
- Stripe checkout, deposits and recurring subscription billing.
- Automated filament deduction from completed orders.

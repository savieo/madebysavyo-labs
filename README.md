# MadeBySavyo Labs

Public website: https://savieo.github.io/madebysavyo-labs/
Repository: https://github.com/savieo/madebysavyo-labs

## Public website
- Customer-facing 3D-printing services, how-it-works, learning videos and STL discovery shelf.
- Quote request form with file attachment delivery to savieoseb@gmail.com using FormSubmit.
- Customer reviews and privacy/file-handling page.
- Cloudflare Web Analytics loader for the existing savieo.github.io hostname.

## Private operations dashboard
- URL: https://savieo.github.io/madebysavyo-labs/admin/
- Source: admin/index.html, admin/admin.js and admin/config.js.
- Backend: Supabase Auth, Postgres, Row Level Security and private Storage bucket.
- Schema: supabase/schema.sql.
- FormSubmit webhook: supabase/functions/formsubmit-webhook/index.ts.
- Existing 12 curated model links can be seeded with supabase/seed-model-catalog.sql.
- Setup instructions: ADMIN_SETUP.md.

The admin dashboard is not database-connected until a Supabase project is created, admin/config.js is configured, the schema is run and the admin email is allow-listed. No secrets belong in the public repository. Never commit the Supabase service_role key.

## Gmail remains active
FormSubmit continues emailing quote requests and attachments to savieoseb@gmail.com. Once the Supabase Edge Function is deployed and the hidden _webhook field is added to both forms, the same submissions will also be mirrored into the private dashboard. The first implementation stores attachment filenames; Gmail remains the file source until private Storage uploads are implemented.

## Current limitations
- Quotes are saved as drafts; send quote details manually through Gmail.
- Payments are manually recorded; no Stripe checkout is active.
- Monthly plans remain proposed/coming soon.
- Catalogue administration is ready, but the public 12-model shelf is still a curated static section.
- Replace portfolio placeholders only with real customer projects and images approved for public use.

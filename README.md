# MadeBySavyo Labs — public website

Live target: https://savieo.github.io/madebysavyo-labs/

## Publish with GitHub Pages
1. Open https://github.com/savieo/madebysavyo-labs/settings/pages
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose branch **main** and folder **/(root)**, then Save.
4. Wait for the Pages deployment to finish. The public URL is the target above.

## Quote requests and direct file uploads
The quote form currently uses FormSubmit to deliver customer details and attachments to **savieoseb@gmail.com**.
- First, submit a test request after Pages is live.
- FormSubmit will send a one-time activation/confirmation email to the receiving inbox. Open it and activate the form.
- The documented combined upload limit is **10 MB per submission**.
- Accepted file types in the form: STL, 3MF, OBJ, STEP/STP, ZIP, plus reference images/PDF.
- Larger files: ask the customer to submit the enquiry without an attachment and then provide a private transfer route.
- FormSubmit is a third-party service. Do not invite customers to upload confidential, regulated or sensitive design files. Review its data handling terms before taking commercially sensitive customer work.
- Review submissions are sent for manual moderation; they are not published automatically.

Form service documentation: https://formsubmit.co/documentation

## Cloudflare Web Analytics
The site includes a clearly marked placeholder in index.html; tracking is not active until a site-specific token is added.
1. In Cloudflare Dashboard, open **Analytics & Logs → Web Analytics → Add a site**.
2. Add the published hostname **savieo.github.io** (or your custom hostname later).
3. Copy the generated JavaScript beacon snippet.
4. Replace the Cloudflare placeholder comment near the top of index.html with the exact snippet, commit the change, and wait for Pages to redeploy.
5. View metrics in Cloudflare Web Analytics.

Cloudflare setup: https://developers.cloudflare.com/pages/how-to/web-analytics/

## Current modules
- Homepage and services
- Portfolio with one named early project and clearly identified placeholder cards
- How-it-works learning flow
- Video placeholders for real print timelapses
- On-demand quote form with file attachments
- Monthly plan concepts marked **Coming soon** (not active subscriptions)
- Interactive material guide
- Free model platform directory with licensing reminder
- Review submissions sent for manual approval

## Not connected yet
- Stripe payments or recurring subscriptions
- Customer sign-in, order tracking or member portal
- Admin dashboard and permanent order database
- Private file storage and larger secure CAD uploads
- Automatic quote calculation and print-queue management
- Real customer video embeds and additional portfolio photographs

## Material and capability accuracy
Material descriptions are educational guidance only. Availability, printer suitability and colour stock must be confirmed for each quote. The menu does not promise that every filament is currently in stock or accepted for every job.

## Before promoting widely
- Activate the FormSubmit recipient using the email confirmation.
- Test a small STL upload and verify it arrives at the intended inbox.
- Replace portfolio/video placeholders with real content. Obtain permission before displaying customer projects or reviews.
- Publish a privacy notice and service terms explaining file handling, quote acceptance, cancellations/refunds, pickup/delivery, model licensing and customer content permissions.
- Add the Cloudflare Web Analytics token.

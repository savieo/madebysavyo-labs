# MadeBySavyo Labs — public website

Repository: https://github.com/savieo/madebysavyo-labs
Target website: https://savieo.github.io/madebysavyo-labs/

## Publish with GitHub Pages
The repository includes a GitHub Actions Pages deployment workflow at .github/workflows/pages.yml.
1. Open https://github.com/savieo/madebysavyo-labs/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Confirm and save if prompted. The workflow runs on pushes to main and can also be started manually.
4. Open the repository's **Actions** tab and confirm the latest “Deploy MadeBySavyo Labs to GitHub Pages” run succeeds.
5. Once deployment completes, open https://savieo.github.io/madebysavyo-labs/

## Quote requests and direct file uploads
The quote and review forms use FormSubmit to deliver customer details and attachments to **savieoseb@gmail.com**.
- The customer can attach the supported model files directly on the website; no account is required.
- First submission triggers a one-time activation/confirmation email to the recipient. Confirm it before advertising the form as live. FormSubmit says pending submissions are held until confirmation.
- The documented combined file upload ceiling is **10 MB per submission**.
- Accepted quote file types: STL, 3MF, OBJ, STEP/STP, ZIP, plus reference images/PDF.
- Larger files: ask the customer to submit the enquiry without an attachment and then provide a private transfer route.
- FormSubmit is a third-party service. Do not invite confidential, regulated or commercially sensitive designs through this starter form. Review the provider's terms and privacy policy.
- Review submissions go to the business inbox for manual moderation; they are not published automatically.

FormSubmit docs: https://formsubmit.co/documentation
FormSubmit help: https://formsubmit.co/help

## Cloudflare Web Analytics
Cloudflare Web Analytics is configured in the site using the existing site-specific token from the Savieo portfolio for the same hostname, **savieo.github.io**. Both GitHub Pages project sites share the same host and the analytics beacon is loaded on the MadeBySavyo homepage and confirmation page. No second property is required while the same hostname is used.
- Loader: assets/js/analytics.js
- Token is read from a meta tag in index.html and thank-you.html.
- If a custom domain is added later, add/configure that hostname with Cloudflare and update its site token.

Cloudflare guide: https://developers.cloudflare.com/pages/how-to/web-analytics/

## Current modules
- Homepage and services
- Portfolio with one named early project and clearly identified placeholder cards
- How-it-works learning flow
- Video placeholders for real print timelapses
- On-demand quote form with email attachments
- Monthly plan concepts marked **Coming soon** (not active subscriptions)
- Interactive material guide
- Free model platform directory with licensing reminder
- Review submissions sent for manual approval
- Privacy and file-handling page

## Not connected yet
- Stripe payments or recurring subscriptions
- Customer sign-in, order tracking or member portal
- Admin dashboard and permanent order database
- Private file storage and larger secure CAD uploads
- Automatic quote calculation and print-queue management
- Real customer video embeds and additional portfolio photographs

## Material and capability accuracy
Material descriptions are educational guidance only. Availability, printer suitability and colour stock must be confirmed for each quote. The material selector does not promise every filament is currently in stock or accepted for every job.

## Before promoting widely
- Enable GitHub Pages from Settings → Pages → Source: GitHub Actions.
- Confirm the Pages workflow succeeds and test the live site.
- Activate FormSubmit using its email confirmation, then test a small file upload and verify the email arrives.
- Replace portfolio/video placeholders with real content. Obtain permission before displaying customer projects or reviews.
- Review the privacy notice and service terms for the actual way you handle customer files, quote acceptance, cancellations/refunds, pickup/delivery, model licences and customer content.

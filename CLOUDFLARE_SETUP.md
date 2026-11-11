# Cloudflare Web Analytics setup

The site is hosted on GitHub Pages. Cloudflare Web Analytics can track page views and performance without moving DNS or proxying the site through Cloudflare.

1. Publish GitHub Pages first: https://savieo.github.io/madebysavyo-labs/
2. Open Cloudflare Dashboard → Analytics & Logs → Web Analytics → Add a site.
3. Register the actual hostname savieo.github.io. If you later connect a custom domain, register that hostname as well.
4. Copy the unique JavaScript beacon snippet from Cloudflare.
5. Open index.html and replace the placeholder comment near the top of the document with the exact snippet from Cloudflare. Do not use another site's token.
6. Commit the change and wait for GitHub Pages to redeploy.
7. Return to Cloudflare Web Analytics to view page views, visitor metrics and performance.

Cloudflare official instructions: https://developers.cloudflare.com/pages/how-to/web-analytics/

The analytics beacon is not active until the site-specific token is generated from the Cloudflare account that owns the analytics property.

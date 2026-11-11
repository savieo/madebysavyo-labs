# Cloudflare Web Analytics setup

The site is hosted on GitHub Pages. Cloudflare Web Analytics can track a site that is not proxied through Cloudflare by using its JavaScript beacon.

1. Sign in to Cloudflare.
2. Open Web Analytics and choose Add a site.
3. Add the hostname savieo.github.io. This covers the /madebysavyo-labs/ project path. Add a custom hostname too if a custom domain is connected later.
4. Open Manage site and copy the exact JavaScript beacon snippet generated for this site.
5. Edit index.html and paste the snippet in the marked Cloudflare placeholder near the end of the head section.
6. Commit the change; GitHub Actions will publish it.
7. Visit the website, then check Web Analytics. Initial metrics may take a few minutes to appear.

Cloudflare's official steps for sites not proxied through Cloudflare require adding the site hostname, copying the site-specific snippet and inserting it into the website HTML. Do not reuse another site's beacon token.

Official guide: https://developers.cloudflare.com/web-analytics/get-started/

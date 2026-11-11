# Cloudflare Web Analytics

MadeBySavyo Labs reuses the existing Cloudflare Web Analytics site token configured for the GitHub Pages hostname savieo.github.io in the Savieo portfolio repository. The two project sites share the same hostname and are distinguished by their URL paths.

The analytics loader reads the token from a meta tag on index.html and thank-you.html, then loads Cloudflare's official beacon from static.cloudflareinsights.com.

- Main website path: /madebysavyo-labs/
- Existing portfolio path: /savieo/
- Analytics hostname: savieo.github.io
- No separate token is required while both sites remain on the same hostname.

If a custom domain is connected later, add/configure that hostname with Cloudflare Web Analytics and update the token in the meta tags.

Official documentation: https://developers.cloudflare.com/pages/how-to/web-analytics/

# Cloudflare Web Analytics

MadeBySavyo Labs reuses the existing Cloudflare Web Analytics site token configured for the GitHub Pages hostname savieo.github.io in the Savieo portfolio repository. Both project sites share that hostname and are distinguished by URL path.

The analytics loader reads the public site token from the cloudflare-web-analytics-token meta tag and loads Cloudflare's official beacon from static.cloudflareinsights.com.

- Main website path: /madebysavyo-labs/
- Existing portfolio path: /savieo/
- Analytics hostname: savieo.github.io
- No separate token is required while both sites remain on this same hostname.

If a custom domain is added later, create or configure the matching Cloudflare Web Analytics property/token for that hostname and update the meta tag.

Official documentation: https://developers.cloudflare.com/pages/how-to/web-analytics/

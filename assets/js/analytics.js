/**
 * Cloudflare Web Analytics loader for MadeBySavyo Labs.
 * The hostname-level token is shared with the Savieo GitHub Pages portfolio.
 */
(() => {
  const token = document
    .querySelector('meta[name="cloudflare-web-analytics-token"]')
    ?.getAttribute('content')
    ?.trim();
  if (!token || token === 'PASTE_TOKEN_HERE') return;
  const beacon = document.createElement('script');
  beacon.defer = true;
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token, spa: false });
  document.head.appendChild(beacon);
})();

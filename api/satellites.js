// Server-side proxy for CelesTrak's active-satellite catalogue.
//
// Fetching CelesTrak directly from the browser fails for two reasons:
//   1. the TLE endpoints don't reliably send CORS headers, so the browser
//      blocks the response (→ the app fell back to a demo set every load);
//   2. thousands of visitors hitting CelesTrak directly get rate-limited.
//
// Proxying here makes it a same-origin request (no CORS) and Vercel's edge
// cache (s-maxage) means CelesTrak is only contacted ~once per region per 6h.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const sources = [
    'https://celestrak.org/gp/query?GROUP=active&FORMAT=tle',
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
  ];
  for (const url of sources) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'universe-map/1.0 (+vercel)' } });
      if (!r.ok) continue;
      const text = await r.text();
      if (!text || text.length < 1000 || text.includes('<html')) continue;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).send(text);
    } catch (_) { /* try the next source */ }
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(502).send('error: all CelesTrak sources unavailable');
};

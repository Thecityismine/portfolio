// Vercel serverless function — serves saved annual estate reports as full webpages
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const year = (req.query.year || new Date().getFullYear()).toString();
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return res.status(500).send('<html><body><h2>Server configuration error</h2></body></html>');
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reports/${year}?key=${apiKey}`;
    const r = await fetch(url);

    if (!r.ok) {
      return res.status(404).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Not Found</title><style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9f9f9;color:#333}</style></head><body><div style="text-align:center"><h2>No report found for ${year}</h2><p style="color:#888">A report must be generated and saved from the Skyline Digital app first.</p></div></body></html>`);
    }

    const data = await r.json();
    const html = data.fields?.html?.stringValue;

    if (!html) {
      return res.status(404).send(`<!DOCTYPE html><html><body><h2>Report data missing for ${year}</h2></body></html>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`<html><body><h2>Error: ${err.message}</h2></body></html>`);
  }
}

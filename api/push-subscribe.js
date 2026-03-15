// Save a Web Push subscription to Firestore
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const FS_KEY = process.env.VITE_FIREBASE_API_KEY;

function fsFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = { doubleValue: v };
  }
  return fields;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { subscription, action } = req.body || {};

  if (!subscription?.endpoint) return res.status(400).json({ error: 'Missing subscription' });

  // Stable document ID from endpoint hash
  const id = Buffer.from(subscription.endpoint).toString('base64url').slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    if (action === 'unsubscribe') {
      await fetch(`${FS_BASE}/subscriptions/${id}?key=${FS_KEY}`, { method: 'DELETE' });
      return res.status(200).json({ ok: true });
    }

    // Save / upsert subscription
    const doc = {
      endpoint: subscription.endpoint,
      subscriptionJson: JSON.stringify(subscription),
      createdAt: new Date().toISOString(),
    };
    await fetch(`${FS_BASE}/subscriptions/${id}?key=${FS_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fsFields(doc) }),
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

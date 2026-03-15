// Vercel Cron Job — sends nightly portfolio push notifications
// Schedule: 0 1 * * * (1am UTC = 8pm EST / 9pm EDT)
import webpush from 'web-push';

const FS_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const FS_KEY  = process.env.VITE_FIREBASE_API_KEY;

webpush.setVapidDetails(
  'mailto:medina@portfolio-app.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

function fromDoc(doc) {
  const obj = { id: doc.name?.split('/').pop() };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    if (v.stringValue  !== undefined) obj[k] = v.stringValue;
    else if (v.doubleValue  !== undefined) obj[k] = v.doubleValue;
    else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
  }
  return obj;
}

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function handler(req, res) {
  try {
    // Fetch subscriptions
    const subRes  = await fetch(`${FS_BASE}/subscriptions?key=${FS_KEY}`);
    const subData = await subRes.json();
    const subs    = (subData.documents || []).map(fromDoc);

    if (!subs.length) return res.status(200).json({ sent: 0, message: 'No subscribers' });

    // Fetch snapshots for daily change
    const snapRes  = await fetch(`${FS_BASE}/snapshots?key=${FS_KEY}`);
    const snapData = await snapRes.json();
    const snaps = (snapData.documents || [])
      .map(fromDoc)
      .filter(s => s.date && s.totalUSD > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const latest = snaps[snaps.length - 1];
    const prev   = snaps[snaps.length - 2];

    if (!latest) return res.status(200).json({ sent: 0, message: 'No snapshot data' });

    const total      = latest.totalUSD;
    const prevTotal  = prev?.totalUSD;
    const changePct  = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : null;
    const changeAbs  = prevTotal > 0 ? (total - prevTotal) : null;

    let body;
    if (changePct !== null) {
      const sign  = changePct >= 0 ? '+' : '';
      const emoji = changePct >= 0 ? '📈' : '📉';
      body = `${emoji} ${sign}${changePct.toFixed(2)}% (${sign}${fmt(Math.abs(changeAbs))}) today · Portfolio now ${fmt(total)}`;
    } else {
      body = `Family portfolio is now worth ${fmt(total)}`;
    }

    const payload = JSON.stringify({
      title: 'Medina Portfolio',
      body,
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      url:   '/',
    });

    let sent = 0;
    const expired = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification(JSON.parse(sub.subscriptionJson), payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.id);
      }
    }

    // Remove expired subscriptions
    await Promise.all(expired.map(id =>
      fetch(`${FS_BASE}/subscriptions/${id}?key=${FS_KEY}`, { method: 'DELETE' }).catch(() => {})
    ));

    res.status(200).json({ sent, expired: expired.length, total: fmt(total), change: changePct?.toFixed(2) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

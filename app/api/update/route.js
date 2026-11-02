import { db } from '@/lib/db';
import { VERSION } from '@/lib/version';
const bad = (error, status = 400) => Response.json({ error }, { status });
const cmp = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
export async function GET() {
  const shop = (await db.list('settings')).find((s) => s.id === 'shop') || {};
  const counts = {}; for (const c of ['products', 'sales', 'returns', 'purchases', 'users']) counts[c] = (await db.list(c)).length;
  return Response.json({ version: VERSION, mode: db.mode, till: shop.till || 'T11', updateUrl: shop.updateUrl || '', counts, node: process.version });
}
// Reads a small JSON file you host: { "version": "0.1.8", "notes": "...", "url": "https://..." }
export async function POST() {
  const shop = (await db.list('settings')).find((s) => s.id === 'shop') || {};
  const url = String(shop.updateUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return bad('No update address is set. Paste the address of your update file below first.');
  try {
    const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!r.ok) return bad(`The update server answered ${r.status}.`);
    const j = await r.json();
    if (!j?.version) return bad('The update file has no "version".');
    return Response.json({ current: VERSION, latest: String(j.version), newer: cmp(j.version, VERSION) > 0, notes: j.notes || '', url: j.url || '' });
  } catch { return bad('Could not reach the update server. Check the internet connection and the address.'); }
}

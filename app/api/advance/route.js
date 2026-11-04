import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
const bad = (error, status = 400) => Response.json({ error }, { status });
export async function GET() { return Response.json(await db.list('advance')); }
// POST { customer, date, remarks, advance, items:[{ productId, name, qty, rate, disc }] }
export async function POST(req) {
  const b = await req.json(), prods = await db.list('products'), items = [];
  for (const x of b.items || []) {
    const p = prods.find((y) => y.id === x.productId);
    if (!p) return bad(`"${x.name}" is not in the product list any more.`);
    const it = { productId: p.id, name: p.name, qty: +x.qty, rate: +x.rate, disc: +x.disc || 0 };
    if (!(it.qty > 0) || !(it.rate >= 0) || it.disc < 0 || it.disc > 100) return bad(`Check the quantity, price and discount of ${p.name}.`);
    items.push(it);
  }
  if (!items.length) return bad('Add at least one item first.');
  if (!/^\d{4}-\d\d-\d\d$/.test(b.date || '')) return bad('Choose the order date.');
  const total = +items.reduce((t, x) => t + x.qty * x.rate * (1 - x.disc / 100), 0).toFixed(2), advance = Math.min(total, Math.max(0, +b.advance || 0));
  const all = await db.list('advance'), shop = (await db.list('settings')).find((s) => s.id === 'shop') || {};
  const last = Math.max(0, ...all.map((o) => +(/-AO-(\d+)$/.exec(o.orderNo || '')?.[1] || 0)));
  const rec = await db.insert('advance', { orderNo: `${shop.till || 'T11'}-AO-${String(last + 1).padStart(5, '0')}`, date: b.date, customer: String(b.customer || '').trim() || 'Walk-in customer', remarks: String(b.remarks || '').trim(), items, total, advance, posted: false, user: (await currentUser())?.name || 'Admin' });
  await log('Create', 'advance', `Advance order ${rec.orderNo} · Rs ${Math.round(total)}`, rec.user);
  return Response.json(rec);
}

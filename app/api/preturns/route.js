import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
const bad = (error, status = 400) => Response.json({ error }, { status });
const num = (v) => (Number.isFinite(+v) ? +v : 0);
const REASONS = ['No reason', 'Expired', 'Damaged', 'Wrong item', 'Customer changed mind', 'Other'];
export async function GET() { return Response.json(await db.list('preturns')); }

// POST { type:'CASH'|'CREDIT', supplier, invoiceNo, date, remarks, discountRs, discountPct,
//        items:[{ productId, qty, foc, price, disc, salePrice, reason }] }  -> stock goes back to the supplier
export async function POST(req) {
  const b = await req.json(), type = b.type === 'CASH' ? 'CASH' : 'CREDIT', supplier = String(b.supplier || '').trim();
  if (type === 'CREDIT' && !supplier) return bad('Choose the supplier whose account should be credited (or switch to CASH).');
  if (!/^\d{4}-\d\d-\d\d$/.test(b.date || '')) return bad('Choose the return date.');
  const prods = await db.list('products'), items = [];
  for (const x of b.items || []) {
    const p = prods.find((y) => y.id === x.productId);
    if (!p) return bad(`"${x.name}" is not in the product list any more.`);
    const it = { productId: p.id, code: x.code || p.barcode || '', name: p.name, qty: num(x.qty), foc: Math.max(0, num(x.foc)), price: num(x.price), disc: num(x.disc), salePrice: num(x.salePrice), reason: REASONS.includes(x.reason) ? x.reason : 'No reason' };
    if (!(it.qty > 0)) return bad(`Enter a quantity above zero for ${p.name}.`);
    if (it.price < 0 || it.disc < 0 || it.disc > 100) return bad(`Check the price and discount of ${p.name}.`);
    it.value = +(it.qty * it.price * (1 - it.disc / 100)).toFixed(2);
    items.push(it);
  }
  if (!items.length) return bad('Add at least one item first.');
  const subtotal = +items.reduce((t, x) => t + x.value, 0).toFixed(2), dRs = Math.min(Math.max(0, num(b.discountRs)), subtotal), dPct = Math.min(100, Math.max(0, num(b.discountPct)));
  const discount = +(dRs + ((subtotal - dRs) * dPct) / 100).toFixed(2), total = +(subtotal - discount).toFixed(2);
  const all = await db.list('preturns'), shop = (await db.list('settings')).find((s) => s.id === 'shop') || {};
  const last = Math.max(0, ...all.map((p) => +(/-PR-(\d+)$/.exec(p.returnNo || '')?.[1] || 0)));
  const rec = await db.insert('preturns', { returnNo: `${shop.till || 'T11'}-PR-${String(last + 1).padStart(5, '0')}`, type, supplier: supplier || '(cash return)', invoiceNo: String(b.invoiceNo || '').trim(), remarks: String(b.remarks || '').trim(), date: b.date, items, subtotal, discountRs: dRs, discountPct: dPct, discount, total, user: (await currentUser())?.name || 'Admin' });
  for (const it of items) { const p = prods.find((y) => y.id === it.productId); await db.update('products', p.id, { stock: (p.stock || 0) - it.qty - it.foc }); }
  await log('Create', 'purchase return', `Purchase return ${rec.returnNo} · ${rec.supplier} · ${type} · Rs ${Math.round(total)}`, rec.user);
  return Response.json(rec);
}

import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
const bad = (error, status = 400) => Response.json({ error }, { status });
const num = (v) => (Number.isFinite(+v) ? +v : 0);
export async function GET() { return Response.json(await db.list('purchases')); }

// POST body: { type:'CASH'|'CREDIT', supplier, invoiceNo, date, remarks, discount1, discount2, expenses,
//              items:[{ productId, name, code, qty, foc, price, disc, salePrice }] }   price = per unit, BEFORE GST
export async function POST(req) {
  const b = await req.json();
  const type = b.type === 'CREDIT' ? 'CREDIT' : 'CASH', supplier = String(b.supplier || '').trim();
  if (type === 'CREDIT' && !supplier) return bad('Choose the supplier whose account should be credited (or switch to CASH).');
  const prods = await db.list('products');
  const items = [];
  for (const x of b.items || []) {
    const p = prods.find((y) => y.id === x.productId);
    if (!p) return bad(`"${x.name}" is not in the product list any more.`);
    const it = { productId: p.id, code: x.code || p.barcode || '', name: p.name, qty: num(x.qty), foc: Math.max(0, num(x.foc)), price: num(x.price), disc: num(x.disc), salePrice: num(x.salePrice) };
    if (!(it.qty > 0)) return bad(`Enter a quantity above zero for ${p.name}.`);
    if (it.price < 0 || it.disc < 0 || it.disc > 100) return bad(`Check the price and discount of ${p.name}.`);
    it.value = +(it.qty * it.price * (1 - it.disc / 100)).toFixed(2);
    items.push(it);
  }
  if (!items.length) return bad('Add at least one item first.');
  const shop = (await db.list('settings')).find((s) => s.id === 'shop') || {}, gstPct = Math.max(0, num(shop.gst));
  const subtotal = +items.reduce((t, x) => t + x.value, 0).toFixed(2);
  const d1 = Math.min(Math.max(0, num(b.discount1)), subtotal), d2 = Math.min(Math.max(0, num(b.discount2)), subtotal - d1), expenses = Math.max(0, num(b.expenses));
  const base = subtotal - d1 - d2, gst = +(base * gstPct / 100).toFixed(2), total = +(base + gst + expenses).toFixed(2);
  const paid = type === 'CASH' ? total : 0;
  const all = await db.list('purchases'), till = shop.till || 'T11';
  const last = Math.max(0, ...all.map((p) => +(/-PI-(\d+)$/.exec(p.purchaseNo || '')?.[1] || 0)));
  const rec = await db.insert('purchases', {
    purchaseNo: `${till}-PI-${String(last + 1).padStart(5, '0')}`, type, supplier: supplier || '(cash purchase)', invoiceNo: String(b.invoiceNo || '').trim(), remarks: String(b.remarks || '').trim(),
    date: b.date || new Date().toISOString().slice(0, 10), items, subtotal, discount1: d1, discount2: d2, expenses, gstPct, gst, total, paid, balance: +(total - paid).toFixed(2),
    user: (await currentUser())?.name || 'Admin',
  });
  for (const it of items) { // stock comes in (bought + free), cost is the real cost per unit, the shelf price follows the bill
    const p = prods.find((y) => y.id === it.productId), patch = { stock: (p.stock || 0) + it.qty + it.foc, costPrice: +(it.value / (it.qty + it.foc)).toFixed(4) };
    if (it.salePrice > 0) patch.salePrice = it.salePrice;
    await db.update('products', p.id, patch);
  }
  await log('Create', 'purchase', `Purchase ${rec.purchaseNo} · ${supplier || 'cash'} · ${type} · ${items.length} items · Rs ${Math.round(total)}`, rec.user);
  return Response.json(rec);
}

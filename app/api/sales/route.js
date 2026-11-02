import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
import { myLimits } from '@/lib/auth';
export async function GET() { return Response.json(await db.list('sales')); }
export async function POST(req) {
  const b = await req.json();
  const items = b.items || [];
  const type = b.type || 'CASH';
  const subtotal = items.reduce((s, x) => s + x.qty * x.rate * (1 - (x.disc || 0) / 100), 0);
  const total = Math.max(0, subtotal - (b.discount || 0));
  const paid = type === 'CASH' ? (b.paid ?? total) : b.paid || 0;
  const L = await myLimits(), all = await db.list('sales');
  const gross = items.reduce((s, x) => s + x.qty * x.rate, 0), thisDisc = Math.max(0, gross - total);
  if (L.dailyDiscountLimit != null) {
    const today = new Date().toLocaleDateString('en-CA'), me = (await currentUser())?.name;
    const used = all.filter((s) => !s.voided && s.cashier === me && new Date(s.createdAt).toLocaleDateString('en-CA') === today)
      .reduce((t, s) => t + Math.max(0, s.items.reduce((g, x) => g + x.qty * x.rate, 0) - s.total), 0);
    if (used + thisDisc > L.dailyDiscountLimit + 0.005) return Response.json({ error: `Daily discount limit of Rs ${L.dailyDiscountLimit} reached (already given Rs ${Math.round(used)} today, this bill needs Rs ${Math.round(thisDisc)}). Ask an Admin.` }, { status: 403 });
  }
  if (type === 'CREDIT' && L.creditLimit != null && Math.max(0, total - paid) > L.creditLimit + 0.005)
    return Response.json({ error: `Credit sale limit is Rs ${L.creditLimit}. This bill leaves Rs ${Math.round(total - paid)} on credit. Ask an Admin.` }, { status: 403 });
  const n = all.length + 1;
  const sale = await db.insert('sales', {
    billNo: 'T11-' + String(n).padStart(5, '0'), type, customer: b.customer || 'Walk-in customer',
    remarks: b.remarks || '', date: b.date, items, subtotal, discount: b.discount || 0, discount1: b.discount1 || 0, discount2: b.discount2 || 0, total, paid,
    change: Math.max(0, paid - total), balance: Math.max(0, total - paid), cashier: (await currentUser())?.name || 'Admin',
  });
  const prods = await db.list('products');
  for (const it of items) {
    const p = prods.find((x) => x.id === it.productId);
    if (p && it.taken !== false) await db.update('products', p.id, { stock: (p.stock || 0) - it.qty });
  }
  await log('Create', 'sale', `Sale ${sale.billNo} · ${items.length} items`, sale.cashier);
  return Response.json(sale);
}

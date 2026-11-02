import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
import { isApprover, canApproveRole } from '@/lib/auth';
const bad = (error, status = 400) => Response.json({ error }, { status });
const REASONS = ['Changed mind', 'Damaged', 'Expired', 'Wrong item', 'Other'];

export async function GET() { return Response.json(await db.list('returns')); }

// POST body: { items:[{productId, code, name, qty, rate, disc, reason}], type:'CASH'|'CREDIT', customer, billNo?, remarks, date, discount1, discount2 }
export async function POST(req) {
  const b = await req.json();
  const items = (b.items || []).map((x) => ({
    productId: x.productId, code: x.code || '', name: String(x.name || ''), qty: +x.qty, rate: +x.rate, disc: +x.disc || 0,
    reason: REASONS.includes(x.reason) ? x.reason : 'Other', taken: x.taken !== false,
  }));
  if (!items.length) return bad('Add at least one item first.');
  if (items.some((x) => !(x.qty > 0) || !(x.rate >= 0) || x.disc < 0 || x.disc > 100)) return bad('Every item needs a quantity above zero, a valid price and a discount between 0 and 100.');
  const type = b.type === 'CREDIT' ? 'CREDIT' : 'CASH';
  const customer = String(b.customer || '').trim() || 'Walk-in customer';
  if (type === 'CREDIT' && /walk-in/i.test(customer)) return bad('Enter the customer whose account should be credited.');

  const rets = await db.list('returns');
  let billNo = '';
  if (b.billNo) { // a return against a bill can never exceed what that bill sold
    const s = (await db.list('sales')).find((x) => x.billNo === b.billNo);
    if (!s || s.voided) return bad(`Bill ${b.billNo} was not found or has been voided.`);
    billNo = s.billNo;
    const sold = {}, back = {}, want = {};
    for (const it of s.items) if (it.taken !== false) sold[it.productId] = (sold[it.productId] || 0) + +it.qty;
    for (const r of rets.filter((r) => r.billNo === billNo)) for (const it of r.items) back[it.productId] = (back[it.productId] || 0) + +it.qty;
    for (const it of items) want[it.productId] = (want[it.productId] || 0) + it.qty;
    for (const [pid, n] of Object.entries(want)) {
      const left = (sold[pid] || 0) - (back[pid] || 0);
      if (n > left) return bad(`Only ${Math.max(0, left)} of ${items.find((x) => String(x.productId) === pid).name} can still be returned on ${billNo}.`);
    }
  }

  const subtotal = items.reduce((t, x) => t + x.qty * x.rate * (1 - x.disc / 100), 0);
  const d1 = Math.min(Math.max(+b.discount1 || 0, 0), subtotal), d2 = Math.min(Math.max(+b.discount2 || 0, 0), subtotal - d1);
  const total = +Math.max(0, subtotal - d1 - d2).toFixed(2);
  const shopRec = (await db.list('settings')).find((s) => s.id === 'shop') || {}, limit = +(shopRec.returnLimit ?? 1000);
  let approvedBy = '';
  if (total > limit) {
    const me = await currentUser();
    if (canApproveRole(me?.role)) approvedBy = me.name;
    else if (!b.approval) return Response.json({ error: `Returns above Rs ${limit} need an Admin or Accountant PIN.`, needApproval: true, limit }, { status: 403 });
    else if (!(await isApprover(b.approval))) return Response.json({ error: 'Wrong Admin / Accountant PIN.', needApproval: true, limit }, { status: 403 });
    else approvedBy = 'PIN approval';
  }
  const till = (await db.list('settings')).find((s) => s.id === 'shop')?.till || 'T11';
  const ret = await db.insert('returns', {
    returnNo: `${till}-SR-${String(rets.length + 1).padStart(5, '0')}`, billNo, type, customer, remarks: b.remarks || '',
    date: b.date || new Date().toISOString().slice(0, 10), items, subtotal: +subtotal.toFixed(2), discount: +(d1 + d2).toFixed(2), discount1: d1, discount2: d2, total,
    cashier: (await currentUser())?.name || 'Admin', approvedBy,
  });
  const prods = await db.list('products');
  for (const it of items) { // returned goods go back on the shelf
    const p = prods.find((x) => x.id === it.productId);
    if (p && it.taken !== false) { p.stock = (p.stock || 0) + it.qty; await db.update('products', p.id, { stock: p.stock }); }
  }
  await log('Create', 'return', `Sales return ${ret.returnNo} · ${items.length} items · Rs ${Math.round(total)}`, ret.cashier);
  return Response.json(ret);
}

import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
import { accountList } from '@/lib/cash';
const bad = (error, status = 400) => Response.json({ error }, { status });
export async function GET() { return Response.json(await db.list('vouchers')); }
// POST { kind:'PAYMENT'|'RECEIPT', date, remarks, lines:[{ code, particulars, amount }] }
export async function POST(req) {
  const b = await req.json(), kind = b.kind === 'RECEIPT' ? 'RECEIPT' : b.kind === 'PAYMENT' ? 'PAYMENT' : '';
  if (!kind) return bad('Unknown voucher type.');
  if (!/^\d{4}-\d\d-\d\d$/.test(b.date || '')) return bad('Choose the voucher date.');
  const accts = await accountList(), lines = [];
  for (const l of b.lines || []) {
    const a = accts.find((x) => x.code === l.code);
    if (!a) return bad(`Account ${l.code || ''} was not found.`);
    const amount = +(+l.amount).toFixed(2);
    if (!(amount > 0)) return bad(`Enter an amount above zero for ${a.title}.`);
    lines.push({ code: a.code, title: a.title, particulars: String(l.particulars || '').trim() || (kind === 'PAYMENT' ? 'CASH PAID' : 'CASH RECEIVED'), amount });
  }
  if (!lines.length) return bad('Add at least one line to the voucher first.');
  const all = await db.list('vouchers'), tag = kind === 'PAYMENT' ? 'PV' : 'RV';
  const shop = (await db.list('settings')).find((s) => s.id === 'shop') || {}, till = shop.till || 'T11';
  const last = Math.max(0, ...all.filter((v) => v.kind === kind).map((v) => +(new RegExp(`-${tag}-(\\d+)$`).exec(v.voucherNo || '')?.[1] || 0)));
  const total = +lines.reduce((t, x) => t + x.amount, 0).toFixed(2);
  const rec = await db.insert('vouchers', { voucherNo: `${till}-${tag}-${String(last + 1).padStart(5, '0')}`, kind, date: b.date, remarks: String(b.remarks || '').trim(), lines, total, user: (await currentUser())?.name || 'Admin' });
  await log('Create', 'voucher', `${kind === 'PAYMENT' ? 'Payment' : 'Receipt'} voucher ${rec.voucherNo} · ${lines.length} lines · Rs ${Math.round(total)}`, rec.user);
  return Response.json(rec);
}

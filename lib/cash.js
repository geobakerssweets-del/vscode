import { db } from './db';
const SYSTEM = [['3000000', 'CAPITAL ACCOUNT', 'Capital & Reserves'], ['4-0001', 'CUSTOMER ADVANCES', 'Liabilities'], ['5-0001', 'SALARIES', 'Expenses'], ['5-0002', 'SHOP RENT', 'Expenses'],
  ['5-0003', 'ELECTRICITY & UTILITIES', 'Expenses'], ['5-0004', 'TRANSPORT & FREIGHT', 'Expenses'], ['5-0005', 'MISCELLANEOUS EXPENSES', 'Expenses'], ['7-0001', 'OTHER INCOME', 'Income']];
const localDay = (iso) => new Date(iso).toLocaleDateString('en-CA');
const dayOf = (x) => (/^\d{4}-\d\d-\d\d$/.test(x.date || '') ? x.date : localDay(x.createdAt));
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const walkIn = (n) => !String(n || '').trim() || /walk-in/i.test(n);
const pad = (n, w) => String(n).padStart(w, '0');

// Everything that moves cash in or out of the till, one row per document (sales and refunds are added up per day).
export async function cashMovements() {
  const [sales, rets, purs, vchs, settings, prets] = await Promise.all(['sales', 'returns', 'purchases', 'vouchers', 'settings', 'preturns'].map((c) => db.list(c)));
  const shop = settings.find((s) => s.id === 'shop') || {}, rows = [], by = {};
  const add = (key, date, doc, particulars, receipt, payment, ord) => { const k = key + date; if (!by[k]) rows.push((by[k] = { date, doc, title: 'CASH ACCOUNT', particulars, receipt: 0, payment: 0, ord })); by[k].receipt += receipt; by[k].payment += payment; };
  for (const s of sales) if (!s.voided) { const cash = Math.min(+s.paid || 0, +s.total || 0); if (cash > 0) add('S', dayOf(s), 'SALES', 'CASH SALES OF THE DAY', cash, 0, 1); }
  for (const r of rets) if (r.type === 'CASH') add('R', dayOf(r), 'S-RET', 'CASH REFUNDS ON SALES RETURNS', 0, +r.total || 0, 2);
  for (const p of purs) if (p.type === 'CASH') add('P', dayOf(p), 'PURCH', 'CASH PURCHASES OF THE DAY', 0, +p.total || 0, 3);
  for (const r of prets) if (r.type === 'CASH') add('X', dayOf(r), 'PUR-RET', 'CASH REFUNDS ON PURCHASE RETURNS', +r.total || 0, 0, 3.5);
  for (const v of vchs) for (const l of v.lines || []) rows.push({ date: v.date, doc: v.voucherNo, title: l.title, particulars: l.particulars + (v.remarks ? ' · ' + v.remarks : ''), receipt: v.kind === 'RECEIPT' ? l.amount : 0, payment: v.kind === 'PAYMENT' ? l.amount : 0, ord: 4, at: v.createdAt });
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.ord - b.ord || String(a.at || '').localeCompare(String(b.at || '')));
  return { opening: +shop.openingCash || 0, rows };
}
export async function cashBook(from, to) {
  const { opening, rows } = await cashMovements();
  const before = rows.filter((r) => r.date < from).reduce((t, r) => t + r.receipt - r.payment, opening);
  const inRange = rows.filter((r) => r.date >= from && r.date <= to);
  const inHand = inRange.reduce((t, r) => t + r.receipt - r.payment, before);
  return { opening: before, rows: inRange, inHand };
}

// Customers and suppliers are worked out from the bills. balance > 0 means Dr (they owe you), < 0 means Cr (you owe them).
export async function accountList() {
  const [sales, rets, purs, prods, vchs, prets] = await Promise.all(['sales', 'returns', 'purchases', 'products', 'vouchers', 'preturns'].map((c) => db.list(c)));
  const seq = [...sales, ...rets].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const custs = [];
  for (const x of seq) { const n = String(x.customer || '').trim(); if (!walkIn(n) && !custs.some((c) => same(c, n))) custs.push(n); }
  const sups = [];
  for (const n of [...purs.slice().reverse().map((p) => p.supplier), ...prods.map((p) => p.supplier)]) { const s = String(n || '').trim(); if (s && s !== '(cash purchase)' && !sups.some((c) => same(c, s))) sups.push(s); }
  const list = [];
  custs.forEach((n, i) => list.push({ code: '6-' + pad(i + 1, 4), title: n.toUpperCase(), category: 'Customers',
    balance: sales.filter((s) => !s.voided && same(s.customer, n)).reduce((t, s) => t + (+s.balance || 0), 0) - rets.filter((r) => r.type === 'CREDIT' && same(r.customer, n)).reduce((t, r) => t + (+r.total || 0), 0) }));
  sups.forEach((n, i) => list.push({ code: '2-' + pad(i + 1, 4), title: n.toUpperCase(), category: 'Suppliers', balance: -purs.filter((p) => same(p.supplier, n)).reduce((t, p) => t + (+p.balance || 0), 0) + prets.filter((r) => r.type === 'CREDIT' && same(r.supplier, n)).reduce((t, r) => t + (+r.total || 0), 0) }));
  for (const [code, title, category] of SYSTEM) list.push({ code, title, category, balance: 0 });
  for (const v of vchs) for (const l of v.lines || []) { const a = list.find((x) => same(x.title, l.title)); if (a) a.balance += v.kind === 'PAYMENT' ? l.amount : -l.amount; }
  return list.map((a) => ({ ...a, balance: +a.balance.toFixed(2) })).sort((a, b) => a.title.localeCompare(b.title));
}

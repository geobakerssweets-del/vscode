'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import NumPad, { applyKey } from '@/components/NumPad';
const api = (u, method = 'GET', body) =>
  fetch('/api/' + u, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }).then((r) => r.json());
const TABS = ['Sales Invoice', 'Products', 'Audit Log', 'Settings'];

// ---------- language ----------
let LANG = 'English';
const UR = { SALES: 'فروخت', PURCHASE: 'خریداری', CASH: 'کیش', ACCOUNTS: 'کھاتے', PRODUCTS: 'مصنوعات', TOOLS: 'ٹولز', HELP: 'مدد',
  Transactions: 'لین دین', Reports: 'رپورٹس', Tools: 'ٹولز', Settings: 'سیٹنگز', Help: 'مدد', Stock: 'اسٹاک', Barcodes: 'بار کوڈ', 'Basic Setup': 'بنیادی سیٹ اپ', 'Setup & Transactions': 'سیٹ اپ اور لین دین',
  'Sales Invoice': 'سیلز انوائس', 'Sales History': 'فروخت کی تاریخ', 'Sales Return': 'سیلز واپسی', 'Return History': 'واپسی کی تاریخ', 'Advance Sales': 'ایڈوانس سیل', 'Pending Entries': 'زیر التواء اندراجات',
  'Sales Report': 'سیلز رپورٹ', 'Sales Summary': 'سیلز خلاصہ', 'Stock Analysis': 'اسٹاک تجزیہ', 'Reports Center': 'رپورٹس سینٹر', Dashboard: 'ڈیش بورڈ', 'Stock Report': 'اسٹاک رپورٹ',
  'Theme Setup': 'تھیم', Calculator: 'کیلکولیٹر', 'Change Password': 'پاس ورڈ تبدیل کریں', 'Purchase Invoice': 'خریداری انوائس', 'Purchase History': 'خریداری کی تاریخ', 'Purchase Return': 'خریداری واپسی',
  'Cash Payment': 'کیش ادائیگی', 'Cash Receipt': 'کیش وصولی', 'Cash Book': 'کیش بک', 'Define Products': 'مصنوعات بنائیں', 'Backup Data': 'ڈیٹا بیک اپ', 'Bill Template': 'بل ٹیمپلیٹ', 'Look & Feel': 'ظاہری شکل',
  'Users Manager': 'صارفین', 'Printer Settings': 'پرنٹر سیٹنگز', 'Audit Log': 'آڈٹ لاگ', Deliveries: 'ڈیلیوریز', 'Change Date': 'تاریخ تبدیل کریں', Support: 'سپورٹ', Updates: 'اپ ڈیٹس', 'Keyboard Shortcuts': 'کی بورڈ شارٹ کٹس',
  'QUICK LAUNCH': 'فوری رسائی', 'CURRENT USER': 'موجودہ صارف', 'low stock': 'کم اسٹاک', 'Sign out': 'سائن آؤٹ',
  // receipts
  Invoice: 'انوائس', Cash_: 'نقد', Credit_: 'ادھار', Cashier: 'کیشیئر', Customer: 'گاہک', DESCRIPTION: 'تفصیل', QTY: 'مقدار', RATE: 'ریٹ', AMOUNT: 'رقم', 'Total Bill': 'کل بل', Discount: 'رعایت',
  'Net Amount': 'خالص رقم', 'Cash Received': 'وصول شدہ نقد', 'Change to return': 'باقی واپس', 'Sales Return_': 'سیلز واپسی', 'Total Refund': 'کل واپسی رقم', 'Walk-in customer': 'عام گاہک', 'Against bill': 'بل نمبر' };
const tr = (s) => (LANG === 'Urdu' && UR[s]) || s;
const tm = (m) => (LANG === 'Urdu' ? UR[m === 'CASH' ? 'Cash_' : 'Credit_'] : m === 'CASH' ? 'Cash' : 'Credit');
const setLang = (l) => { LANG = l === 'Urdu' ? 'Urdu' : 'English'; };

// ---------- keyboard shortcuts (rebindable, per signed-in person on this PC) ----------
const ACTIONS = [
  ['newTab', 'New invoice tab', 'Invoice tabs', ['*'], 'Sales Invoice, Sales Return (opens Sales Invoice from other screens)', 'Alt+W'],
  ['closeTab', 'Close active invoice tab', 'Invoice tabs', ['SI', 'SR'], 'Sales Invoice, Sales Return', 'Alt+C'],
  ['search', 'Search anything', 'Everywhere', ['*'], 'Every screen', 'Ctrl+K'],
  ['newSale', 'Open Sales Invoice', 'Everywhere', ['*'], 'Every screen', 'Alt+N'],
  ['save', 'Save', 'Common', ['SI', 'SR', 'PU', 'PR', 'CV'], 'Sales Invoice, Sales Return, Purchase, Products', 'F9'],
  ['savePrint', 'Save & Print', 'Common', ['SI', 'SR', 'PU', 'CV'], 'Sales Invoice, Sales Return, Purchase', 'F10'],
  ['save2', 'Save (second key)', 'Common', ['SR', 'PR', 'BT', 'CV'], 'Sales Return, Products, Bill Template, Cash Payment / Receipt', 'Ctrl+S'],
  ['clear', 'Clear / New', 'Common', ['SI', 'SR', 'PU', 'PR', 'CV'], 'Sales Invoice, Sales Return, Purchase, Products', 'F4'],
  ['barcode', 'Go to Barcode box', 'Common', ['SI', 'SR', 'PU'], 'Sales Invoice, Sales Return, Purchase', 'F2'],
  ['catalogue', 'Product Catalogue', 'Common', ['SI', 'SR', 'PU'], 'Sales Invoice, Sales Return, Purchase', 'F3'],
  ['refresh', 'Refresh / Reset', 'Common', ['SH'], 'Sales History, Return History, Purchase History, Cash Book', 'F5'],
  ['pType', 'Switch purchase CASH / CREDIT', 'Purchase Invoice', ['PU'], 'Purchase Invoice', 'F6'],
  ['supplier', 'Go to Supplier', 'Purchase Invoice', ['PU'], 'Purchase Invoice', 'F7'],
  ['toggleType', 'Switch CASH / CREDIT', 'Sales Invoice & Return', ['SI', 'SR'], 'Sales Invoice, Sales Return', 'F5'],
  ['customer', 'Go to Customer', 'Sales Invoice & Return', ['SI', 'SR'], 'Sales Invoice, Sales Return', 'F6'],
  ['cashRecv', 'Go to Cash received', 'Sales Invoice & Return', ['SI'], 'Sales Invoice', 'F7'],
  ['hold', 'Hold bill (Pending)', 'Sales Invoice & Return', ['SI'], 'Sales Invoice', 'F8'],
];
const FIXED = ['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'];
const DEFKEYS = Object.fromEntries(ACTIONS.map((a) => [a[0], a[5]]));
let KEYS = { ...DEFKEYS };
const loadKeys = (uid) => { try { KEYS = { ...DEFKEYS, ...JSON.parse(localStorage.getItem('falcon-keys-' + uid) || '{}') }; } catch { KEYS = { ...DEFKEYS }; } };
const saveKeys = (uid, k) => { KEYS = k; try { localStorage.setItem('falcon-keys-' + uid, JSON.stringify(k)); } catch {} window.dispatchEvent(new Event('falcon-keys')); };
const combo = (e) => {
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return '';
  const k = e.key.length === 1 ? e.key.toUpperCase() : e.key === ' ' ? 'Space' : e.key;
  return [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', k].filter(Boolean).join('+');
};
const acts = (e) => { const c = combo(e); return c ? ACTIONS.filter((a) => KEYS[a[0]] === c).map((a) => a[0]) : []; };
const clash = (id, c, keys) => { const me = ACTIONS.find((a) => a[0] === id); return ACTIONS.find((a) => a[0] !== id && keys[a[0]] === c && (a[3].includes('*') || me[3].includes('*') || a[3].some((s) => me[3].includes(s)))); };

// ---------- bill template ----------
const BT_DEFAULT = { lines: 'solid', blocks: [
  { id: 'logo', type: 'logo', show: true, size: 80, align: 'center' }, { id: 'name', type: 'name', show: true, align: 'center', big: true }, { id: 'address', type: 'address', show: true, align: 'center' },
  { id: 'phone', type: 'phone', show: true, align: 'center' }, { id: 'd1', type: 'divider', show: true }, { id: 'title', type: 'title', show: true, align: 'center', text: 'Invoice · {mode}' },
  { id: 'billno', type: 'billno', show: true, locked: true }, { id: 'cashier', type: 'cashier', show: true, text: 'Cashier' }, { id: 'customer', type: 'customer', show: true, text: 'Customer' },
  { id: 'd2', type: 'divider', show: true }, { id: 'items', type: 'items', show: true, locked: true }, { id: 'd3', type: 'divider', show: true }, { id: 'totals', type: 'totals', show: true, locked: true },
  { id: 'cash', type: 'cash', show: true, text: 'Cash Received', text2: 'Change to return' }, { id: 'd4', type: 'divider', show: true }, { id: 'footer', type: 'footer', show: true, align: 'center', text: '', big: false } ] };
const BT_NAMES = { logo: 'Logo', name: 'Shop name', address: 'Address', phone: 'Phone', divider: 'Divider line', title: 'Bill title', billno: 'Bill no. and date', cashier: 'Cashier', customer: 'Customer', items: 'Items', totals: 'Totals', cash: 'Cash / balance', footer: 'Footer', text: 'Text line' };
const tplOf = (shop) => (shop?.billTemplate?.blocks?.length ? shop.billTemplate : BT_DEFAULT);
const paperVars = (shop) => (shop?.paper === '58' ? { '--rw': '215px', '--pw': '58mm' } : { '--rw': '290px', '--pw': '80mm' });

function BillBody({ pr, shop, tpl }) {
  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100), hr = <hr style={{ borderTopStyle: tpl.lines === 'dotted' ? 'dotted' : 'dashed' }} />;
  const al = (b) => ({ textAlign: b.align || 'center' }), cls = (b) => 'rc ' + (b.big ? 'big' : 'sm');
  const mode = tm(pr.type);
  return <>{tpl.blocks.filter((b) => b.show !== false).map((b) => {
    switch (b.type) {
      case 'logo': return shop.logo ? <div key={b.id} style={al(b)}><img src={shop.logo} alt="" style={{ width: (b.size || 80) + '%' }} /></div> : null;
      case 'name': return <div key={b.id} className={'big'} style={{ ...al(b), fontWeight: 700 }}>{shop.name}</div>;
      case 'address': return <div key={b.id} className="sm" style={al(b)}>{shop.address}</div>;
      case 'phone': return <div key={b.id} className="sm" style={al(b)}>{shop.phone}</div>;
      case 'divider': return <React.Fragment key={b.id}>{hr}</React.Fragment>;
      case 'title': return <div key={b.id} className="sm" style={al(b)}>{(b.text || 'Invoice · {mode}').replace('{mode}', mode)}</div>;
      case 'billno': return <div key={b.id} className="rl sm"><span>#{pr.billNo}</span><span>{pr.date}</span></div>;
      case 'cashier': return <div key={b.id} className="rl sm"><span>{b.text || 'Cashier'}</span><span>{pr.cashier}</span></div>;
      case 'customer': return <div key={b.id} className="rl sm"><span>{b.text || 'Customer'}</span><span>{/walk-in/i.test(pr.customer) ? tr('Walk-in customer') : pr.customer}</span></div>;
      case 'items': return <div key={b.id}><div className="rl sm b"><span>{tr('DESCRIPTION')}</span><span>{tr('QTY')} · {tr('RATE')} · {tr('AMOUNT')}</span></div>
        {pr.items.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty} · {x.rate} · {Math.round(net(x))}</span></div>)}</div>;
      case 'totals': return <div key={b.id}><div className="rl b"><span>{tr('Total Bill')}</span><span>{Math.round(pr.subtotal)}</span></div>
        {pr.discount > 0 && <div className="rl sm"><span>{tr('Discount')}</span><span>{Math.round(pr.discount)}</span></div>}
        <div className="rl big"><span>{tr('Net Amount')}</span><span>Rs {Math.round(pr.total)}</span></div></div>;
      case 'cash': return <div key={b.id}><div className="rl sm"><span>{b.text || 'Cash Received'}</span><span>{Math.round(pr.paid)}</span></div>
        <div className="rl sm"><span>{b.text2 || 'Change to return'}</span><span>{Math.round(pr.change)}</span></div></div>;
      case 'footer': return <div key={b.id} className={cls(b)} style={al(b)}>{b.text || shop.footer}</div>;
      case 'text': return <div key={b.id} className={cls(b)} style={al(b)}>{b.text}</div>;
      default: return null;
    }
  })}</>;
}
function Receipt({ pr, shop }) {
  const tpl = tplOf(shop);
  return <div className="receipt" style={paperVars(shop)}><BillBody pr={pr} shop={shop} tpl={tpl} /></div>;
}

const rs = (n) => 'Rs ' + Number(n || 0).toLocaleString();


// ---------- icons (one consistent line-icon set) ----------
const ICONS = {
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  cart: '<path d="M3 4h2l2.4 10.5h10.2L20 7H6.3"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11h14V8M10 12h4"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l12-3v3M16 14h2"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 6 5 6 5 9s-5 3-5 9M17 3c0 6-5 6-5 9s5 3 5 9"/>',
  bars: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  pie: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  dash: '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="12" width="8" height="9" rx="1.5"/><rect x="3" y="16" width="8" height="5" rx="1.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17.5l9 5 9-5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><circle cx="8" cy="11" r=".8"/><circle cx="12" cy="7.5" r=".8"/><circle cx="16" cy="11" r=".8"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><rect x="8" y="6" width="8" height="3.5" rx=".5"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  clip: '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  payout: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  payin: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 9v6M9.5 12.5 12 15l2.5-2.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 5v16M9 7h6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6"/>',
  truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  scale: '<path d="M12 3v18M5 21h14M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  factory: '<path d="M3 21V10l6 4v-4l6 4V6h6v15z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  dollar: '<circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3 .5-3 1.5 1.3 1.5 3 1.5 3-.5 3-1.5"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L10 21a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5l3-3 3 3-3 3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  inbox: '<path d="M3 13l3-9h12l3 9v7H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  barcode: '<path d="M4 5v14M7 5v14M11 5v14M14 5v14M17 5v14M20 5v14"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 14v3M14 19h7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
  db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z"/>',
  cloud: '<path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17 18z"/>',
  kbd: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  print: '<path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
  down: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  up: '<path d="M12 20V9M7 13l5-5 5 5M5 4h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  lang: '<path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 7 8M12 5c0 3-3 6-7 8M13 21l4-10 4 10M14.5 17.5h5"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  out: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevd: '<path d="M6 9l6 6 6-6"/>',
  chevr: '<path d="M9 6l6 6-6 6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-3.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14.5 3.5L20 15M20 20v-5h-5"/>',
  warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  store: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M10 20v-5h4v5"/>',
  arrowup: '<path d="M7 17L17 7M8 7h9v9"/>', arrowdown: '<path d="M7 7l10 10M17 8v9H8"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
};
const TONES = ['#2f7d4f', '#b7791f', '#b4443a', '#4a5bb5', '#1f8a8a', '#7a4fb3', '#2b6cb0', '#b0457a'];
const toneOf = (n) => TONES[[...String(n)].reduce((t, c) => t + c.charCodeAt(0), 0) % TONES.length];
function Ico({ n, s = 18, className }) {
  return <svg className={'svg ' + (className || '')} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[n] || ICONS.dot }} />;
}

const ICON_OF = {};
const RIBBON = {
  SALES: [['Transactions', [['Sales Invoice', 'cart'], ['Sales History', 'clock'], ['Sales Return', 'undo'], ['Return History', 'archive'], ['Advance Sales', 'wallet'], ['Pending Entries', 'hourglass']]],
    ['Reports', [['Sales Report', 'bars'], ['Sales Summary', 'pie'], ['Stock Analysis', 'trend'], ['Reports Center', 'grid'], ['Dashboard', 'dash'], ['Stock Report', 'layers']]],
    ['Tools', [['Theme Setup', 'palette'], ['Calculator', 'calc'], ['Change Password', 'key']]]],
  PURCHASE: [['Transactions', [['Purchase Invoice', 'file'], ['Purchase History', 'clip'], ['Purchase Return', 'redo'], ['Purchase Return History', 'folder']]]],
  CASH: [['Transactions', [['Cash Payment', 'payout'], ['Cash Receipt', 'payin'], ['Cash Book', 'book']]],
    ['Reports', [['Payments Summary', 'bars'], ['Payments Details', 'doc'], ['Receipts Summary', 'pie'], ['Receipts Details', 'list']]]],
  ACCOUNTS: [['Setup & Transactions', [['Account Categories', 'archive'], ['Accounts Setup', 'calc'], ['Customer Setup', 'user'], ['Supplier Setup', 'truck'], ['Journal Voucher', 'pen'], ['Opening Balance', 'scale']]],
    ['Reports', [['Account Statement', 'book'], ['Customer Ledger', 'book'], ['Supplier Ledger', 'book'], ['Chart of Accounts', 'doc']]]],
  PRODUCTS: [['Basic Setup', [['Define Products', 'box'], ['Define Manufacturer', 'factory'], ['Define Category', 'tag'], ['Update Pricing', 'dollar']]],
    ['Reports', [['Product Catalogue', 'print'], ['Stock Report', 'layers']]],
    ['Stock', [['Stock Adjustment', 'wrench'], ['Adjustment History', 'history'], ['Opening Stock', 'inbox']]],
    ['Barcodes', [['Barcodes', 'barcode'], ['Other Barcodes', 'qr']]]],
  TOOLS: [['Settings', [['Settings', 'gear'], ['Backup Data', 'db'], ['Bill Template', 'receipt'], ['Look & Feel', 'palette'], ['Users Manager', 'users'], ['Printer Settings', 'print'], ['Audit Log', 'shield'], ['Deliveries', 'truck']]],
    ['Tools', [['Change Date', 'cal'], ['Calculator', 'calc'], ['Change Password', 'key']]]],
  HELP: [['Help', [['Support', 'headset'], ['Updates', 'cloud'], ['Keyboard Shortcuts', 'kbd']]]],
};
Object.values(RIBBON).flat().forEach(([, its]) => its.forEach(([n, i]) => { ICON_OF[n] = i; }));
const SCREEN_COLOR = { 'Cash Receipt': '#2e7d32', 'Cash Book': '#2347b0' };
const COLOR = { SALES: '#2e7d32', PURCHASE: '#2347b0', CASH: '#b4300f', ACCOUNTS: '#1f2937', PRODUCTS: '#2347b0', TOOLS: '#c2410c', HELP: '#1f2937' };
const QUICK = ['Sales Invoice', 'Sales History', 'Sales Return', 'Return History', 'Purchase Invoice', 'Purchase History', 'Define Products', 'Cash Payment', 'Cash Receipt', 'Cash Book', 'Backup Data'];

export default function Home() {
  const [tab, setTab] = useState('SALES'), [screen, setScreen] = useState('Sales Invoice'), [prepOpen, setPrepOpen] = useState(true), [tabs, setTabs] = useState([{ id: 1, kind: 'sale', n: 1 }, { id: 2, kind: 'ret', n: 1 }]), [act, setAct] = useState({ sale: 1, ret: 2 }), [dirty, setDirty] = useState({}), [now, setNow] = useState(null), [editBill, setEditBill] = useState(null), [resumeBill, setResumeBill] = useState(null), [me, setMe] = useState({}), [low, setLow] = useState(0), [, setKv] = useState(0), [sq, setSq] = useState(''), [sres, setSres] = useState(false), [sprods, setSprods] = useState([]), [pref, setPref] = useState({ theme: 'Light', colour: '', size: 100, width: 100 });
  useEffect(() => { api('products').then((a) => Array.isArray(a) && setLow(a.filter((p) => p.active !== false && p.stock <= (p.minStock || 0)).length)); }, [screen]);
  const searchRef = useRef();
  useEffect(() => { api('auth/me').then((m) => { if (m.uid) loadKeys(m.uid); setMe(m); setKv((v) => v + 1); }); const f = () => setKv((v) => v + 1); window.addEventListener('falcon-keys', f); return () => window.removeEventListener('falcon-keys', f); }, []);
  useEffect(() => {
    const ap = () => {
      const p = getPrefs(); setLang(p.lang); document.documentElement.lang = p.lang === 'Urdu' ? 'ur' : 'en'; document.documentElement.classList.toggle('ur', p.lang === 'Urdu'); setPref(p);
      const dark = p.theme === 'Dark' || (p.theme === 'Match' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      if (p.colour && COLOURS[p.colour]) document.documentElement.style.setProperty('--pri', COLOURS[p.colour]); else document.documentElement.style.removeProperty('--pri');
    };
    ap(); window.addEventListener('falcon-prefs', ap); return () => window.removeEventListener('falcon-prefs', ap);
  }, []);
  const go = (sc) => { setEditBill(null); setResumeBill(null); setScreen(sc); };
  const seq = useRef({ id: 2, sale: 1, ret: 1 });
  const posKind = screen === 'Sales Invoice' ? 'sale' : screen === 'Sales Return' ? 'ret' : null, keepTabs = pref.keepTabs !== false;
  const addTab = (kind, extra = {}) => {
    if (tabs.filter((x) => x.kind === kind).length >= 8) { window.alert('You can keep up to 8 tabs open here. Close one first.'); return null; }
    const nt = { id: ++seq.current.id, kind, n: ++seq.current[kind], ...extra };
    setTabs((ts) => [...ts, nt]); setAct((a) => ({ ...a, [kind]: nt.id })); return nt;
  };
  const closeTab = (id, force) => {
    const x = tabs.find((y) => y.id === id); if (!x) return;
    if (!force && dirty[id] && !window.confirm('This tab has items that are not saved. Close it anyway?')) return;
    const same = tabs.filter((y) => y.kind === x.kind), rest = tabs.filter((y) => y.id !== id);
    setDirty((d) => ({ ...d, [id]: false }));
    if (same.length === 1) { const nt = { id: ++seq.current.id, kind: x.kind, n: ++seq.current[x.kind] }; setTabs([...rest, nt]); setAct((a) => ({ ...a, [x.kind]: nt.id })); return; }
    setTabs(rest);
    if (act[x.kind] === id) { const i = same.findIndex((y) => y.id === id), nx = same[i + 1] || same[i - 1]; setAct((a) => ({ ...a, [x.kind]: nx.id })); }
  };
  const tabName = (x) => (x.edit ? `Edit ${x.edit.billNo}` : x.resume ? `Held ${x.n}` : `${x.kind === 'sale' ? 'Invoice' : 'Return'} ${x.n}`);
  useEffect(() => setNow(new Date()), []);
  const tabOf = (sc) => Object.keys(RIBBON).find((k) => RIBBON[k].some(([, it]) => it.some(([n]) => n === sc))) || tab;
  const open = (sc) => { setTab(tabOf(sc)); go(sc); setSq(''); setSres(false); searchRef.current?.blur(); };
  useEffect(() => {
    const k = (e) => { const a = acts(e);
      if (a.includes('search')) { e.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); api('products').then((x) => Array.isArray(x) && setSprods(x)); }
      else if (a.includes('newSale')) { e.preventDefault(); open('Sales Invoice'); }
      else if (a.includes('newTab')) { e.preventDefault(); const kind = posKind || 'sale'; setTab('SALES'); if (!posKind) setScreen('Sales Invoice'); addTab(kind); }
      else if (a.includes('closeTab') && posKind) { e.preventDefault(); closeTab(act[posKind]); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  useEffect(() => { const f = (e) => open(e.detail); window.addEventListener('falcon-go', f); return () => window.removeEventListener('falcon-go', f); });
  const allScreens = [...new Set(Object.values(RIBBON).flat().flatMap(([, it]) => it.map(([n]) => n)))];
  const q1 = sq.trim().toLowerCase(), sHits = q1 ? allScreens.filter((n) => (n + ' ' + tr(n)).toLowerCase().includes(q1)).slice(0, 6) : [], pHits = q1 ? sprods.filter((p) => (p.name + ' ' + (p.code || '') + ' ' + (p.barcode || '')).toLowerCase().includes(q1)).slice(0, 5) : [];
  const SCREEN = { Dashboard, 'Sales History': SalesHistory, 'Pending Entries': Pending, 'Change Password': ChangePassword, 'Define Products': Products, 'Audit Log': Audit, Settings, 'Users Manager': SettingsAt('staff'), 'Look & Feel': SettingsAt('look'), 'Printer Settings': SettingsAt('printer'), 'Keyboard Shortcuts': SettingsAt('keys'), Shortcuts: SettingsAt('keys'), 'Return History': ReturnHistory, Updates, Support, 'Bill Template': BillTemplate, 'Backup Data': Backup, 'Purchase Invoice': PurchaseInvoice, 'Purchase History': PurchaseHistory, 'Cash Payment': CashPayment, 'Cash Receipt': CashReceipt, 'Cash Book': CashBook };
  const View = posKind ? null : SCREEN[screen];
  const d = now ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';
  const wd = now ? now.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  return (
    <div className="app" style={{ '--ac': COLOURS[pref.colour] || SCREEN_COLOR[screen] || COLOR[tab] }}>
      <div className="titleline">FALCON – | {d} | {tr(screen)} | {me.name}</div>
      <nav className="tabs">{Object.keys(RIBBON).map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{tr(t)}</button>)}
        <span className="grow" /><div className="gsw"><Ico n="search" s={15} className="gsi" /><input ref={searchRef} className="gs" placeholder={LANG === 'Urdu' ? 'تلاش کریں…  Ctrl+K' : `Search screens and products…  ${KEYS.search}`} value={sq} onChange={(e) => { setSq(e.target.value); setSres(true); }} onFocus={() => setSres(true)} onBlur={() => setTimeout(() => setSres(false), 150)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setSq(''); e.target.blur(); } else if (e.key === 'Enter') { if (sHits[0]) open(sHits[0]); else if (pHits[0]) open('Define Products'); } }} />
          {sres && (sHits.length > 0 || pHits.length > 0) && <div className="sres">{sHits.map((n) => <div key={n} onMouseDown={() => open(n)}><Ico n={ICON_OF[n] || 'file'} s={15} /> {tr(n)}</div>)}{pHits.map((p) => <div key={p.id} onMouseDown={() => open('Define Products')}><Ico n="box" s={15} /> {p.name} <small>stock {p.stock}</small></div>)}</div>}</div><button className="tbi" title="Language" aria-label="Language" onClick={() => { const q = getPrefs(); savePrefs({ ...q, lang: q.lang === 'Urdu' ? 'English' : 'Urdu' }); }}><Ico n="lang" s={17} /></button>
        <button className="tbi" title="Light / dark" aria-label="Light or dark theme" onClick={() => { const q = getPrefs(); savePrefs({ ...q, theme: document.documentElement.dataset.theme === 'dark' ? 'Light' : 'Dark' }); }}><Ico n="moon" s={17} /></button>
        <button className="tbi" title="Low stock" aria-label="Low stock" onClick={() => go('Define Products')}><Ico n="bell" s={17} />{low > 0 && <i className="bdot" />}</button>
        <button className="signout" onClick={async () => { await api('auth/logout', 'POST'); window.location.href = '/login'; }}><Ico n="out" s={16} /> {tr('Sign out')}</button></nav>
      <div className="ribbon">{RIBBON[tab].map(([g, items]) => <div className="grp" key={g}>
        <div className="items">{items.map(([n, i]) => <button key={n} className={'rb' + (n === screen ? ' on' : '')} onClick={() => go(n)}><span className="ic" style={{ '--tn': toneOf(n) }}><Ico n={i} s={20} /></span>{tr(n)}</button>)}</div><small>{tr(g)}</small></div>)}</div>
      <div className="datebar" style={{ background: COLOURS[pref.colour] || SCREEN_COLOR[screen] || COLOR[tab] }}>{d}, {wd}</div>
      <div className="body">
        <aside><div className="ql">{tr('QUICK LAUNCH')}</div>{QUICK.map((q) => <button key={q} className={q === screen ? 'on' : ''} onClick={() => go(q)}><Ico n={ICON_OF[q] || 'dot'} s={16} /><span>{tr(q)}</span></button>)}
          <div className="grow" />
          <div className="prep"><button className="prepH" onClick={() => setPrepOpen(!prepOpen)} aria-expanded={prepOpen}><Ico n={prepOpen ? 'chevd' : 'chevr'} s={13} /> ORDER PREP</button>
            {prepOpen && <p>{low > 0 ? <>{low.toLocaleString()} items are at or below their minimum stock. <button className="lnk" onClick={() => go('Purchase Invoice')}>Open Purchase Invoice</button> to restock.</> : 'No supplier due in the next 3 days, and nothing to order.'}</p>}</div>
          <button className={screen === 'Settings' ? 'on' : ''} onClick={() => go('Settings')}><Ico n="gear" s={16} /><span>{tr('Settings')}</span></button>
          <button className={screen === 'Updates' ? 'on' : ''} onClick={() => go('Updates')}><Ico n="cloud" s={16} /><span>{tr('Updates')}</span></button></aside>
        <section>{screen !== 'Sales Invoice' && screen !== 'Sales Return' && !['Purchase Invoice', 'Cash Payment', 'Cash Receipt'].includes(screen) && <h2 className="ptitle">{screen === 'Dashboard' ? `${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${me.name || ''}` : tr(screen)}</h2>}
          {posKind && <div className="postabs" role="tablist">{tabs.filter((x) => x.kind === posKind).map((x) => <div key={x.id} role="tab" aria-selected={act[posKind] === x.id} tabIndex="0" className={'ptab' + (act[posKind] === x.id ? ' on' : '')} onClick={() => setAct((s) => ({ ...s, [posKind]: x.id }))} onKeyDown={(e) => e.key === 'Enter' && setAct((s) => ({ ...s, [posKind]: x.id }))}>
            <Ico n={posKind === 'sale' ? 'cart' : 'undo'} s={14} /><span>{tabName(x)}</span>{dirty[x.id] && <i className="pdot" title="Has items that are not saved" />}
            <button className="px" title={`Close tab (${KEYS.closeTab})`} aria-label="Close tab" onClick={(e) => { e.stopPropagation(); closeTab(x.id); }}><Ico n="x" s={12} /></button></div>)}
          <button className="padd" title={`New tab (${KEYS.newTab})`} aria-label="New tab" onClick={() => addTab(posKind)}><Ico n="plus" s={15} /></button><span className="grow" />
          <small className="hint"><kbd>{KEYS.newTab}</kbd> new tab · <kbd>{KEYS.closeTab}</kbd> close tab{keepTabs ? ' · tabs stay open while you visit other screens' : ''}</small></div>}
          {['sale', 'ret'].map((kind) => (keepTabs || posKind === kind) && tabs.filter((x) => x.kind === kind).map((x) => {
            const vis = posKind === kind && act[kind] === x.id, od = (v) => setDirty((d) => (d[x.id] === v ? d : { ...d, [x.id]: v }));
            return <div key={x.id} className="pospane" style={{ display: vis ? 'block' : 'none', width: kind === 'sale' ? `calc(${pref.width}% - 32px)` : undefined }}>
              {kind === 'sale' ? <Sales edit={x.edit} resume={x.resume} active={vis} onDirty={od} onFinish={() => { closeTab(x.id, true); setScreen('Sales History'); }} />
                : <SalesReturn active={vis} onDirty={od} onClose={() => go('Dashboard')} />}</div>;
          }))}
          {!posKind && (View ? <View go={go} me={me} onPending={() => go('Pending Entries')} onResume={(b) => { setTab('SALES'); addTab('sale', { resume: b }); setScreen('Sales Invoice'); }} onEdit={(b) => { setTab('SALES'); addTab('sale', { edit: b }); setScreen('Sales Invoice'); }} onClose={() => go('Sales Invoice')} /> : <p className="soon">{tr(screen)} isn’t built yet.</p>)}
        </section>
      </div>
      <footer>{tr('CURRENT USER')} : {(me.name || '').toUpperCase()} <i>({me.role})</i><span className="low"><Ico n="warn" s={13} /> {low} {tr('low stock')}</span></footer>
    </div>
  );
}

function Sales({ edit, resume, onFinish, active = true, onDirty }) {
  const [prods, setProds] = useState([]), [shop, setShop] = useState({}), [no, setNo] = useState(''), [sales, setSales] = useState([]), [rets, setRets] = useState([]);
  const e0 = edit || resume, a0 = e0 ? e0.discount1 ?? e0.discount : 0;
  const [cart, setCart] = useState(e0 ? e0.items.map((x) => ({ ...x })) : []), [type, setType] = useState(e0 ? e0.type : 'CASH'), [cust, setCust] = useState(e0 && !/walk-in/i.test(e0.customer) ? e0.customer : ''), [remarks, setRemarks] = useState(e0?.remarks || '');
  const [date, setDate] = useState(e0?.date || new Date().toISOString().slice(0, 10)), [d1, setD1] = useState(a0 ? String(a0) : ''), [paid, setPaid] = useState(e0 ? String(e0.paid) : ''), [msg, setMsg] = useState('');
  const [d2, setD2] = useState(e0?.discount2 ? String(+((e0.discount2 / Math.max(1, e0.subtotal - a0)) * 100).toFixed(4)) : ''), [ask, setAsk] = useState(null), [askErr, setAskErr] = useState('');
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [price, setPrice] = useState(0), [disc, setDisc] = useState(0), [hi, setHi] = useState(0);
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [pr, setPr] = useState(null), [z, setZ0] = useState(getPrefs().size || 90), [vch, setVch] = useState([]);
  const setZ = (f) => setZ0((v) => { const n = typeof f === 'function' ? f(v) : f; savePrefs({ ...getPrefs(), size: n }); return n; });
  const latest = useRef(null), codeRef = useRef(), qtyRef = useRef(), custRef = useRef(), cashRef = useRef();
  const load = () => {
    api('vouchers').then((r) => setVch(Array.isArray(r) ? r : [])); api('products').then(setProds); api('returns').then((r) => setRets(Array.isArray(r) ? r : [])); api('settings').then((a) => setShop(a[0] || {}));
    api('sales').then((a) => { setSales(a); setNo('T11-' + String(a.length + 1).padStart(5, '0')); });
  };
  useEffect(() => { load(); if (active) codeRef.current?.focus(); if (resume) api('pending/' + resume.id, 'DELETE'); return () => onDirty?.(false); }, []);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (active) { load(); setTimeout(() => codeRef.current?.focus(), 0); } }, [active]);
  useEffect(() => { onDirty?.(cart.length > 0); }, [cart.length]);

  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  const sub = cart.reduce((s, x) => s + net(x), 0), units = cart.reduce((s, x) => s + x.qty, 0);
  const a1 = Math.min(+d1 || 0, sub), a2 = ((sub - a1) * (+d2 || 0)) / 100, total = Math.max(0, sub - a1 - a2);
  const walk = !cust || /walk-in/i.test(cust);
  const prev = walk ? 0 : sales.filter((s) => s.customer === cust && s.id !== edit?.id && !s.voided).reduce((t, s) => t + (s.balance || 0), 0) - rets.filter((r) => r.type === 'CREDIT' && r.customer === cust).reduce((t, r) => t + r.total, 0) + vadj(vch, cust);
  const rec = paid === '' ? (type === 'CASH' ? total : 0) : +paid, change = type === 'CASH' ? Math.max(0, rec - total) : 0;
  const cost = cart.reduce((s, x) => s + (prods.find((p) => p.id === x.productId)?.costPrice || 0) * x.qty, 0);
  const last = [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const hits = name && !sel ? prods.filter((p) => p.active !== false && p.name.toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];

  const pick = (p) => { setSel(p); setName(p.name); setPrice(p.salePrice); setQty(1); setDisc(p.discPct || 0); setTimeout(() => qtyRef.current?.select(), 0); };
  const addLine = (p, q = qty, r = price, d = disc) => {
    // same product (same ID or barcode) -> add qty to the existing line; price/discount follow the latest entry
    setCart((c) => {
      const bc = p.barcode || '';
      const i = c.findIndex((x) => (x.productId === p.id || (bc && x.code === bc)) && x.taken !== false);
      if (i >= 0) return c.map((x, j) => (j === i ? { ...x, qty: +x.qty + +q, rate: +r, disc: +d } : x));
      return [...c, { productId: p.id, code: p.barcode || '', name: p.name, qty: +q, rate: +r, disc: +d, taken: true }];
    });
    setSel(null); setName(''); setCode(''); setQty(1); setPrice(0); setDisc(0); codeRef.current?.focus();
  };
  const scan = () => { const p = code && prods.find((x) => x.barcode === code || x.code === code || String(x.pid) === code || x.id === code); p ? addLine(p, 1, p.salePrice, p.discPct || 0) : setMsg('No product with that barcode or ID.'); };
  const clear = () => { setCart([]); setCust(''); setRemarks(''); setD1(''); setD2(''); setPaid(''); setSel(null); setName(''); setCode(''); };
  const payload = () => ({ name: `Pending · ${cust || 'Walk-in'}`, items: cart, type, customer: cust, remarks, date, subtotal: sub, discount1: a1, discount2: a2, total, paid });
  const hold = async (auto) => {
    if (!cart.length || edit) return;
    await api('pending', 'POST', { ...payload(), auto: !!auto });
    clear(); setMsg(auto ? 'Auto-saved to Pending Entries (3 minutes without saving).' : 'Bill held. Find it in Pending Entries.');
  };
  latest.current = !edit && cart.length ? { ...payload(), auto: true } : null;
  useEffect(() => () => { // leaving this screen with an unsaved bill also keeps it
    const p = latest.current;
    if (p) fetch('/api/pending', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
  }, []);
  useEffect(() => { // 3 minutes without any change or save -> pending
    if (!cart.length || edit) return;
    const t = setTimeout(() => hold(true), 180000);
    return () => clearTimeout(t);
  }, [cart, type, cust, remarks, d1, d2, paid, date]);
  const doPrint = (s) => { setPr(s); setTimeout(() => { window.print(); setPr(null); }, 150); };
  const save = async (print) => {
    if (!cart.length) return setMsg('Add at least one item first.');
    if (edit) return setAsk({ title: `Save changes to ${edit.billNo}`, run: (pw) => api('sales/' + edit.id, 'PUT', { action: 'edit', password: pw, items: cart, customer: cust, remarks, type, date, discount1: a1, discount2: a2, paid: rec }) });
    const s = await api('sales', 'POST', { items: cart, type, customer: cust, remarks, date, discount: a1 + a2, discount1: a1, discount2: a2, paid: rec });
    if (s.error) return setMsg(s.error);
    setMsg(`Saved ${s.billNo}`); if (print || shop.autoPrint) doPrint(s);
    clear(); load();
  };
  useEffect(() => {
    const k = (e) => {
      if (!active) return;
      if (e.ctrlKey && ['-', '=', '+'].includes(e.key)) { e.preventDefault(); setZ((v) => Math.min(125, Math.max(70, v + (e.key === '-' ? -10 : 10)))); return; }
      if (e.key === 'Escape') setCat(false);
      const m = { barcode: () => codeRef.current?.focus(), catalogue: () => setCat(true), clear, toggleType: () => setType((t) => (t === 'CASH' ? 'CREDIT' : 'CASH')),
        customer: () => custRef.current?.focus(), hold: () => hold(false), cashRecv: () => cashRef.current?.focus(), save: () => save(false), savePrint: () => save(true) };
      const id = acts(e).find((x) => m[x]); if (id) { e.preventDefault(); m[id](); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const col = (l, el, w) => <div style={{ width: w, flex: w ? 'none' : 1, position: 'relative' }}><label>{l}</label>{el}</div>;

  return <>
    <h2 className="ptitle">{edit ? `Sales Invoice · Changing ${edit.billNo}` : `Sales Invoice No. ${no}`}</h2>
    <div className="inv" style={{ zoom: z / 100 }}>
      <p className="hint"><kbd>{KEYS.barcode}</kbd> barcode · <kbd>{KEYS.catalogue}</kbd> catalogue · <kbd>{KEYS.toggleType}</kbd> cash/credit · <kbd>{KEYS.customer}</kbd> customer · <kbd>{KEYS.cashRecv}</kbd> cash received · <kbd>{KEYS.save}</kbd> save · <kbd>{KEYS.savePrint}</kbd> save & print · <kbd>Ctrl -/+</kbd> size ({z}%)</p>
      <div className="hdr">
        <div className="fl"><label>Sale (F5)</label><button className={'typebtn ' + type} onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}<small>click or F5 to switch</small></button></div>
        <div className="fl"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="fl"><label>Customer (F6)</label><input ref={custRef} title="Name printed on the receipt (not saved to the customer list)" placeholder="Walk-in Customer" value={cust} onChange={(e) => setCust(e.target.value)} /></div>
        <div className="fl"><label>Remarks</label><input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
      </div>
      <div className="entry">
        {col('ID / BARCODE (F2)', <input ref={codeRef} placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 150)}
        {col('PRODUCT NAME', <>
          <input placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); setHi(0); }} onKeyDown={(e) => {
            if (!hits.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % hits.length); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + hits.length) % hits.length); }
            else if (e.key === 'Enter') { e.preventDefault(); pick(hits[Math.min(hi, hits.length - 1)]); }
            else if (e.key === 'Escape') { e.stopPropagation(); setName(''); }
          }} />
          {hits.length > 0 && <div className="drop">{hits.map((p, n) => <div key={p.id} className={'hit' + (n === hi ? ' on' : '')} onMouseEnter={() => setHi(n)} onClick={() => pick(p)}>{p.name} — {rs(p.salePrice)} <small>stock {p.stock} {p.unit}</small></div>)}</div>}</>)}
        <button className="cat" onClick={() => setCat(true)}><Ico n="box" s={15} /> Catalogue (F3)</button>
        {col('QTY', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {col('PRICE', <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 100)}
        {col('DISC. %', <input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sel && addLine(sel)} />, 70)}
        {col('NET VALUE', <input readOnly value={rs(qty * price * (1 - disc / 100))} />, 110)}
        <button className="pri" disabled={!sel} onClick={() => addLine(sel)}>Add</button>
      </div>
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th title="Taken now">✓</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC%</th><th className="num">AMOUNT</th><th></th></tr></thead>
        <tbody>{cart.length === 0 && <tr><td colSpan="8" className="empty">🧺<br />No items yet. Scan a barcode, type a code or name, or press F3 for the Product Catalogue.</td></tr>}
          {cart.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name} <small>· {prods.find((p) => p.id === x.productId)?.stock ?? '—'} in stock</small></td>
            <td><input type="checkbox" checked={x.taken !== false} title="Taken now" onChange={() => setCart(cart.map((y, j) => j === i ? { ...y, taken: y.taken === false } : y))} /></td>
            {['qty', 'rate', 'disc'].map((k) => <td key={k} className="num"><input type="number" min="0" value={x[k]} style={{ width: 80, textAlign: 'right' }} onChange={(e) => setCart(cart.map((y, j) => (j === i ? { ...y, [k]: +e.target.value } : y)))} /></td>)}<td className="num">{rs(net(x))}</td>
            <td><button onClick={() => setCart(cart.filter((_, j) => j !== i))}>✕</button></td></tr>)}</tbody></table>
      <div className="status"><span>{cart.length} lines · {units} units</span>
        {last && <span>✔ Last: <b>{last.billNo}</b> · {rs(last.total)} · change {rs(last.change)} <button className="lnk" onClick={() => doPrint(last)}><Ico n="print" s={15} /> Reprint</button></span>}</div>
      <div className="bottom">
        <div className="bl">
          <div><span>Prev. Balance</span><i>{rs(prev)}</i></div><div><span>This Bill</span><i>{rs(total)}</i></div>
          <div><span>Payable</span><i>{rs(prev + total)}</i></div>
          <div><span>Change</span><i className="g">{rs(change)}</i></div><div><span>Profit</span><i className="g">{rs(total - cost)}</i></div>
        </div>
        <div className="br">
          <div><span>TOTAL BILL</span><i>{rs(sub)}</i></div>
          <div><span className="red">DISC-1 Rs</span><input type="number" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} />
            <span className="red">DISC-2 %</span><input type="number" value={d2} placeholder="0" onChange={(e) => setD2(e.target.value)} /><i>{rs(a2)}</i></div>
          <div><span>NET AMOUNT</span><i className="net">{rs(total)}</i></div>
          <div><span className="red">CASH RECEIVED (F7)</span><input ref={cashRef} type="number" value={paid} placeholder="Blank = exact" onChange={(e) => setPaid(e.target.value)} /></div>
        </div>
      </div>
      <div className="btns"><button onClick={clear}>Clear (F4)</button><button disabled={!cart.length || !!edit} onClick={() => hold(false)}>Hold (F8)</button><button onClick={() => save(true)}><Ico n="print" s={15} /> Save & Print (F10)</button><button className="pri" onClick={() => save(false)}>{edit ? 'Update (F9)' : 'Save (F9)'}</button>{edit && <button onClick={onFinish}>Close</button>}</div>
      {msg && <p className="ok">{msg}</p>}
    </div>
    {ask && <Ask title={ask.title} err={askErr} onCancel={() => { setAsk(null); setAskErr(''); }} onOk={async (pw) => { const r = await ask.run(pw); if (r.error) setAskErr(r.error); else { setAsk(null); onFinish(); } }} />}
    {cat && <div className="modal" onClick={() => setCat(false)}><div className="mbox" onClick={(e) => e.stopPropagation()}>
      <b>Product Catalogue</b><input autoFocus placeholder="Search products" value={cq} onChange={(e) => setCq(e.target.value)} />
      <div className="mlist">{prods.filter((p) => p.active !== false && p.name.toLowerCase().includes(cq.toLowerCase())).map((p) => <div key={p.id} className="hit" onClick={() => { pick(p); setCat(false); setCq(''); }}>{p.name} — {rs(p.salePrice)} <small>stock {p.stock} {p.unit}</small></div>)}</div></div></div>}
    {pr && <Receipt pr={pr} shop={shop} />}
  </>;
}

function Ask({ title, needReason, err, onCancel, onOk }) {
  const [pw, setPw] = useState(''), [why, setWhy] = useState('');
  const ready = pw && (!needReason || why.trim());
  return <div className="modal" style={{ zIndex: 30 }} onClick={onCancel}><div className="mbox" onClick={(e) => e.stopPropagation()}>
    <b>{title}</b>
    {needReason && <><label>Reason</label><input autoFocus value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why is this bill being voided?" /></>}
    <label>Admin password</label>
    <input type="password" autoFocus={!needReason} value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ready && onOk(pw, why.trim())} />
    <NumPad onKey={(k) => setPw((v) => applyKey(v, k, 32))} />
    {err && <p style={{ color: '#b91c1c', margin: 0 }}>{err}</p>}
    <div className="btns"><button onClick={onCancel}>Cancel</button><button className="pri" disabled={!ready} onClick={() => onOk(pw, why.trim())}>Confirm</button></div>
  </div></div>;
}

const rs2 = (n) => 'Rs ' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ld = (d) => d.toLocaleDateString('en-CA');
const PER = 200;
const SORTS = { 'Newest first': (a, b) => b.createdAt.localeCompare(a.createdAt), 'Discount: low to high': (a, b) => a.disc - b.disc, 'Net amount: low to high': (a, b) => a.total - b.total, 'Customer: A to Z': (a, b) => a.customer.localeCompare(b.customer) };
const REASONS = ['Changed mind', 'Damaged', 'Expired', 'Wrong item', 'Other'];
function ReturnReceipt({ pr, shop }) {
  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  return <div className="receipt" style={paperVars(shop)}>
    {shop.logo && <div className="rc"><img src={shop.logo} alt="" style={{ width: '70%' }} /></div>}
    <div className="rc big">{shop.name}</div><div className="rc sm">{shop.address}<br />{shop.phone}</div><hr />
    <div className="rc sm">{tr('Sales Return_')} · {pr.type === 'CASH' ? 'Cash refund' : 'Credit to account'}</div>
    <div className="rl sm"><span>#{pr.returnNo}</span><span>{pr.date}</span></div>
    {pr.billNo && <div className="rl sm"><span>{tr('Against bill')}</span><span>{pr.billNo}</span></div>}
    <div className="rl sm"><span>{tr('Cashier')}</span><span>{pr.cashier}</span></div>
    <div className="rl sm"><span>{tr('Customer')}</span><span>{/walk-in/i.test(pr.customer) ? tr('Walk-in customer') : pr.customer}</span></div><hr />
    <div className="rl sm b"><span>{tr('DESCRIPTION')}</span><span>{tr('QTY')} · {tr('RATE')} · {tr('AMOUNT')}</span></div>
    {pr.items.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty} · {x.rate} · {Math.round(net(x))}</span></div>)}<hr />
    <div className="rl b"><span>{tr('Total Bill')}</span><span>{Math.round(pr.subtotal ?? pr.total)}</span></div>
    {pr.discount > 0 && <div className="rl sm"><span>{tr('Discount')}</span><span>{Math.round(pr.discount)}</span></div>}
    <div className="rl big"><span>{tr('Total Refund')}</span><span>Rs {Math.round(pr.total)}</span></div><hr />
    <div className="rc sm">{shop.footer}</div>
  </div>;
}

function SalesReturn({ onClose, active = true, onDirty }) {
  const [ask, setAsk] = useState(null), [askErr, setAskErr] = useState(''), [vch, setVch] = useState([]);
  const [prods, setProds] = useState([]), [sales, setSales] = useState([]), [rets, setRets] = useState([]), [shop, setShop] = useState({});
  const [type, setType] = useState('CASH'), [date, setDate] = useState(new Date().toISOString().slice(0, 10)), [cust, setCust] = useState(''), [remarks, setRemarks] = useState('');
  const [billNo, setBillNo] = useState(''), [bill, setBill] = useState(null), [d1, setD1] = useState(''), [d2, setD2] = useState('');
  const [lines, setLines] = useState([]), [row, setRow] = useState(-1), [editAt, setEditAt] = useState(null);
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [price, setPrice] = useState(0), [disc, setDisc] = useState(0), [hi, setHi] = useState(0);
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [msg, setMsg] = useState(null), [pr, setPr] = useState(null), [busy, setBusy] = useState(false);
  const codeRef = useRef(), qtyRef = useRef(), custRef = useRef(), listRef = useRef();
  const arr = (r) => (Array.isArray(r) ? r : []);
  const load = () => { api('vouchers').then((r) => setVch(arr(r))); api('products').then((r) => setProds(arr(r))); api('sales').then((r) => setSales(arr(r))); api('returns').then((r) => setRets(arr(r))); api('settings').then((a) => setShop(arr(a)[0] || {})); };
  useEffect(() => { load(); if (active) codeRef.current?.focus(); return () => onDirty?.(false); }, []);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (active) { load(); setTimeout(() => codeRef.current?.focus(), 0); } }, [active]);
  useEffect(() => { onDirty?.(lines.length > 0); }, [lines.length]);

  const till = shop.till || 'T11', no = `${till}-SR-${String(rets.length + 1).padStart(5, '0')}`;
  const net = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100);
  const sub = lines.reduce((t, x) => t + net(x), 0), units = lines.reduce((t, x) => t + x.qty, 0);
  const a1 = Math.min(+d1 || 0, sub), a2 = ((sub - a1) * (+d2 || 0)) / 100, total = Math.max(0, sub - a1 - a2);
  const walk = !cust.trim() || /walk-in/i.test(cust);
  const prev = walk ? 0 : sales.filter((s) => s.customer === cust.trim() && !s.voided).reduce((t, s) => t + (s.balance || 0), 0) - rets.filter((r) => r.type === 'CREDIT' && r.customer === cust.trim()).reduce((t, r) => t + r.total, 0) + vadj(vch, cust);
  const payable = type === 'CREDIT' ? prev - total : prev;
  const last = [...rets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  // What can be picked: what is still returnable on the bill, or the whole catalogue.
  let pool;
  if (bill) {
    const grp = {}, back = {};
    for (const it of bill.items) { if (it.taken === false) continue; const g = (grp[it.productId] ??= { qty: 0, gross: 0, amt: 0, it }); g.qty += +it.qty; g.gross += +it.qty * it.rate; g.amt += +it.qty * it.rate * (1 - (it.disc || 0) / 100); }
    for (const r of rets.filter((r) => r.billNo === bill.billNo)) for (const it of r.items) back[it.productId] = (back[it.productId] || 0) + +it.qty;
    pool = Object.entries(grp).map(([pid, g]) => { const p = prods.find((x) => x.id === pid); return { productId: pid, code: g.it.code || p?.barcode || '', name: g.it.name, price: +(g.gross / g.qty).toFixed(2), disc: g.gross ? +((1 - g.amt / g.gross) * 100).toFixed(2) : 0, stock: p?.stock, unit: p?.unit || '', left: g.qty - (back[pid] || 0) }; }).filter((x) => x.left > 0);
  } else pool = prods.filter((p) => p.active !== false).map((p) => ({ productId: p.id, code: p.barcode || '', name: p.name, price: p.salePrice, disc: 0, stock: p.stock, unit: p.unit || '' }));
  const hits = name && !sel ? pool.filter((p) => p.name.toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];
  const info = (p) => (bill ? `can return ${p.left}` : `stock ${p.stock} ${p.unit}`);

  const pick = (p) => { setSel(p); setName(p.name); setCode(p.code); setPrice(p.price); setDisc(p.disc || 0); setQty(1); setMsg(null); setTimeout(() => qtyRef.current?.select(), 0); };
  const clearEntry = () => { setEditAt(null); setSel(null); setName(''); setCode(''); setQty(1); setPrice(0); setDisc(0); };
  const addLine = (p, q = qty, r = price, d = disc) => {
    q = +q; r = +r; d = +d;
    if (!(q > 0)) return setMsg({ e: 'Enter a quantity above zero.' });
    if (!(r >= 0) || !(d >= 0 && d <= 100)) return setMsg({ e: 'Check the price and discount.' });
    const have = lines.reduce((t, l, i) => t + (l.productId === p.productId && i !== editAt ? l.qty : 0), 0);
    if (bill && have + q > p.left) return setMsg({ e: `Only ${p.left} of ${p.name} can still be returned on ${bill.billNo}.` });
    setLines((ls) => {
      if (editAt != null) return ls.map((l, i) => (i === editAt ? { ...l, productId: p.productId, code: p.code, name: p.name, qty: q, rate: r, disc: d } : l));
      const i = ls.findIndex((l) => l.productId === p.productId); // same product: add to the existing line
      return i >= 0 ? ls.map((l, j) => (j === i ? { ...l, qty: l.qty + q, rate: r, disc: d } : l)) : [...ls, { productId: p.productId, code: p.code, name: p.name, qty: q, rate: r, disc: d, reason: REASONS[0] }];
    });
    clearEntry(); setMsg(null); codeRef.current?.focus();
  };
  const scan = () => { const p = pool.find((x) => x.code === code || x.productId === code); p ? addLine(p, 1, p.price, p.disc || 0) : setMsg({ e: bill ? `That item is not on ${bill.billNo}, or it has already been returned.` : 'No product with that barcode or ID.' }); };
  const edit = (i) => {
    const x = lines[i]; if (!x) return;
    const p = pool.find((y) => y.productId === x.productId) || { productId: x.productId, code: x.code, name: x.name, price: x.rate, disc: x.disc, left: undefined };
    setSel(p); setName(x.name); setCode(x.code); setQty(x.qty); setPrice(x.rate); setDisc(x.disc || 0); setEditAt(i); setMsg(null); setTimeout(() => qtyRef.current?.select(), 0);
  };
  const remove = (i) => {
    setLines((ls) => ls.filter((_, j) => j !== i)); setRow(Math.min(i, lines.length - 2));
    if (editAt === i) clearEntry(); else if (editAt != null && editAt > i) setEditAt(editAt - 1);
  };
  const reset = (keepMsg) => { setLines([]); setRow(-1); clearEntry(); setCust(''); setRemarks(''); setBillNo(''); setBill(null); setD1(''); setD2(''); setType('CASH'); if (keepMsg !== true) setMsg(null); codeRef.current?.focus(); };
  const findBill = () => {
    const v = billNo.trim().toUpperCase();
    if (!v) { setBill(null); return; }
    const n = /^\d+$/.test(v) ? v.padStart(5, '0') : null;
    const s = sales.find((x) => x.billNo.toUpperCase() === v || (n && x.billNo.endsWith('-' + n)));
    if (!s) return setMsg({ e: `No bill ${v} found.` });
    if (s.voided) return setMsg({ e: `${s.billNo} was voided, so nothing can be returned on it.` });
    const pct = s.subtotal > 0 ? ((s.subtotal - s.total) / s.subtotal) * 100 : 0; // the bill's own discount, shared across what comes back
    setBill(s); setBillNo(s.billNo); setD1(''); setD2(pct > 0.0001 ? String(+pct.toFixed(4)) : '');
    if (!/walk-in/i.test(s.customer)) setCust(s.customer);
    setType(s.type === 'CREDIT' ? 'CREDIT' : 'CASH'); clearEntry();
    if (lines.length) { setLines([]); setRow(-1); setMsg({ e: 'Bill loaded. The items you had added were cleared.' }); } else setMsg(null);
    codeRef.current?.focus();
  };
  const doPrint = (r) => { setPr(r); setTimeout(() => { window.print(); setPr(null); }, 150); };
  const payload = (approval) => ({ items: lines, type, customer: cust.trim(), billNo: bill?.billNo || '', remarks, date, discount1: a1, discount2: a2, approval });
  const done = (r, print) => { if (print) doPrint(r); reset(true); setMsg({ ok: `Saved ${r.returnNo} · refund ${rs2(r.total)}` }); load(); };
  const save = async (print) => {
    if (busy) return;
    if (!lines.length) return setMsg({ e: 'Add at least one item first.' });
    if (type === 'CREDIT' && walk) return setMsg({ e: 'Enter the customer whose account should be credited (or switch to CASH).' });
    setBusy(true); const r = await api('returns', 'POST', payload()); setBusy(false);
    if (r.needApproval) return setAsk({ title: `This return is above Rs ${r.limit}. Enter an Admin or Accountant PIN`, run: async (pw) => { const x = await api('returns', 'POST', payload(pw)); if (!x.error) done(x, print); return x; } });
    if (r.error) return setMsg({ e: r.error });
    done(r, print);
  };
  const listKey = (e) => {
    if (e.target !== e.currentTarget || !lines.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setRow((r) => Math.min(r + 1, lines.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (row <= 0) { setRow(-1); codeRef.current?.focus(); } else setRow(row - 1); }
    else if (e.key === 'Enter' && row >= 0) { e.preventDefault(); edit(row); }
    else if (e.key === 'ArrowRight' && row >= 0) { e.preventDefault(); document.querySelector('.rlines tr.sel select')?.focus(); }
    else if (e.key === 'Delete' && row >= 0) { e.preventDefault(); remove(row); }
  };
  useEffect(() => {
    const k = (e) => {
      if (!active) return;
      if (e.key === 'Escape') { setCat(false); return; }
      const m = { barcode: () => codeRef.current?.focus(), catalogue: () => setCat(true), clear: () => reset(), toggleType: () => setType((t) => (t === 'CASH' ? 'CREDIT' : 'CASH')), customer: () => custRef.current?.focus(), save: () => save(false), save2: () => save(false), savePrint: () => save(true) };
      const id = acts(e).find((x) => m[x]); if (id) { e.preventDefault(); m[id](); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const col = (l, el, w) => <div style={{ width: w, flex: w ? 'none' : 1, position: 'relative' }}><label>{l}</label>{el}</div>;
  const go = (e) => e.key === 'Enter' && sel && addLine(sel);

  return <>
    <h2 className="ptitle">Sales Return No. {no}</h2>
    <div className="inv">
      <p className="hint"><kbd>↑↓</kbd> move · <kbd>Enter</kbd> change an item · <kbd>→</kbd> reason · <kbd>Del</kbd> remove · <kbd>F9</kbd> save · stock goes back in, money goes back out</p>
      <div className="hdr">
        <div className="fl"><label>Return (F5)</label><button className="typebtn CASH rt" title="CASH: money is handed back. CREDIT: the amount is taken off the customer's account." onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}<small>click or F5 to switch</small></button></div>
        <div className="fl"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="fl"><label>Customer (F6)</label><input ref={custRef} placeholder="Walk-in Customer" value={cust} onChange={(e) => setCust(e.target.value)} /></div>
        <div className="fl"><label>Remarks</label><input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
        <div className="fl wide"><label>Sales Inv #</label>
          <input className="billin" placeholder={`Optional: ${till}-00042 or 42`} value={billNo} onChange={(e) => { setBillNo(e.target.value); if (!e.target.value) { setBill(null); setD1(''); setD2(''); } }} onKeyDown={(e) => e.key === 'Enter' && findBill()} />
          <button className="rsearch" aria-label="Find bill" title="Find bill" onClick={findBill}>🔍</button>
          <span className="hint">{bill ? <>Checking items against <b>{bill.billNo}</b> · {bill.customer} · {rs2(bill.total)}</> : 'Optional. With the bill number, items are checked against that bill.'}</span></div>
      </div>
      <div className="entry">
        {col('ID / BARCODE (F2)', <input ref={codeRef} className="mono" placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 150)}
        {col('PRODUCT NAME', <>
          <input placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); setHi(0); }} onKeyDown={(e) => {
            if (!hits.length) { if (e.key === 'ArrowDown' && lines.length && !name) { e.preventDefault(); setRow(0); listRef.current?.focus(); } return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % hits.length); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + hits.length) % hits.length); }
            else if (e.key === 'Enter') { e.preventDefault(); pick(hits[Math.min(hi, hits.length - 1)]); }
            else if (e.key === 'Escape') { e.stopPropagation(); setName(''); }
          }} />
          {hits.length > 0 && <div className="drop">{hits.map((p, n) => <div key={p.productId} className={'hit' + (n === hi ? ' on' : '')} onMouseEnter={() => setHi(n)} onClick={() => pick(p)}>{p.name} — {rs(p.price)} <small>{info(p)}</small></div>)}</div>}</>)}
        <button className="cat" onClick={() => setCat(true)}><Ico n="box" s={15} /> Catalogue (F3)</button>
        {col('QTY', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={go} />, 70)}
        {col('PRICE', <div className="pfx"><span>Rs</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={go} /></div>, 110)}
        {col('DISC. %', <div className="pfx sfx"><input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={go} /><span>%</span></div>, 80)}
        {col('NET VALUE', <input readOnly value={rs2(qty * price * (1 - disc / 100))} />, 120)}
        <button className="pri" disabled={!sel} onClick={() => addLine(sel)}>{editAt != null ? 'Update' : 'Add'}</button>
      </div>
      <div className="rlines" tabIndex={0} ref={listRef} onKeyDown={listKey}>
        <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC%</th><th className="num">AMOUNT</th><th>REASON</th><th></th></tr></thead>
          <tbody>{lines.length === 0 && <tr><td colSpan="8" className="empty">↩<br />No items yet. Scan the item coming back, type its name, or press F3 for the Product Catalogue.</td></tr>}
            {lines.map((x, i) => <tr key={i} className={(i === row ? 'sel ' : '') + (i === editAt ? 'editing' : '')} onClick={(e) => { setRow(i); if (!['SELECT', 'OPTION', 'BUTTON'].includes(e.target.tagName)) listRef.current?.focus(); }} onDoubleClick={() => edit(i)}>
              <td>{i + 1}</td><td>{x.name}</td><td className="num">{x.qty}</td><td className="num">{rs2(x.rate)}</td><td className="num">{x.disc || 0}</td><td className="num">{rs2(net(x))}</td>
              <td><select className="rsel" aria-label={`Reason for ${x.name}`} value={x.reason} onFocus={() => setRow(i)} onChange={(e) => setLines(lines.map((y, j) => (j === i ? { ...y, reason: e.target.value } : y)))}
                onKeyDown={(e) => { if (['Escape', 'Enter', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); listRef.current?.focus(); } }}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></td>
              <td><button title="Remove (Del)" aria-label={`Remove ${x.name}`} onClick={() => remove(i)}>✕</button></td></tr>)}</tbody></table>
      </div>
      <div className="status"><span>{lines.length} lines · {units} units · reasons are saved with the return</span>
        {last && <span>✔ Last: <b>{last.returnNo}</b> · {rs2(last.total)} <button className="lnk" onClick={() => doPrint(last)}><Ico n="print" s={15} /> Reprint</button></span>}</div>
      <div className="bottom">
        <div className="bl">
          <div><span>Prev. Bal:</span><i>{rs2(prev)}</i></div><div><span>This Bill:</span><i>{rs2(total)}</i></div>
          <div><span>Total Payable:</span><i className="pay">{rs2(payable)}</i></div>
        </div>
        <div className="br">
          <div><span>TOTAL BILL</span><i>{rs2(sub)}</i></div>
          <div><span className="red">DISCOUNT-1 Rs</span><input type="number" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} /></div>
          <div><span className="red">DISCOUNT-2 %</span><input type="number" value={d2} placeholder="0" onChange={(e) => setD2(e.target.value)} /><i>{rs2(a2)}</i></div>
          <div><span>NET AMOUNT</span><i className="net">{rs2(total)}</i></div>
        </div>
      </div>
      <div className="btns"><button onClick={() => reset()}>Clear <kbd>{KEYS.clear}</kbd></button><button disabled={!lines.length || busy} onClick={() => save(true)}><Ico n="print" s={15} /> Save & Print <kbd>{KEYS.savePrint}</kbd></button><button className="pri" disabled={!lines.length || busy} onClick={() => save(false)}>Save <kbd>{KEYS.save}</kbd></button><button onClick={onClose}>Close</button></div>
      {msg && <p className={msg.e ? 'rerr' : 'ok'} role={msg.e ? 'alert' : undefined}>{msg.e || msg.ok}</p>}
    </div>
    {cat && <div className="modal" onClick={() => setCat(false)}><div className="mbox" onClick={(e) => e.stopPropagation()}>
      <b>{bill ? `Items on ${bill.billNo}` : 'Product Catalogue'}</b><input autoFocus placeholder="Search products" value={cq} onChange={(e) => setCq(e.target.value)} />
      <div className="mlist">{pool.filter((p) => p.name.toLowerCase().includes(cq.toLowerCase())).map((p) => <div key={p.productId} className="hit" onClick={() => { pick(p); setCat(false); setCq(''); }}>{p.name} — {rs(p.price)} <small>{info(p)}</small></div>)}</div></div></div>}
    {ask && <Ask title={ask.title} err={askErr} onCancel={() => { setAsk(null); setAskErr(''); }} onOk={async (pw) => { const r = await ask.run(pw); if (r.error) setAskErr(r.error); else { setAsk(null); setAskErr(''); } }} />}
    {pr && <ReturnReceipt pr={pr} shop={shop} />}
  </>;
}

function SalesHistory({ onEdit, onPending }) {
  const [sort, setSort] = useState('Newest first'), [det, setDet] = useState(null), [ask, setAsk] = useState(null), [askErr, setAskErr] = useState(''), [pr, setPr] = useState(null), [shop, setShop] = useState({});
  const [all, setAll] = useState([]), [mode, setMode] = useState('All'), [q, setQ] = useState(''), [bf, setBf] = useState(0), [bt, setBt] = useState(0), [rem, setRem] = useState(false), [page, setPage] = useState(0);
  const range = (n) => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - n); return [ld(f), ld(t)]; };
  const [[from, to], setR] = useState(range(0)), [chip, setChip] = useState('Today');
  const load = () => { api('sales').then(setAll); api('settings').then((a) => setShop(a[0] || {})); };
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const pick = (k) => {
    const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    setChip(k); setPage(0);
    setR({ Today: [ld(t), ld(t)], Yesterday: [ld(y), ld(y)], '7 days': range(6), '30 days': range(29), 'This month': [ld(new Date(t.getFullYear(), t.getMonth(), 1)), ld(t)] }[k]);
  };
  const rows = all.map((s) => {
    const gross = s.items.reduce((t, x) => t + x.qty * x.rate, 0);
    return { ...s, gross, disc: gross - s.total, pct: gross ? ((gross - s.total) / gross) * 100 : 0, no: parseInt(s.billNo.slice(4), 10), day: ld(new Date(s.createdAt)) };
  }).filter((s) => s.day >= from && s.day <= to
    && (mode === 'All' || (mode === 'Voided' ? s.voided : !s.voided && s.type === mode.toUpperCase()))
    && (!bf || s.no >= bf) && (!bt || s.no <= bt)
    && (!rem || s.items.some((x) => x.taken === false))
    && (s.billNo + s.customer + (s.remarks || '')).toLowerCase().includes(q.toLowerCase()))
    .sort(SORTS[sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PER)), pg = Math.min(page, pages - 1), shown = rows.slice(pg * PER, pg * PER + PER);
  const G = rows.filter((s) => !s.voided).reduce((t, s) => ({ g: t.g + s.gross, d: t.d + s.disc, n: t.n + s.total }), { g: 0, d: 0, n: 0 });
  const fmt = (c) => { const d = new Date(c), p = (n) => String(n).padStart(2, '0'); return `${ld(d)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const csv = () => {
    const t = ['Bill,Date,Mode,Customer,Gross,Disc,Net,Remarks,User', ...rows.map((s) => [s.billNo, fmt(s.createdAt), s.type, s.customer, s.gross, s.disc, s.total, s.remarks || '', s.cashier].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'sales-history.csv'; a.click();
  };
  const nb = (v, set) => <input type="number" min="0" value={v} onChange={(e) => { set(+e.target.value); setPage(0); }} style={{ width: 80 }} />;
  return <>
    <div className="filters"><span>All tills and cashiers</span><span className="grow" /><button className="chip" onClick={onPending}>Pending Entries</button><button className="chip" onClick={csv}><Ico n="down" s={15} /> CSV</button></div>
    <div className="filters">
      <input type="date" value={from} onChange={(e) => { setR([e.target.value, to]); setChip(''); setPage(0); }} style={{ width: 150 }} />→
      <input type="date" value={to} onChange={(e) => { setR([from, e.target.value]); setChip(''); setPage(0); }} style={{ width: 150 }} />
      {['Today', 'Yesterday', '7 days', '30 days', 'This month'].map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => pick(k)}>{k}</button>)}
      <input placeholder="Bill #, customer or remarks" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} style={{ maxWidth: 260 }} />
      <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} style={{ width: 'auto' }}>{Object.keys(SORTS).map((k) => <option key={k}>{k}</option>)}</select>
      <b>Bill From</b>{nb(bf, setBf)}<b>To</b>{nb(bt, setBt)}
      {['All', 'Cash', 'Credit', 'Voided'].map((k) => <button key={k} className={mode === k ? 'chip on' : 'chip'} onClick={() => { setMode(k); setPage(0); }}>{k}</button>)}
    </div>
    <label className="red"><input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} style={{ width: 'auto' }} /> Remaining items only</label>
    <table style={{ width: '100%', marginTop: 8 }}><thead><tr><th>BILL #</th><th>DATE</th><th>MODE</th><th>DESCRIPTION</th><th className="num">GROSS TOTAL</th><th className="num">DISC</th><th className="num">DISC %</th><th className="num">NET BILL</th><th>REMARKS</th><th>USER</th></tr></thead>
      <tbody>{shown.length === 0 && <tr><td colSpan="10" className="empty">No sales in this range.</td></tr>}
        {shown.map((s) => <tr key={s.id} className={(s.voided ? 'void ' : '') + (s.disc > 0.005 ? 'dsc' : '')} onClick={() => setDet(s)} style={{ cursor: 'pointer' }}><td className="mono">{s.billNo}</td><td>{fmt(s.createdAt)}</td>
          <td><span className={'tag ' + (s.type === 'CASH' ? 'Create' : 'Credit')}>{s.type === 'CASH' ? 'Cash' : 'Credit'}</span></td>
          <td>{s.items[0]?.name}{s.items.length > 1 && ` +${s.items.length - 1} more`}<br /><small>{s.customer}</small></td>
          <td className="num">{rs2(s.gross)}</td><td className="num">{rs2(s.disc)}</td><td className="num">{s.pct.toFixed(2)}</td><td className="num"><b>{rs2(s.total)}</b></td><td>{s.remarks}</td><td>{s.cashier}</td></tr>)}</tbody></table>
    <div className="grand"><span>Total Invoices: {rows.length} (totals include every page)</span><span className="grow" /><b>GRAND TOTAL</b><span>{rs2(G.g)}</span><span>{rs2(G.d)}</span><span>{G.g ? ((G.d / G.g) * 100).toFixed(2) : '0.00'}</span><span>{rs2(G.n)}</span></div>
    <div className="filters" style={{ marginTop: 8 }}><small>Showing {rows.length ? pg * PER + 1 : 0}–{pg * PER + shown.length} of {rows.length}</small><span className="grow" />
      <button className="chip" disabled={pg === 0} onClick={() => setPage(0)}>First</button><button className="chip" disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button>
      <b>Page {pg + 1} of {pages}</b><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pages - 1)}>Last</button></div>
    <div className="btns"><button onClick={load}>Refresh</button></div>
    {det && <div className="modal" onClick={() => setDet(null)}><div className="mbox wide" onClick={(e) => e.stopPropagation()}>
      <div className="mono" style={{ fontSize: 18 }}><b>{det.billNo}</b> {det.voided && <span className="tag Delete">VOIDED</span>} {det.edited && <span className="tag Update">EDITED</span>}</div>
      <p style={{ margin: 0 }}>{new Date(det.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')} · {det.type === 'CASH' ? 'Cash' : 'Credit'} · {det.customer} · by {det.cashier}</p>
      {det.voided && <p style={{ margin: 0, color: '#b91c1c' }}>Void reason: {det.voidReason}</p>}
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">AMOUNT</th></tr></thead>
        <tbody>{det.items.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name}{x.taken === false && <><br /><small>Remaining, not taken yet</small></>}</td><td className="num">{x.qty}</td><td className="num">{rs2(x.rate)}</td><td className="num">{x.disc ? x.disc : ''}</td><td className="num">{rs2(x.qty * x.rate * (1 - (x.disc || 0) / 100))}</td></tr>)}</tbody></table>
      <div className="dtot">
        <div><span>Total Bill</span><i>{rs2(det.subtotal)}</i></div>
        <div><span>Discount-1</span><i>{rs2(det.discount1 ?? det.discount)}</i></div>
        <div><span>Discount-2</span><i>{rs2(det.discount2 ?? 0)}</i></div>
        <div className="b"><span>Net Amount</span><i>{rs2(det.total)}</i></div>
        <div><span>{det.type === 'CASH' ? 'Cash Received' : 'Paid'}</span><i>{rs2(det.paid)}</i></div>
        <div><span>{det.type === 'CASH' ? 'Change' : 'Balance'}</span><i>{rs2(det.type === 'CASH' ? det.change : det.balance)}</i></div>
      </div>
      <div className="btns" style={{ justifyContent: 'space-between' }}>
        <button disabled={det.voided} onClick={() => setAsk({ title: `Void ${det.billNo}`, needReason: true, run: (pw, why) => api('sales/' + det.id, 'PUT', { action: 'void', password: pw, reason: why }) })}>🚫 Void invoice</button>
        <span><button disabled={det.voided} onClick={() => { const b = det; setDet(null); onEdit(b); }}><Ico n="pen" s={15} /> Edit</button> <button onClick={() => { setPr(det); setTimeout(() => { window.print(); setPr(null); }, 150); }}><Ico n="print" s={15} /> Reprint receipt</button> <button className="pri" onClick={() => setDet(null)}>Done</button></span>
      </div>
    </div></div>}
    {ask && <Ask title={ask.title} needReason={ask.needReason} err={askErr} onCancel={() => { setAsk(null); setAskErr(''); }}
      onOk={async (pw, why) => { const r = await ask.run(pw, why); if (r.error) setAskErr(r.error); else { setAsk(null); setAskErr(''); setDet(null); load(); } }} />}
    {pr && <Receipt pr={pr} shop={shop} />}
  </>;
}

function ReturnHistory({ go }) {
  const [sort, setSort] = useState('Newest first'), [det, setDet] = useState(null), [pr, setPr] = useState(null), [shop, setShop] = useState({});
  const [all, setAll] = useState([]), [mode, setMode] = useState('All'), [q, setQ] = useState(''), [bf, setBf] = useState(0), [bt, setBt] = useState(0), [onlyBill, setOnlyBill] = useState(false), [page, setPage] = useState(0);
  const range = (n) => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - n); return [ld(f), ld(t)]; };
  const [[from, to], setR] = useState(range(0)), [chip, setChip] = useState('Today');
  const load = () => { api('returns').then((a) => setAll(Array.isArray(a) ? a : [])); api('settings').then((a) => setShop(a[0] || {})); };
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const pick = (k) => {
    const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    setChip(k); setPage(0);
    setR({ Today: [ld(t), ld(t)], Yesterday: [ld(y), ld(y)], '7 days': range(6), '30 days': range(29), 'This month': [ld(new Date(t.getFullYear(), t.getMonth(), 1)), ld(t)] }[k]);
  };
  const rows = all.map((s) => {
    const gross = s.items.reduce((t, x) => t + x.qty * x.rate, 0);
    return { ...s, gross, disc: gross - s.total, pct: gross ? ((gross - s.total) / gross) * 100 : 0, no: parseInt(String(s.returnNo).split('-').pop(), 10) || 0, day: ld(new Date(s.createdAt)) };
  }).filter((s) => s.day >= from && s.day <= to
    && (mode === 'All' || s.type === mode.toUpperCase())
    && (!bf || s.no >= bf) && (!bt || s.no <= bt)
    && (!onlyBill || s.billNo)
    && (s.returnNo + s.customer + (s.billNo || '') + (s.remarks || '')).toLowerCase().includes(q.toLowerCase()))
    .sort(SORTS[sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PER)), pg = Math.min(page, pages - 1), shown = rows.slice(pg * PER, pg * PER + PER);
  const G = rows.reduce((t, s) => ({ g: t.g + s.gross, d: t.d + s.disc, n: t.n + s.total }), { g: 0, d: 0, n: 0 });
  const fmt = (c) => { const d = new Date(c), p = (n) => String(n).padStart(2, '0'); return `${ld(d)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const csv = () => {
    const t = ['Return,Date,Mode,Against bill,Customer,Gross,Disc,Net,Remarks,User', ...rows.map((s) => [s.returnNo, fmt(s.createdAt), s.type, s.billNo || '', s.customer, s.gross, s.disc, s.total, s.remarks || '', s.cashier].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'return-history.csv'; a.click();
  };
  const nb = (v, set) => <input type="number" min="0" value={v} onChange={(e) => { set(+e.target.value); setPage(0); }} style={{ width: 80 }} />;
  return <>
    <div className="filters"><span>All tills and cashiers</span><span className="grow" /><button className="chip" onClick={() => go('Sales Return')}><Ico n="undo" s={15} /> New Sales Return</button><button className="chip" onClick={csv}><Ico n="down" s={15} /> CSV</button></div>
    <div className="filters">
      <input type="date" value={from} onChange={(e) => { setR([e.target.value, to]); setChip(''); setPage(0); }} style={{ width: 150 }} />→
      <input type="date" value={to} onChange={(e) => { setR([from, e.target.value]); setChip(''); setPage(0); }} style={{ width: 150 }} />
      {['Today', 'Yesterday', '7 days', '30 days', 'This month'].map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => pick(k)}>{k}</button>)}
      <input placeholder="Return #, bill #, customer or remarks" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} style={{ maxWidth: 300 }} />
      <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} style={{ width: 'auto' }}>{Object.keys(SORTS).map((k) => <option key={k}>{k}</option>)}</select>
      <b>Return From</b>{nb(bf, setBf)}<b>To</b>{nb(bt, setBt)}
      {['All', 'Cash', 'Credit'].map((k) => <button key={k} className={mode === k ? 'chip on' : 'chip'} onClick={() => { setMode(k); setPage(0); }}>{k}</button>)}
    </div>
    <label className="red"><input type="checkbox" checked={onlyBill} onChange={(e) => setOnlyBill(e.target.checked)} style={{ width: 'auto' }} /> Against a bill only</label>
    <table style={{ width: '100%', marginTop: 8 }}><thead><tr><th>RETURN #</th><th>DATE</th><th>MODE</th><th>DESCRIPTION</th><th>BILL #</th><th className="num">GROSS TOTAL</th><th className="num">DISC</th><th className="num">DISC %</th><th className="num">NET REFUND</th><th>REMARKS</th><th>USER</th></tr></thead>
      <tbody>{shown.length === 0 && <tr><td colSpan="11" className="empty">No returns in this range.</td></tr>}
        {shown.map((s) => <tr key={s.id} className={s.disc > 0.005 ? 'dsc' : ''} onClick={() => setDet(s)} style={{ cursor: 'pointer' }}><td className="mono">{s.returnNo}</td><td>{fmt(s.createdAt)}</td>
          <td><span className={'tag ' + (s.type === 'CASH' ? 'Create' : 'Credit')}>{s.type === 'CASH' ? 'Cash' : 'Credit'}</span></td>
          <td>{s.items[0]?.name}{s.items.length > 1 && ` +${s.items.length - 1} more`}<br /><small>{s.customer}</small></td><td className="mono">{s.billNo}</td>
          <td className="num">{rs2(s.gross)}</td><td className="num">{rs2(s.disc)}</td><td className="num">{s.pct.toFixed(2)}</td><td className="num"><b>{rs2(s.total)}</b></td><td>{s.remarks}</td><td>{s.cashier}</td></tr>)}</tbody></table>
    <div className="grand"><span>Total Returns: {rows.length} (totals include every page)</span><span className="grow" /><b>GRAND TOTAL</b><span>{rs2(G.g)}</span><span>{rs2(G.d)}</span><span>{G.g ? ((G.d / G.g) * 100).toFixed(2) : '0.00'}</span><span>{rs2(G.n)}</span></div>
    <div className="filters" style={{ marginTop: 8 }}><small>Showing {rows.length ? pg * PER + 1 : 0}–{pg * PER + shown.length} of {rows.length}</small><span className="grow" />
      <button className="chip" disabled={pg === 0} onClick={() => setPage(0)}>First</button><button className="chip" disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button>
      <b>Page {pg + 1} of {pages}</b><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pages - 1)}>Last</button></div>
    <div className="btns"><button onClick={load}>Refresh</button></div>
    {det && <div className="modal" onClick={() => setDet(null)}><div className="mbox wide" onClick={(e) => e.stopPropagation()}>
      <div className="mono" style={{ fontSize: 18 }}><b>{det.returnNo}</b></div>
      <p style={{ margin: 0 }}>{new Date(det.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')} · {det.type === 'CASH' ? 'Cash refund' : 'Credit to account'} · {det.customer} · by {det.cashier}{det.billNo && ` · against ${det.billNo}`}</p>
      {det.remarks && <p style={{ margin: 0 }}>Remarks: {det.remarks}</p>}
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th>REASON</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">AMOUNT</th></tr></thead>
        <tbody>{det.items.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name}</td><td>{x.reason}</td><td className="num">{x.qty}</td><td className="num">{rs2(x.rate)}</td><td className="num">{x.disc ? x.disc : ''}</td><td className="num">{rs2(x.qty * x.rate * (1 - (x.disc || 0) / 100))}</td></tr>)}</tbody></table>
      <div className="dtot">
        <div><span>Total Bill</span><i>{rs2(det.subtotal)}</i></div>
        <div><span>Discount-1</span><i>{rs2(det.discount1 ?? det.discount)}</i></div>
        <div><span>Discount-2</span><i>{rs2(det.discount2 ?? 0)}</i></div>
        <div className="b"><span>Total Refund</span><i>{rs2(det.total)}</i></div>
      </div>
      <div className="btns" style={{ justifyContent: 'flex-end' }}>
        <button onClick={() => { setPr(det); setTimeout(() => { window.print(); setPr(null); }, 150); }}><Ico n="print" s={15} /> Reprint receipt</button> <button className="pri" onClick={() => setDet(null)}>Done</button>
      </div>
    </div></div>}
    {pr && <ReturnReceipt pr={pr} shop={shop} />}
  </>;
}

function Pending({ onResume }) {
  const [rows, setRows] = useState([]);
  const load = () => api('pending').then(setRows);
  useEffect(() => { load(); }, []);
  const list = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <>
    <p>Bills put on hold, or auto-saved after 3 minutes without saving.</p>
    <table style={{ width: '100%' }}><thead><tr><th>HELD AT</th><th>CUSTOMER</th><th>ITEMS</th><th className="num">TOTAL</th><th>HOW</th><th></th></tr></thead>
      <tbody>{list.length === 0 && <tr><td colSpan="6" className="empty">No pending entries.</td></tr>}
        {list.map((p) => <tr key={p.id}><td>{new Date(p.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{p.customer || 'Walk-in customer'}</td>
          <td>{p.items.slice(0, 2).map((x) => x.name).join(', ')}{p.items.length > 2 && ` +${p.items.length - 2} more`}</td><td className="num">{rs2(p.total)}</td>
          <td><span className={'tag ' + (p.auto ? 'Credit' : 'Update')}>{p.auto ? 'Auto-saved' : 'Held'}</span></td>
          <td><button className="pri" onClick={() => onResume(p)}>Resume</button> <button onClick={async () => { if (confirm('Delete this pending bill?')) { await api('pending/' + p.id, 'DELETE'); load(); } }}>Delete</button></td></tr>)}</tbody></table>
  </>;
}

function ChangePassword() {
  const [o, setO] = useState(''), [n, setN] = useState(''), [c, setC] = useState(''), [m, setM] = useState(null);
  const save = async () => {
    if (n !== c) return setM({ e: 'The new passwords do not match.' });
    const r = await api('auth/password', 'POST', { oldPassword: o, newPassword: n });
    if (r.error) setM({ e: r.error }); else { setM({ ok: 'Password changed.' }); setO(''); setN(''); setC(''); }
  };
  const f = (l, v, set) => <div><label>{l}</label><input type="password" value={v} onChange={(e) => set(e.target.value)} /></div>;
  return <div style={{ maxWidth: 360 }}>{f('Current password', o, setO)}<br />{f('New password', n, setN)}<br />{f('Confirm new password', c, setC)}<br />
    <button className="pri" disabled={!o || !n} onClick={save}>Change password</button>
    {m?.e && <p style={{ color: '#b91c1c' }}>{m.e}</p>}{m?.ok && <p className="ok">{m.ok}</p>}</div>;
}

const num = (v) => parseFloat(v) || 0;
const yn = (b) => (b ? 'Yes' : 'No');
const UNITS = ['pc', 'pcs', 'kg', 'g', 'ltr', 'ml', 'dozen', 'pack', 'box', 'plate'];
const PBLANK = { id: '', pid: '', code: '', barcode: '', name: '', unit: 'pc', costPrice: '', profitPct: '25', salePrice: '', discPct: '0', discPiece: '', company: '', category: '', supplier: '(baked here)', location: '', stock: '', minStock: '0', askQty: 'No', loose: 'No', expiry: 'No', inHouse: 'No', active: 'Yes' };
const toForm = (p) => {
  const s = num(p.salePrice), c = num(p.costPrice);
  return { ...PBLANK, id: p.id, pid: p.pid ?? '', code: p.code || '', barcode: p.barcode || '', name: p.name, unit: p.unit || 'pc', costPrice: String(c),
    profitPct: String(p.profitPct ?? (c ? (((s - c) / c) * 100).toFixed(2) : 25)), salePrice: String(s), discPct: String(p.discPct || 0), discPiece: ((s * num(p.discPct)) / 100).toFixed(2),
    company: p.company || '', category: p.category || '', supplier: p.supplier || '(baked here)', location: p.location || '', stock: String(p.stock ?? ''), minStock: String(p.minStock || 0),
    askQty: yn(p.askQty), loose: yn(p.loose), expiry: yn(p.expiry), inHouse: yn(p.inHouse), active: yn(p.active !== false) };
};
const fromForm = (f) => ({ code: f.code.trim(), barcode: f.barcode.trim(), name: f.name.trim(), unit: f.unit, costPrice: num(f.costPrice), profitPct: num(f.profitPct), salePrice: num(f.salePrice),
  discPct: num(f.discPct), company: f.company.trim(), category: f.category.trim(), supplier: f.supplier.trim(), location: f.location.trim(), stock: num(f.stock), minStock: num(f.minStock),
  askQty: f.askQty === 'Yes', loose: f.loose === 'Yes', expiry: f.expiry === 'Yes', inHouse: f.inHouse === 'Yes', active: f.active === 'Yes' });

function Products({ onClose }) {
  const [list, setList] = useState([]), [f, setF] = useState(PBLANK), [q, setQ] = useState(''), [cat, setCat] = useState(''), [comp, setComp] = useState(''), [st, setSt] = useState('Active'), [cur, setCur] = useState(0), [msg, setMsg] = useState('');
  const formRef = useRef();
  const load = () => api('products').then((a) => setList(Array.isArray(a) ? a : []));
  useEffect(() => { load(); }, []);
  const nextPid = Math.max(0, ...list.map((p) => p.pid || 0)) + 1;
  const uniq = (k) => [...new Set(list.map((p) => p[k]).filter(Boolean))].sort();
  const rows = list.filter((p) => (st === 'All' || (st === 'Active') === (p.active !== false)) && (!cat || p.category === cat) && (!comp || p.company === comp)
    && (p.name + ' ' + (p.code || '') + ' ' + (p.barcode || '')).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const shown = rows.slice(0, 500);

  const setCalc = (k, v) => {
    const g = { ...f, [k]: v }, c = num(g.costPrice);
    if (k === 'costPrice' || k === 'profitPct') g.salePrice = (c * (1 + num(g.profitPct) / 100)).toFixed(2);
    if (k === 'salePrice' && c) g.profitPct = (((num(v) - c) / c) * 100).toFixed(2);
    if (k === 'discPiece') g.discPct = num(g.salePrice) ? ((num(v) / num(g.salePrice)) * 100).toFixed(2) : '0';
    else if (['costPrice', 'profitPct', 'salePrice', 'discPct'].includes(k)) g.discPiece = ((num(g.salePrice) * num(g.discPct)) / 100).toFixed(2);
    setF(g);
  };
  const save = async () => {
    const body = fromForm(f);
    if (!body.name) return setMsg('Product name is required.');
    if (body.barcode && list.some((p) => p.barcode === body.barcode && p.id !== f.id)) return setMsg('Another product already uses this barcode.');
    if (f.id) { delete body.stock; await api('products/' + f.id, 'PUT', body); } else await api('products', 'POST', { ...body, pid: nextPid });
    setMsg(`Saved ${body.name}`); setF(PBLANK); load();
  };
  const del = async () => { if (confirm(`Delete ${f.name}?`)) { await api('products/' + f.id, 'DELETE'); setF(PBLANK); load(); } };
  useEffect(() => {
    const k = (e) => { const a = acts(e); if (a.includes('save') || a.includes('save2')) { e.preventDefault(); save(); } if (a.includes('clear')) { e.preventDefault(); setF(PBLANK); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  useEffect(() => { document.querySelector('tr.cur')?.scrollIntoView({ block: 'nearest' }); }, [cur]);
  const formKey = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    const els = [...formRef.current.querySelectorAll('input:not([readonly]),select')], i = els.indexOf(e.target);
    i >= 0 && i < els.length - 1 ? els[i + 1].focus() : save();
  };
  const listKey = (e) => {
    if (e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCur((c) => Math.min(shown.length - 1, c + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCur((c) => Math.max(0, c - 1)); }
    if (e.key === 'Enter' && shown[cur]) { e.preventDefault(); setF(toForm(shown[cur])); }
  };
  const csv = () => {
    const t = ['Code,ProductID,Barcode,Name,Unit,Company,Category,Cost,Sale,Stock', ...rows.map((p) => [p.code, p.pid, p.barcode, p.name, p.unit, p.company, p.category, p.costPrice, p.salePrice, p.stock].map((v) => `"${v ?? ''}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'products.csv'; a.click();
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const T = (k, l, cls = '') => <div><label>{l}</label><input className={cls} value={f[k]} onChange={set(k)} /></div>;
  const M = (k, l) => <div><label>{l}</label><div className="rsw"><span>Rs</span><input type="number" step="any" min="0" placeholder="0.00" value={f[k]} onChange={(e) => setCalc(k, e.target.value)} /></div></div>;
  const N = (k, l) => <div><label>{l}</label><input type="number" step="any" value={f[k]} onChange={(e) => setCalc(k, e.target.value)} /></div>;
  const S = (k, l, o) => <div><label>{l}</label><select value={f[k]} onChange={set(k)}>{o.map((x) => <option key={x}>{x}</option>)}</select></div>;
  const L = (k, l, id) => <div><label>{l}</label><input list={id} value={f[k]} placeholder="—" onChange={set(k)} /></div>;
  const YN = ['No', 'Yes'];
  return <div className="pw">
    <div className="pform" ref={formRef} onKeyDown={formKey}>
      <div className="pr r1">
        {T('code', 'Code/SKU', 'yel')}
        <div><label>Product ID</label><input readOnly value={f.id ? f.pid : nextPid} className="yel" /></div>
        {T('barcode', 'Barcode')}{T('name', 'Product Name')}{S('unit', 'Unit', UNITS)}{M('costPrice', 'Cost Price')}{N('profitPct', 'Profit %')}{M('salePrice', 'Sale Price')}{N('discPct', 'Disc %')}{M('discPiece', 'Disc/Piece')}
      </div>
      <div className="pr r2">
        {L('company', 'Company', 'dl-comp')}{L('category', 'Category', 'dl-cat')}{L('supplier', 'Supplier Account', 'dl-sup')}{T('location', 'Location')}
        <div><label>Stock</label><input type="number" step="any" readOnly={!!f.id} placeholder="—" value={f.stock} onChange={set('stock')} className={f.id ? 'ro' : ''} /></div>
        {N('minStock', 'Min Stock')}{S('askQty', 'Enter Qty on Bill', YN)}{S('loose', 'Loose Sale', YN)}{S('expiry', 'Expiry', YN)}{S('inHouse', 'In-house', YN)}{S('active', 'Active', ['Yes', 'No'])}
      </div>
      <datalist id="dl-comp">{uniq('company').map((x) => <option key={x} value={x} />)}</datalist><datalist id="dl-cat">{uniq('category').map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="dl-sup">{uniq('supplier').map((x) => <option key={x} value={x} />)}</datalist>
      <div className="pbar"><small>{f.id ? `Editing ${f.name}` : 'New product'} · Enter for the next field · F9 to save{f.id ? ' · stock changes through sales and purchases' : ''}</small>
        {msg && <b className="ok">{msg}</b>}<span className="grow" />
        {f.id && <button onClick={del}>Delete</button>}<button onClick={() => setF(PBLANK)}><Ico n="refresh" s={15} /> Reset <kbd>F4</kbd></button><button className="pri" onClick={save}>💾 Save <kbd>F9</kbd></button></div>
    </div>
    <div className="pfilters" onKeyDown={listKey}>
      <input style={{ maxWidth: 300 }} placeholder="Find: name, item code or barcode" value={q} onChange={(e) => { setQ(e.target.value); setCur(0); }} />
      <select style={{ width: 190 }} value={cat} onChange={(e) => { setCat(e.target.value); setCur(0); }}><option value="">All categories</option>{uniq('category').map((x) => <option key={x}>{x}</option>)}</select>
      <select style={{ width: 190 }} value={comp} onChange={(e) => { setComp(e.target.value); setCur(0); }}><option value="">All companies</option>{uniq('company').map((x) => <option key={x}>{x}</option>)}</select>
      {['Active', 'Inactive', 'All'].map((k) => <button key={k} className={st === k ? 'chip on' : 'chip'} onClick={() => { setSt(k); setCur(0); }}>{k}</button>)}
      <small>{rows.length} items{rows.length > 500 ? ' (first 500 shown)' : ''} · ↑↓ and Enter to load one into the form</small>
    </div>
    <div className="plist" tabIndex={0} onKeyDown={listKey}>
      <table><thead><tr><th>ITEM CODE</th><th>PRODUCT DESCRIPTION</th><th className="num">STOCK</th><th>COMPANY</th><th>CATEGORY</th><th className="num">SALE PRICE</th><th className="num">COST PRICE</th><th>SUPPLIER</th></tr></thead>
        <tbody>{shown.length === 0 && <tr><td colSpan="8" className="empty">No products found.</td></tr>}
          {shown.map((p, i) => <tr key={p.id} className={i === cur ? 'cur' : ''} onClick={() => setCur(i)} onDoubleClick={() => setF(toForm(p))}>
            <td>{p.code}</td><td><b>{p.name}</b> {p.loose && <span className="badge">Loose</span>}</td>
            <td className={'stk' + (p.stock < 0 ? ' neg' : '')}>{Number(p.stock || 0).toLocaleString(undefined, { maximumFractionDigits: 3 })} <small>{p.unit}</small></td>
            <td>{p.company}</td><td>{p.category}</td><td className="num"><b>{rs2(p.salePrice)}</b></td><td className="num">{rs2(p.costPrice)}</td><td>{p.supplier && p.supplier !== '(baked here)' ? p.supplier : ''}</td></tr>)}</tbody></table>
    </div>
    <div className="btns"><button onClick={() => { setQ(''); setCat(''); setComp(''); setSt('All'); }}>All Products</button><button onClick={csv}><Ico n="down" s={15} /> CSV</button><button onClick={onClose}>Close</button></div>
  </div>;
}

function Audit() {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [days, setDays] = useState(7);
  useEffect(() => { api('audit').then(setRows); }, []);
  const R = { Today: 0, '7 days': 6, '30 days': 29, All: null };
  const t0 = new Date().setHours(0, 0, 0, 0);
  const shown = rows.filter((r) => (days === null || new Date(r.createdAt) >= t0 - days * 864e5) && (r.summary + r.who).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const csv = () => {
    const t = ['When,Who,Action,Record,Summary', ...shown.map((r) => [r.createdAt, r.who, r.action, r.record, r.summary].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'audit-log.csv'; a.click();
  };
  return <>
    <p>Every sale, edit, price change, void, approval and backup, traceable to a person and a time</p>
    <div className="filters">
      {Object.entries(R).map(([k, v]) => <button key={k} className={v === days ? 'chip on' : 'chip'} onClick={() => setDays(v)}>{k}</button>)}
      <input placeholder="Search summaries" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} />
      <span className="grow" /><button className="chip" onClick={csv}><Ico n="down" s={15} /> CSV</button></div>
    <table><thead><tr><th>WHEN</th><th>WHO</th><th>ACTION</th><th>RECORD</th><th>SUMMARY</th></tr></thead>
      <tbody>{shown.length === 0 && <tr><td colSpan="5">Nothing logged in this range.</td></tr>}
        {shown.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{r.who}</td>
          <td><span className={'tag ' + r.action}>{r.action}</span></td><td>{r.record}</td><td>{r.summary}</td></tr>)}</tbody></table>
  </>;
}

const PREF_KEY = 'falcon-prefs';
const COLOURS = { Green: '#2e7d32', Blue: '#2347b0', Purple: '#7c4dcc', Pink: '#c2417a', Orange: '#b4501c', Teal: '#0f8b8d' };
const DEF_PREFS = { theme: 'Light', colour: '', size: 90, width: 75, lang: 'English', keepTabs: true };
const getPrefs = () => { try { return { ...DEF_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch { return DEF_PREFS; } };
const savePrefs = (p) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch {} window.dispatchEvent(new Event('falcon-prefs')); };
const ROLES = ['Owner / Admin', 'Accountant', 'Cashier / Counter'];
const SET_NAV = [['shop', 'Shop profile', 'store'], ['staff', 'Staff & roles', 'users'], ['look', 'Look & language', 'palette'], ['printer', 'Printer & limits', 'print'], ['keys', 'Keyboard shortcuts', 'kbd']];
const SET_MORE = [['Bill Template', 'Bill template', 'receipt'], ['Backup Data', 'Backup', 'db'], ['Audit Log', 'Audit log', 'shield'], ['Updates', 'Updates', 'cloud']];

function Seg({ value, opts, onChange }) {
  return <div className="seg">{opts.map(([v, l]) => <button key={v} className={String(v) === String(value) ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
function Panel({ title, sub, children, foot, action }) {
  return <div className="spanel"><div className="sph"><div><b>{title}</b>{sub && <small>{sub}</small>}</div>{action}</div><div className="spb">{children}</div>{foot}</div>;
}
function SaveBar({ dirty, onSave, onDiscard, saved }) {
  return <div className="spf">{saved && !dirty && <span className="ok">Saved ✓</span>}<span className="grow" /><button disabled={!dirty} onClick={onDiscard}>Discard</button><button className="pri" disabled={!dirty} onClick={onSave}>Save</button></div>;
}

function Settings({ section = 'shop', go }) {
  const [sec, setSec] = useState(section), [orig, setOrig] = useState(null), [s, setS] = useState(null), [users, setUsers] = useState([]), [me, setMe] = useState({}), [saved, setSaved] = useState(false), [edit, setEdit] = useState(null), [err, setErr] = useState(''), [prefs, setPrefs] = useState(DEF_PREFS);
  const loadUsers = () => api('users').then((u) => Array.isArray(u) && setUsers(u));
  useEffect(() => { api('settings').then((a) => { const x = { returnLimit: 1000, expiryDays: 3, paper: '80', gst: 0, autoPrint: false, openingCash: 0, ...(a.find((y) => y.id === 'shop') || { id: 'shop' }) }; setOrig(x); setS(x); }); loadUsers(); api('auth/me').then(setMe); setPrefs(getPrefs()); }, []);
  if (!s) return null;
  const isAdmin = /admin/i.test(me.role || '');
  const dirty = JSON.stringify(s) !== JSON.stringify(orig);
  const save = async () => { const r = await api('settings/shop', 'PUT', s); if (r.error) return alert(r.error === 'Not allowed.' ? 'Only an Admin can change settings.' : r.error); setOrig(s); setSaved(true); };
  const discard = () => { setS(orig); setSaved(false); };
  const set = (k, v) => { setS({ ...s, [k]: v }); setSaved(false); };
  const setPref = (k, v) => { const p = { ...prefs, [k]: v }; setPrefs(p); savePrefs(p); };
  const txt = (k, l, ph) => <div><label>{l}</label><input value={s[k] || ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} /></div>;
  const num = (k, l, unit, pre, hint) => <div><label>{l}</label><div className="unit">{pre && <span>{pre}</span>}<input type="number" min="0" value={s[k] ?? ''} onChange={(e) => set(k, e.target.value === '' ? '' : +e.target.value)} />{unit && <span>{unit}</span>}</div>{hint && <small>{hint}</small>}</div>;
  const logo = (f) => {
    if (!f) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / im.width), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); set('logo', c.toDataURL('image/png')); }; im.src = r.result; };
    r.readAsDataURL(f);
  };
  const saveStaff = async () => {
    const e = edit; setErr('');
    const r = await api(e.id ? 'staff/' + e.id : 'staff', e.id ? 'PUT' : 'POST', e);
    if (r.error) return setErr(r.error);
    setEdit(null); loadUsers();
  };
  const lim = (v) => (v === undefined || v === '' || v === null ? 'No limit' : rs(v));
  const shop = s;
  let body;
  if (sec === 'shop') body = <Panel title="Shop profile" sub="Printed on receipts and reports" foot={<SaveBar dirty={dirty} saved={saved} onSave={save} onDiscard={discard} />}>
    <div className="sgrid"><div className="full">{txt('name', 'Shop name')}</div><div className="full">{txt('address', 'Address')}</div>{txt('phone', 'Phone')}
      <div><label>Currency</label><input value="PKR (Rs)" disabled /><small>PKR only in v1</small></div>
      {num('openingCash', 'Opening cash in hand', '', 'Rs', 'Cash in the drawer before Falcon was started. The Cash Book begins from this.')}
      <div className="full"><label>Receipt footer text</label><textarea rows="3" value={s.footer || ''} onChange={(e) => set('footer', e.target.value)} /></div>
      <div className="full logo">{s.logo ? <img src={s.logo} alt="logo" /> : <div className="nologo">No logo</div>}
        <label className="btnlike"><Ico n="up" s={15} /> Upload logo<input type="file" accept="image/*" hidden onChange={(e) => logo(e.target.files[0])} /></label>
        <button onClick={() => set('logo', '')} disabled={!s.logo}>Remove</button></div></div></Panel>;
  else if (sec === 'staff') body = <Panel title="Staff & roles" sub="Only an Admin can add people. There is no self sign-up." action={isAdmin && <button className="pri" onClick={() => { setErr(''); setEdit({ name: '', username: '', role: 'Cashier / Counter', password: '', dailyDiscountLimit: '', creditLimit: '', active: true }); }}><Ico n="user" s={15} /> Add staff</button>}>
    <table style={{ width: '100%' }}><thead><tr><th>NAME</th><th>ROLE</th><th className="num">DAILY DISCOUNT LIMIT</th><th className="num">CREDIT SALE LIMIT</th><th>STATUS</th></tr></thead>
      <tbody>{users.map((u) => <tr key={u.id} style={{ cursor: isAdmin ? 'pointer' : 'default' }} onClick={() => isAdmin && (setErr(''), setEdit({ ...u, password: '' }))}>
        <td>{u.name} {u.id === me.uid && <span className="tag Update">you</span>}<br /><small>@{u.username}</small></td><td>{u.role}</td><td className="num">{lim(u.dailyDiscountLimit)}</td><td className="num">{lim(u.creditLimit)}</td>
        <td><span className={'tag ' + (u.active !== false ? 'Create' : 'Delete')}>{u.active !== false ? 'Active' : 'Off'}</span></td></tr>)}</tbody></table>
    {isAdmin && <small style={{ display: 'block', padding: 10 }}>Click a person to edit their role, limits, PIN or switch them off.</small>}</Panel>;
  else if (sec === 'look') body = <Panel title="Look & language" sub="Applies to this till">
    <div className="sgrid"><div className="full"><label>Theme</label><Seg value={prefs.theme} onChange={(v) => setPref('theme', v)} opts={[['Light', 'Light'], ['Dark', 'Dark'], ['Match', 'Match Windows']]} /></div>
      <div className="full"><label>Colour</label><div className="swatches">{Object.entries(COLOURS).map(([n, c]) => <button key={n} className={prefs.colour === n ? 'on' : ''} onClick={() => setPref('colour', prefs.colour === n ? '' : n)}><i style={{ background: c }}>{prefs.colour === n ? '✓' : ''}</i>{n}</button>)}</div><small>Buttons, highlights and charts. Click the chosen colour again to go back to per-tab colours.</small></div>
      <div className="full"><label>Sales Invoice size</label><Seg value={prefs.size} onChange={(v) => setPref('size', +v)} opts={[[70, '70%'], [80, '80%'], [90, '90%'], [100, '100% (normal)'], [110, '110%'], [125, '125%']]} /><small>This PC only. Smaller fits more items on the bill.</small></div>
      <div className="full"><label>Sales Invoice width</label><Seg value={prefs.width} onChange={(v) => setPref('width', +v)} opts={[[50, '50%'], [75, '75%'], [100, '100% (full)']]} /><small>This PC only. How much of the window the Sales Invoice takes.</small></div>
      <div className="full"><label>Language · زبان</label><Seg value={prefs.lang} onChange={(v) => setPref('lang', v)} opts={[['English', 'English'], ['Urdu', 'اردو']]} /><small>Receipts print in the same language.</small></div>
      <div className="full toggle"><div><b>Keep invoice tabs active</b><br /><small>Remember every open Sales Invoice and Sales Return tab, with all its items, when you open another screen and come back.</small></div><button type="button" role="switch" aria-checked={!!prefs.keepTabs} className={'sw' + (prefs.keepTabs ? ' on' : '')} onClick={() => setPref('keepTabs', !prefs.keepTabs)}><i /></button></div></div></Panel>;
  else if (sec === 'printer') body = <Panel title="Printer, counter & safety" foot={<SaveBar dirty={dirty} saved={saved} onSave={save} onDiscard={discard} />}>
    <div className="sgrid">{num('returnLimit', 'Returns needing approval above', '', 'Rs', 'Cashier returns above this need an Admin or Accountant PIN')}{num('expiryDays', 'Expiry warning window', 'days', '', 'Show items expiring within this many days')}
      <div><label>Receipt paper width</label><Seg value={s.paper || '80'} onChange={(v) => set('paper', v)} opts={[['80', '80 mm'], ['58', '58 mm']]} /></div>{num('gst', 'GST on purchases', '%', '', 'Shown as "Price + GST" on the Purchase screen (0 = none)')}
      <div className="full toggle"><div><b>Print a receipt for every sale</b><br /><small>Otherwise use Save & Print (F10)</small></div><button className={'sw' + (s.autoPrint ? ' on' : '')} onClick={() => set('autoPrint', !s.autoPrint)}><i /></button></div></div></Panel>;
  else if (sec === 'keys') body = <KeysPanel uid={me.uid} />;
  return <div className="settings">
    <p className="ssub">Shop setup, staff, tills, printing and safety</p>
    <div className="slayout"><nav className="snav">{SET_NAV.map(([k, l, i]) => <button key={k} className={sec === k ? 'on' : ''} onClick={() => setSec(k)}><Ico n={i} s={17} />{l}</button>)}
      <div className="sgh">MORE</div>{SET_MORE.map(([screen, l, i]) => <button key={screen} onClick={() => go && go(screen)}><Ico n={i} s={17} />{l}<em><Ico n="chevr" s={14} /></em></button>)}</nav>
      <div className="smain">{body}</div>
      {sec === 'shop' && <div className="spanel prev"><div className="sph"><b>Receipt preview</b></div><div className="spb"><div className="receipt" style={{ position: 'static', margin: '0 auto' }}>
        {shop.logo && <div className="rc"><img src={shop.logo} alt="" style={{ maxWidth: '90%' }} /></div>}<div className="rc big">{shop.name}</div><div className="rc sm">{shop.address}<br />{shop.phone}</div><hr />
        <div className="rl sm"><span>Invoice · Cash</span></div><div className="rl sm"><span>#{shop.till || 'T11'}-00001</span><span>{new Date().toLocaleDateString('en-GB')}</span></div><hr />
        <div className="rl sm"><span>SAMPLE ITEM</span><span>1 · 280 · 280</span></div><hr /><div className="rl big"><span>Net Amount</span><span>Rs 280</span></div><hr /><div className="rc sm">{shop.footer}</div></div></div></div>}
    </div>
    {edit && <div className="modal" onClick={() => setEdit(null)}><div className="mbox" onClick={(e) => e.stopPropagation()}>
      <b style={{ fontSize: 16 }}>{edit.id ? 'Edit staff' : 'Add staff'}</b>
      <div className="sgrid"><div className="full"><label>Name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
        <div><label>Username</label><input value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value.toLowerCase() })} /></div>
        <div><label>Role</label><select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="full"><label>{edit.id ? 'New PIN / password (leave blank to keep)' : 'PIN / password'}</label><input type="password" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} /></div>
        <div><label>Daily discount limit (Rs)</label><input type="number" min="0" placeholder="No limit" value={edit.dailyDiscountLimit ?? ''} onChange={(e) => setEdit({ ...edit, dailyDiscountLimit: e.target.value })} /></div>
        <div><label>Credit sale limit (Rs)</label><input type="number" min="0" placeholder="No limit" value={edit.creditLimit ?? ''} onChange={(e) => setEdit({ ...edit, creditLimit: e.target.value })} /></div>
        {edit.id && <label className="full"><input type="checkbox" style={{ width: 'auto' }} checked={edit.active !== false} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>}</div>
      {err && <span style={{ color: '#b91c1c' }}>{err}</span>}
      <div className="btns" style={{ justifyContent: 'flex-end' }}><button onClick={() => setEdit(null)}>Cancel</button><button className="pri" onClick={saveStaff}>Save</button></div></div></div>}
  </div>;
}
const SettingsAt = (sec) => function SettingsSection(p) { return <Settings {...p} section={sec} />; };

function KeysPanel({ uid }) {
  const [keys, setKeys] = useState({ ...KEYS }), [cap, setCap] = useState(null), [err, setErr] = useState('');
  useEffect(() => {
    if (!cap) return;
    const k = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape') { setCap(null); setErr(''); return; }
      const c = combo(e); if (!c) return;
      if (FIXED.includes(e.key)) return setErr(`${e.key} keeps its job and can't be used.`);
      if (!/^F\d+$/.test(e.key) && !e.ctrlKey && !e.altKey) return setErr('Use an F-key, or hold Ctrl or Alt with a letter, so typing keeps working.');
      if (['Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+A', 'Ctrl+W', 'Ctrl+T', 'Ctrl+R'].includes(c)) return setErr(`${c} is used by the system.`);
      const x = clash(cap, c, keys); if (x) return setErr(`${c} is already used by "${x[1]}" where both work. Pick another key.`);
      const n = { ...keys, [cap]: c }; setKeys(n); saveKeys(uid, n); setCap(null); setErr('');
    };
    window.addEventListener('keydown', k, true); return () => window.removeEventListener('keydown', k, true);
  }, [cap, keys]);
  const groups = [...new Set(ACTIONS.map((a) => a[2]))];
  const resetAll = () => { setKeys({ ...DEFKEYS }); saveKeys(uid, { ...DEFKEYS }); setCap(null); setErr(''); };
  return <Panel title="Keyboard shortcuts" sub="Your own keys. Other users keep theirs." action={<button onClick={resetAll}><Ico n="refresh" s={15} /> Reset all</button>}>
    <p style={{ margin: '0 0 8px' }}>Click a key, then press the new key or combination (Esc cancels). One action keeps the same key on every screen, and two actions can't share a key where both work. Enter, Esc, Tab, the arrows and Delete keep their jobs.</p>
    {err && <p className="rerr" role="alert">{err}</p>}
    {groups.map((g) => <div key={g}><div className="sgh">{g.toUpperCase()}</div><table style={{ width: '100%' }}><thead><tr><th>ACTION</th><th>WORKS ON</th><th style={{ width: 200 }}>KEY</th></tr></thead>
      <tbody>{ACTIONS.filter((a) => a[2] === g).map((a) => <tr key={a[0]}><td>{a[1]}</td><td><small>{a[4]}</small></td>
        <td><kbd className={'keybtn' + (cap === a[0] ? ' cap' : '')} role="button" tabIndex="0" onClick={() => { setCap(a[0]); setErr(''); }}>{cap === a[0] ? 'Press a key…' : keys[a[0]]}</kbd>
          {keys[a[0]] !== DEFKEYS[a[0]] && <button title="Back to default" style={{ marginLeft: 6 }} onClick={() => { const n = { ...keys, [a[0]]: DEFKEYS[a[0]] }; setKeys(n); saveKeys(uid, n); }}>{<Ico n="refresh" s={14} />}</button>}</td></tr>)}</tbody></table></div>)}
  </Panel>;
}

// ---------- Bill Template ----------
function BillTemplate({ go }) {
  const [shop, setShop] = useState(null), [tpl, setTpl] = useState(null), [orig, setOrig] = useState(null), [cur, setCur] = useState(0), [msg, setMsg] = useState('');
  useEffect(() => { api('settings').then((a) => { const s = a.find((x) => x.id === 'shop') || {}; setShop(s); const t = JSON.parse(JSON.stringify(tplOf(s))); setTpl(t); setOrig(JSON.stringify(t)); }); }, []);
  const dirty = tpl && JSON.stringify(tpl) !== orig;
  const upd = (patch) => setTpl({ ...tpl, blocks: tpl.blocks.map((b, i) => (i === cur ? { ...b, ...patch } : b)) });
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= tpl.blocks.length) return; const bl = [...tpl.blocks];[bl[i], bl[j]] = [bl[j], bl[i]]; setTpl({ ...tpl, blocks: bl }); if (cur === i) setCur(j); else if (cur === j) setCur(i); };
  const add = (type) => { const bl = [...tpl.blocks]; bl.splice(cur + 1, 0, { id: type[0] + Date.now(), type, show: true, align: 'center', text: type === 'text' ? 'Your text' : undefined }); setTpl({ ...tpl, blocks: bl }); setCur(cur + 1); };
  const del = (i) => { setTpl({ ...tpl, blocks: tpl.blocks.filter((_, j) => j !== i) }); setCur(Math.max(0, i - 1)); };
  const save = async () => { if (!dirty) return; const r = await api('settings/shop', 'PUT', { ...shop, billTemplate: tpl }); if (r.error) return setMsg(r.error === 'Not allowed.' ? 'Only an Admin can change the bill template.' : r.error); setShop({ ...shop, billTemplate: tpl }); setOrig(JSON.stringify(tpl)); setMsg('Saved ✓'); };
  const saveRef = useRef(); saveRef.current = save;
  useEffect(() => { const k = (e) => { const a = acts(e); if (a.includes('save') || a.includes('save2')) { e.preventDefault(); saveRef.current(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  if (!tpl) return null;
  const b = tpl.blocks[cur] || tpl.blocks[0], sample = { billNo: 'T3-00001', type: 'CASH', date: '14 Oct 2026 06:25', cashier: 'Ali Raza', customer: 'Walk-in customer', items: [{ name: '077)FRUIT CAKE', qty: 1, rate: 280, disc: 0 }], subtotal: 280, discount: 0, total: 280, paid: 280, change: 0 };
  const aligns = ['logo', 'name', 'address', 'phone', 'title', 'footer', 'text'];
  const onKey = (e) => { if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); move(cur, -1); } else if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); move(cur, 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); setCur(Math.max(0, cur - 1)); } else if (e.key === 'ArrowDown') { e.preventDefault(); setCur(Math.min(tpl.blocks.length - 1, cur + 1)); } else if (e.key === ' ' && !b.locked) { e.preventDefault(); upd({ show: b.show === false }); } };
  return <div>
    <p className="ssub">Choose a block, then change its wording and style. <kbd className="mini">↑↓</kbd> choose · <kbd className="mini">Alt+↑↓</kbd> move · <kbd className="mini">Space</kbd> show/hide · <kbd className="mini">F9</kbd> save. Applies to sales bills; return slips keep the standard layout.</p>
    <div className="btgrid">
      <div className="spanel"><div className="sph"><b>BILL BLOCKS (TOP TO BOTTOM)</b></div>
        <div className="btlist" tabIndex="0" onKeyDown={onKey}>{tpl.blocks.map((x, i) => <div key={x.id} className={'btrow' + (i === cur ? ' on' : '')} onClick={() => setCur(i)}>
          <input type="checkbox" style={{ width: 'auto' }} checked={x.show !== false} disabled={x.locked} onChange={(e) => setTpl({ ...tpl, blocks: tpl.blocks.map((y, j) => (j === i ? { ...y, show: e.target.checked } : y)) })} />
          <span className="grow">{BT_NAMES[x.type]}</span><button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={i === 0}>↑</button><button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={i === tpl.blocks.length - 1}>↓</button>
          {(x.type === 'divider' || x.type === 'text') ? <button title="Delete" onClick={(e) => { e.stopPropagation(); del(i); }}>{<Ico n="trash" s={15} />}</button> : <span style={{ width: 28 }} />}</div>)}</div>
        <div className="spf"><button onClick={() => add('text')}><Ico n="plus" s={15} /> Text line</button><button onClick={() => add('divider')}>— Divider</button><small className="grow" style={{ textAlign: 'right' }}>Adds below the chosen block</small></div></div>
      <div className="spanel"><div className="sph"><div><b>{BT_NAMES[b.type]}</b><small>{{ logo: 'The shop logo from Settings, when one is uploaded.', name: 'Shop name from Settings.', address: 'Address from Settings.', phone: 'Phone from Settings.', divider: 'A separator line.', title: 'Use {mode} to print Cash or Credit.', billno: 'Always printed.', cashier: 'Who made the bill.', customer: 'Who the bill is for.', items: 'Always printed.', totals: 'Always printed.', cash: 'Cash received and change.', footer: 'Leave blank to use the footer from Settings.', text: 'Your own line of text.' }[b.type]}</small></div></div>
        <div className="spb sgrid">
          {b.type === 'logo' && <div className="full"><label>Logo size · {b.size || 80}% of the bill's width</label><input type="range" min="20" max="100" value={b.size || 80} onChange={(e) => upd({ size: +e.target.value })} style={{ padding: 0 }} /></div>}
          {aligns.includes(b.type) && <div className="full"><label>Alignment</label><Seg value={b.align || 'center'} onChange={(v) => upd({ align: v })} opts={[['left', 'Left'], ['center', 'Centre'], ['right', 'Right']]} /></div>}
          {['title', 'cashier', 'customer', 'cash', 'footer', 'text'].includes(b.type) && <div className="full"><label>{b.type === 'cash' ? 'Wording: cash received' : 'Wording'}</label><input value={b.text || ''} placeholder={b.type === 'footer' ? 'Uses the Settings footer' : ''} onChange={(e) => upd({ text: e.target.value })} /></div>}
          {b.type === 'cash' && <div className="full"><label>Wording: change</label><input value={b.text2 || ''} onChange={(e) => upd({ text2: e.target.value })} /></div>}
          {['name', 'footer', 'text'].includes(b.type) && <label className="full"><input type="checkbox" style={{ width: 'auto' }} checked={!!b.big} onChange={(e) => upd({ big: e.target.checked })} /> Larger text</label>}
          {!b.locked && <label className="full"><input type="checkbox" style={{ width: 'auto' }} checked={b.show !== false} onChange={(e) => upd({ show: e.target.checked })} /> Print this block</label>}</div>
        <div className="spf"><small>Paper width ({shop.paper === '58' ? '58' : '80'} mm), logo, shop details and the standard footer are set in TOOLS → Settings.</small></div></div>
      <div className="spanel"><div className="sph"><b>PREVIEW</b><span className="grow" /><span className="seg"><button className={tpl.lines === 'dotted' ? 'on' : ''} onClick={() => setTpl({ ...tpl, lines: 'dotted' })}>Dotted</button><button className={tpl.lines !== 'dotted' ? 'on' : ''} onClick={() => setTpl({ ...tpl, lines: 'solid' })}>Solid</button></span></div>
        <div className="spb" style={{ background: '#f2f4f8' }}><div className="receipt" style={{ ...paperVars(shop), position: 'static', margin: '0 auto' }}><BillBody pr={sample} shop={shop} tpl={tpl} /></div></div></div>
    </div>
    <div className="btns" style={{ justifyContent: 'flex-end', marginTop: 10 }}><span className="ok grow">{msg}</span>
      <button onClick={() => { const t = JSON.parse(JSON.stringify(BT_DEFAULT)); setTpl(t); setCur(0); setMsg(''); }}><Ico n="refresh" s={15} /> Restore default</button><button disabled={!dirty} onClick={() => { setTpl(JSON.parse(orig)); setMsg(''); }}>Reset</button>
      <button className="pri" disabled={!dirty} onClick={save}>Save F9</button><button onClick={() => go('Sales Invoice')}>Close</button></div>
  </div>;
}

// ---------- Backup ----------
function Backup() {
  const [info, setInfo] = useState(null), [msg, setMsg] = useState(null), [file, setFile] = useState(null), [word, setWord] = useState('');
  const load = () => api('backup?info=1').then(setInfo);
  useEffect(() => { load(); }, []);
  if (!info) return null;
  if (info.error) return <p className="rerr">{info.error}</p>;
  const restore = async () => {
    let j; try { j = JSON.parse(await file.text()); } catch { return setMsg({ e: 'That file could not be read.' }); }
    const r = await api('backup', 'POST', j);
    if (r.error) return setMsg({ e: r.error });
    setMsg({ ok: 'Restored. Reloading…' }); setTimeout(() => (window.location.href = '/'), 1200);
  };
  return <div style={{ maxWidth: 900, margin: '0 auto' }}>
    <div className="spanel"><div className="sph"><div><b>Back up your data</b><small>One file with products, bills, returns, purchases, staff and settings. Keep copies off this PC (USB or email).</small></div>
      <a className="btnlike" style={{ marginLeft: 'auto' }} href="/api/backup" onClick={() => setTimeout(load, 800)}><Ico n="down" s={15} /> Download backup</a></div>
      <div className="spb"><table style={{ width: '100%' }}><thead><tr><th>WHAT</th><th className="num">RECORDS</th></tr></thead>
        <tbody>{Object.entries(info.counts).map(([k, v]) => <tr key={k}><td style={{ textTransform: 'capitalize' }}>{k}</td><td className="num">{v}</td></tr>)}</tbody></table><small>Storage: {info.mode === 'mongo' ? 'MongoDB' : 'JSON file (data/db.json)'}</small></div></div>
    <div className="spanel" style={{ marginTop: 14 }}><div className="sph"><div><b>Restore from a backup</b><small>Replaces everything on this PC with the file's contents. A copy of the current data is kept first (JSON mode).</small></div></div>
      <div className="spb" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="file" accept=".json,application/json" onChange={(e) => { setFile(e.target.files[0] || null); setMsg(null); }} />
        <div><label>Type RESTORE to confirm</label><input value={word} onChange={(e) => setWord(e.target.value)} style={{ maxWidth: 240 }} /></div>
        <div><button className="pri" disabled={!file || word !== 'RESTORE'} onClick={restore}>Restore data</button></div>
        {msg && <p className={msg.e ? 'rerr' : 'ok'}>{msg.e || msg.ok}</p>}</div></div></div>;
}

// ---------- Updates & Support ----------
function Updates() {
  const [i, setI] = useState(null), [url, setUrl] = useState(''), [me, setMe] = useState({}), [res, setRes] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { api('update').then((a) => { setI(a); setUrl(a.updateUrl || ''); }); api('auth/me').then(setMe); }, []);
  if (!i) return null;
  const admin = /admin/i.test(me.role || '');
  const check = async () => {
    setBusy(true); setRes(null);
    if (admin && url !== i.updateUrl) { const s = (await api('settings')).find((x) => x.id === 'shop') || { id: 'shop' }; await api('settings/shop', 'PUT', { ...s, updateUrl: url.trim() }); setI({ ...i, updateUrl: url.trim() }); }
    setRes(await api('update', 'POST')); setBusy(false);
  };
  return <div style={{ maxWidth: 900, margin: '0 auto' }}><div className="spanel"><div className="sph"><div><b>Falcon Next</b><small>Installed on this PC</small></div></div>
    <div className="spb"><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div><small style={{ fontWeight: 700, letterSpacing: 1 }}>CURRENT VERSION</small><div className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{i.version}</div>
      <small>{!res ? 'Not checked yet' : res.error ? '' : res.newer ? `Version ${res.latest} is available` : 'You have the latest version ✓'}</small></div><span className="grow" /><button className="pri" disabled={busy} onClick={check}><Ico n="refresh" s={15} /> {busy ? 'Checking…' : 'Check for updates'}</button></div>
      {res?.error && <p className="rerr">{res.error}</p>}
      {res?.newer && <p>{res.notes && <>{res.notes}<br /></>}{res.url && <a href={res.url} target="_blank" rel="noreferrer">Download version {res.latest}</a>}</p>}
      <div style={{ marginTop: 14 }}><label>Update file address {admin ? '' : '(only an Admin can change it)'}</label><input value={url} disabled={!admin} placeholder="https://example.com/falcon/latest.json" onChange={(e) => setUrl(e.target.value)} />
        <small>A small file you host, like {'{ "version": "0.1.8", "notes": "What changed", "url": "https://…/falcon-0.1.8.zip" }'}. Falcon compares its version with it.</small></div></div></div></div>;
}
function Support() {
  const [i, setI] = useState(null), [ok, setOk] = useState(false);
  useEffect(() => { api('update').then(setI); }, []);
  const diag = i ? `Falcon Next ${i.version} · till ${i.till} · ${i.mode === 'mongo' ? 'MongoDB' : 'JSON'} · Node ${i.node}\nProducts ${i.counts.products}, sales ${i.counts.sales}, returns ${i.counts.returns}, purchases ${i.counts.purchases}, staff ${i.counts.users}\n${navigator.userAgent}` : '';
  return <div style={{ maxWidth: 700, margin: '0 auto' }}><div className="spanel"><div className="sph"><div><b>Software support</b><small>Call or message for help</small></div></div>
    <div className="spb" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 18 }}><b>Abdul Rahman</b></div>
      <div><a className="btnlike" href="tel:03296195286"><Ico n="headset" s={15} /> 0329-6195286</a> <a className="btnlike" href="https://wa.me/923296195286" target="_blank" rel="noreferrer"><Ico n="headset" s={15} /> WhatsApp</a></div>
      <small>When you call, tell them what you pressed and what the screen said. This box helps them:</small>
      <textarea readOnly rows="4" value={diag} /><div><button onClick={() => { navigator.clipboard?.writeText(diag); setOk(true); }}><Ico n="copy" s={15} /> Copy details</button> {ok && <span className="ok">Copied ✓</span>}</div></div></div></div>;
}

// ---------- Purchase ----------
function PurchaseReceipt({ pr, shop }) {
  return <div className="receipt" style={paperVars(shop)}>
    {shop.logo && <div className="rc"><img src={shop.logo} alt="" style={{ width: '70%' }} /></div>}
    <div className="rc big">{shop.name}</div><hr />
    <div className="rc sm">Purchase · {pr.type === 'CASH' ? 'Cash' : 'Credit'}</div>
    <div className="rl sm"><span>#{pr.purchaseNo}</span><span>{pr.date}</span></div>
    <div className="rl sm"><span>Supplier</span><span>{pr.supplier}</span></div>
    {pr.invoiceNo && <div className="rl sm"><span>Their bill</span><span>{pr.invoiceNo}</span></div>}<hr />
    <div className="rl sm b"><span>DESCRIPTION</span><span>QTY+FOC · PRICE · VALUE</span></div>
    {pr.items.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty}{x.foc ? `+${x.foc}` : ''} · {x.price} · {Math.round(x.value)}</span></div>)}<hr />
    <div className="rl b"><span>Total Bill</span><span>{Math.round(pr.subtotal)}</span></div>
    {(pr.discount1 + pr.discount2) > 0 && <div className="rl sm"><span>Discount</span><span>{Math.round(pr.discount1 + pr.discount2)}</span></div>}
    {pr.gst > 0 && <div className="rl sm"><span>GST {pr.gstPct}%</span><span>{Math.round(pr.gst)}</span></div>}
    {pr.expenses > 0 && <div className="rl sm"><span>Expenses</span><span>{Math.round(pr.expenses)}</span></div>}
    <div className="rl big"><span>Payable</span><span>Rs {Math.round(pr.total)}</span></div><hr /><div className="rc sm">Stock received · {pr.user}</div>
  </div>;
}

function PurchaseInvoice({ onClose }) {
  const [prods, setProds] = useState([]), [shop, setShop] = useState({}), [past, setPast] = useState([]), [vch, setVch] = useState([]);
  const [type, setType] = useState('CREDIT'), [supplier, setSupplier] = useState(''), [inv, setInv] = useState(''), [remarks, setRemarks] = useState(''), [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState([]), [row, setRow] = useState(-1), [editAt, setEditAt] = useState(null), [d1, setD1] = useState(''), [d2, setD2] = useState(''), [exp, setExp] = useState('');
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [foc, setFoc] = useState(0), [price, setPrice] = useState(0), [disc, setDisc] = useState(0), [sale, setSale] = useState(0), [hi, setHi] = useState(0);
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [msg, setMsg] = useState(null), [pr, setPr] = useState(null), [busy, setBusy] = useState(false);
  const codeRef = useRef(), qtyRef = useRef(), supRef = useRef(), listRef = useRef();
  const arr = (r) => (Array.isArray(r) ? r : []);
  const load = () => { api('vouchers').then((r) => setVch(arr(r))); api('products').then((r) => setProds(arr(r).filter((p) => p.active !== false))); api('purchases').then((r) => setPast(arr(r))); api('settings').then((a) => setShop(arr(a).find((x) => x.id === 'shop') || {})); };
  useEffect(() => { load(); codeRef.current?.focus(); }, []);
  const till = shop.till || 'T11', gst = Math.max(0, +shop.gst || 0);
  const no = `${till}-PI-${String(Math.max(0, ...past.map((p) => +(/-PI-(\d+)$/.exec(p.purchaseNo || '')?.[1] || 0))) + 1).padStart(5, '0')}`;
  const val = (x) => x.qty * x.price * (1 - (x.disc || 0) / 100);
  const sub = lines.reduce((t, x) => t + val(x), 0), units = lines.reduce((t, x) => t + x.qty + (x.foc || 0), 0);
  const a1 = Math.min(+d1 || 0, sub), a2 = Math.min(+d2 || 0, sub - a1), ex = Math.max(0, +exp || 0), g = ((sub - a1 - a2) * gst) / 100, payable = Math.max(0, sub - a1 - a2 + g + ex);
  const sup = supplier.trim(), prev = sup ? past.filter((p) => p.supplier === sup).reduce((t, p) => t + (p.balance || 0), 0) - vadj(vch, sup) : 0;
  const suppliers = [...new Set([...prods.map((p) => p.supplier), ...past.map((p) => p.supplier)].filter((s) => s && s !== '(cash purchase)'))].sort();
  const hits = name && !sel ? prods.filter((p) => (p.name + ' ' + (p.code || '')).toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];
  const entryVal = (+qty || 0) * (+price || 0) * (1 - (+disc || 0) / 100);
  const avg = sel ? ((sel.stock || 0) * (sel.costPrice || 0) + entryVal) / Math.max(1, (sel.stock || 0) + (+qty || 0) + (+foc || 0)) : null;

  const pick = (p) => { setSel(p); setName(p.name); setCode(p.barcode || ''); setPrice(p.costPrice || 0); setSale(p.salePrice || 0); setDisc(0); setQty(1); setFoc(0); setMsg(null); setCat(false); setTimeout(() => qtyRef.current?.select(), 0); };
  const clearEntry = () => { setEditAt(null); setSel(null); setName(''); setCode(''); setQty(1); setFoc(0); setPrice(0); setDisc(0); setSale(0); setHi(0); };
  const addLine = () => {
    if (!sel) return setMsg({ e: 'Pick a product first.' });
    const q = +qty, f = +foc || 0, r = +price, d = +disc || 0, s = +sale || 0;
    if (!(q > 0)) return setMsg({ e: 'Enter a quantity above zero.' });
    if (!(r >= 0) || price === '' || !(d >= 0 && d <= 100) || f < 0) return setMsg({ e: 'Check the price, discount and FOC.' });
    const L = { productId: sel.id, code: sel.barcode || sel.code || '', name: sel.name, qty: q, foc: f, price: r, disc: d, salePrice: s };
    setLines((ls) => (editAt != null ? ls.map((l, i) => (i === editAt ? L : l)) : [...ls, L]));
    clearEntry(); setMsg(null); codeRef.current?.focus();
  };
  const scan = () => { const p = code && prods.find((x) => x.barcode === code || x.code === code || String(x.pid) === code || x.id === code); p ? pick(p) : setMsg({ e: 'No product with that barcode or ID.' }); };
  const edit = (i) => { const x = lines[i]; if (!x) return; setSel(prods.find((p) => p.id === x.productId) || { id: x.productId, name: x.name, stock: 0 }); setName(x.name); setCode(x.code); setQty(x.qty); setFoc(x.foc || 0); setPrice(x.price); setDisc(x.disc || 0); setSale(x.salePrice || 0); setEditAt(i); setMsg(null); setTimeout(() => qtyRef.current?.select(), 0); };
  const remove = (i) => { setLines((ls) => ls.filter((_, j) => j !== i)); setRow(Math.min(i, lines.length - 2)); if (editAt === i) clearEntry(); else if (editAt != null && editAt > i) setEditAt(editAt - 1); };
  const reset = (keepMsg) => { setLines([]); setRow(-1); clearEntry(); setSupplier(''); setInv(''); setRemarks(''); setD1(''); setD2(''); setExp(''); setType('CREDIT'); if (keepMsg !== true) setMsg(null); codeRef.current?.focus(); };
  const save = async (print) => {
    if (busy) return;
    if (!lines.length) return setMsg({ e: 'Add at least one item first.' });
    if (type === 'CREDIT' && !sup) { setMsg({ e: 'Choose the supplier whose account should be credited (or switch to CASH).' }); return supRef.current?.focus(); }
    setBusy(true); const r = await api('purchases', 'POST', { type, supplier: sup, invoiceNo: inv, date, remarks, discount1: a1, discount2: a2, expenses: ex, items: lines }); setBusy(false);
    if (r.error) return setMsg({ e: r.error });
    if (print) { setPr(r); setTimeout(() => { window.print(); setPr(null); }, 150); }
    reset(true); setMsg({ ok: `Saved ${r.purchaseNo} · payable ${rs2(r.total)} · stock updated` }); load();
  };
  const listKey = (e) => {
    if (e.target !== e.currentTarget || !lines.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setRow((r) => Math.min(r + 1, lines.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (row <= 0) { setRow(-1); codeRef.current?.focus(); } else setRow(row - 1); }
    else if (e.key === 'Enter' && row >= 0) { e.preventDefault(); edit(row); }
    else if (e.key === 'Delete' && row >= 0) { e.preventDefault(); remove(row); }
  };
  const ref = useRef(); ref.current = { save, reset };
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') { setCat(false); return; }
      const m = { save: () => ref.current.save(false), savePrint: () => ref.current.save(true), clear: () => ref.current.reset(), barcode: () => codeRef.current?.focus(), catalogue: () => setCat(true), pType: () => setType((t) => (t === 'CASH' ? 'CREDIT' : 'CASH')), supplier: () => supRef.current?.focus() };
      const id = acts(e).find((x) => m[x]); if (id) { e.preventDefault(); m[id](); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  const col = (l, el, w) => <div style={{ width: w, flex: w ? 'none' : 1, position: 'relative' }}><label>{l}</label>{el}</div>;
  const enter = (e) => e.key === 'Enter' && sel && addLine();
  const info = (l, v) => <div className="pinfo"><label>{l}</label><input readOnly value={v} /></div>;
  return <>
    <h2 className="ptitle">Purchase No. {no}</h2>
    <div className="inv">
      <p className="hint"><kbd>↑↓</kbd> move · <kbd>Enter</kbd> change an item · <kbd>Del</kbd> remove · <kbd>{KEYS.save}</kbd> save · stock comes in, the supplier gets paid or credited</p>
      <div className="hdr">
        <div className="fl"><label>Type ({KEYS.pType})</label><button className={'typebtn ' + type} title="CASH: paid now. CREDIT: added to what you owe the supplier." onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}<small>{KEYS.pType} to switch</small></button></div>
        <div className="fl"><label>Invoice No.</label><input placeholder="From their bill" value={inv} onChange={(e) => setInv(e.target.value)} /><label style={{ width: 'auto', marginLeft: 12 }}>Invoice Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200 }} /></div>
        <div className="fl"><label>Supplier ({KEYS.supplier})</label><input ref={supRef} list="sups" placeholder="Title of account" value={supplier} onChange={(e) => setSupplier(e.target.value)} /><datalist id="sups">{suppliers.map((s) => <option key={s} value={s} />)}</datalist></div>
        <div className="fl"><label>Remarks</label><input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
      </div>
      <div className="entry">
        {col(`ID / BARCODE (${KEYS.barcode})`, <input ref={codeRef} className="mono" placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 150)}
        {col('PRODUCT NAME', <>
          <input placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); setHi(0); }} onKeyDown={(e) => {
            if (!hits.length) { if (e.key === 'ArrowDown' && lines.length && !name) { e.preventDefault(); setRow(0); listRef.current?.focus(); } return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % hits.length); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + hits.length) % hits.length); }
            else if (e.key === 'Enter') { e.preventDefault(); pick(hits[Math.min(hi, hits.length - 1)]); }
            else if (e.key === 'Escape') { e.stopPropagation(); setName(''); }
          }} />
          {hits.length > 0 && <div className="hits">{hits.map((p, i) => <div key={p.id} className={'hit' + (i === hi ? ' on' : '')} onMouseDown={() => pick(p)}>{p.name} <small>stock {p.stock} {p.unit}</small></div>)}</div>}</>)}
        <button style={{ alignSelf: 'flex-end' }} onClick={() => setCat(true)}><Ico n="box" s={15} /> Catalogue ({KEYS.catalogue})</button>
        {col('QTY', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={enter} />, 70)}
        {col('FOC', <input type="number" min="0" value={foc} onChange={(e) => setFoc(e.target.value)} onKeyDown={enter} />, 70)}
        {col('PRICE', <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={enter} />, 100)}
        {col('DISC %', <input type="number" min="0" max="100" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={enter} />, 70)}
        {col('NET VALUE', <input readOnly value={'Rs ' + rs2(entryVal)} style={{ textAlign: 'right', fontWeight: 700 }} />, 110)}
        {col('SALE PRICE', <input type="number" min="0" value={sale} onChange={(e) => setSale(e.target.value)} onKeyDown={enter} />, 100)}
        <button className="pri" style={{ alignSelf: 'flex-end' }} onClick={addLine}>{editAt != null ? 'Update' : 'Add'}</button>
      </div>
      <div className="rlines" tabIndex="0" ref={listRef} onKeyDown={listKey}>
        <table style={{ width: '100%' }}><thead><tr><th>SR</th><th>SKU/CODE</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">FOC</th><th className="num">PRICE</th><th className="num">DISC</th><th className="num">VALUE</th><th className="num">S/RATE</th><th></th></tr></thead>
          <tbody>{lines.length === 0 && <tr><td colSpan="10" className="empty"><Ico n="truck" s={30} /><br />No items yet. Choose the supplier, then scan or type the items on their bill.</td></tr>}
            {lines.map((x, i) => <tr key={i} className={(i === row ? 'sel ' : '') + (i === editAt ? 'editing' : '')} onClick={() => { setRow(i); listRef.current?.focus(); }} onDoubleClick={() => edit(i)}>
              <td>{i + 1}</td><td className="mono">{x.code}</td><td>{x.name}</td><td className="num">{x.qty}</td><td className="num">{x.foc || 0}</td><td className="num">{rs2(x.price)}</td><td className="num">{x.disc || 0}</td><td className="num">{rs2(val(x))}</td><td className="num">{x.salePrice ? rs2(x.salePrice) : '—'}</td>
              <td><button title="Remove (Del)" aria-label={`Remove ${x.name}`} onClick={(e) => { e.stopPropagation(); remove(i); }}>✕</button></td></tr>)}</tbody></table>
      </div>
      <div className="status"><span>{lines.length} items · {units} units</span>{gst > 0 && <span>GST {gst}% is added to the bill</span>}</div>
      <div className="bottom">
        <div className="bl">
          <div><span>Prev. Bal.</span><i>Rs {rs2(prev)}</i></div><div><span>This Bill</span><i>Rs {rs2(payable)}</i></div>
          <div><span>Payable</span><i className="pay">Rs {rs2(type === 'CREDIT' ? prev + payable : payable)}</i></div>
          <div className="pinfos">{info('Stock', sel ? `${sel.stock ?? 0} ${sel.unit || ''}` : '—')}{info(`Price + GST${gst ? ' ' + gst + '%' : ''}`, sel ? rs2((+price || 0) * (1 + gst / 100)) : '—')}{info('Avg. Price', avg == null ? '—' : rs2(avg))}{info('FOC Ratio', +foc > 0 && +qty > 0 ? `${foc} : ${qty}` : '—')}</div>
        </div>
        <div className="br">
          <div><span className="red">TOTAL BILL</span><i>Rs {rs2(sub)}</i></div>
          <div><span>DISCOUNT-1</span><input type="number" min="0" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} /></div>
          <div><span>DISCOUNT-2</span><input type="number" min="0" value={d2} placeholder="0.00" onChange={(e) => setD2(e.target.value)} /></div>
          {gst > 0 && <div><span>GST {gst}%</span><i>Rs {rs2(g)}</i></div>}
          <div><span className="red">EXPENSES</span><input type="number" min="0" value={exp} placeholder="0.00" onChange={(e) => setExp(e.target.value)} /></div>
          <div><span>PAYABLE</span><i className="net">{rs2(payable)}</i></div>
        </div>
      </div>
      <div className="btns"><button onClick={() => reset()}>Clear <kbd>{KEYS.clear}</kbd></button><button disabled={!lines.length || busy} onClick={() => save(true)}><Ico n="print" s={15} /> Save & Print <kbd>{KEYS.savePrint}</kbd></button><button className="pri" disabled={!lines.length || busy} onClick={() => save(false)}>Save <kbd>{KEYS.save}</kbd></button><button onClick={onClose}>Close</button></div>
      {msg && <p className={msg.e ? 'rerr' : 'ok'} role={msg.e ? 'alert' : undefined}>{msg.e || msg.ok}</p>}
    </div>
    {cat && <div className="modal" onClick={() => setCat(false)}><div className="mbox" onClick={(e) => e.stopPropagation()}><b>Product Catalogue</b><input autoFocus placeholder="Search products" value={cq} onChange={(e) => setCq(e.target.value)} />
      <div className="mlist">{prods.filter((p) => p.name.toLowerCase().includes(cq.toLowerCase())).map((p) => <div key={p.id} className="hit" onClick={() => { pick(p); setCq(''); }}>{p.name} — cost {rs(p.costPrice || 0)} <small>stock {p.stock} {p.unit}</small></div>)}</div></div></div>}
    {pr && <PurchaseReceipt pr={pr} shop={shop} />}
  </>;
}

function PurchaseHistory() {
  const [all, setAll] = useState([]), [shop, setShop] = useState({}), [q, setQ] = useState(''), [det, setDet] = useState(null), [pdf, setPdf] = useState(false), [page, setPage] = useState(0), [chip, setChip] = useState('30 days');
  const range = (n) => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - n); return [ld(f), ld(t)]; };
  const [[from, to], setR] = useState(range(29));
  const load = () => { api('purchases').then((a) => setAll(Array.isArray(a) ? a : [])); api('settings').then((a) => setShop((Array.isArray(a) && a.find((x) => x.id === 'shop')) || {})); };
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const pick = (k) => {
    const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1); setChip(k); setPage(0);
    setR({ Today: [ld(t), ld(t)], Yesterday: [ld(y), ld(y)], '7 days': range(6), '30 days': range(29), 'This month': [ld(new Date(t.getFullYear(), t.getMonth(), 1)), ld(t)] }[k]);
  };
  const rows = all.filter((p) => p.date >= from && p.date <= to && (p.purchaseNo + ' ' + p.supplier + ' ' + (p.invoiceNo || '')).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  const pages = Math.max(1, Math.ceil(rows.length / PER)), pg = Math.min(page, pages - 1), shown = rows.slice(pg * PER, pg * PER + PER);
  const T = rows.reduce((t, p) => ({ g: t.g + p.subtotal, d: t.d + (p.discount1 || 0) + (p.discount2 || 0), e: t.e + (p.expenses || 0), n: t.n + p.total }), { g: 0, d: 0, e: 0, n: 0 });
  const csv = () => {
    const t = ['Voucher,Date,Type,Supplier,Bill #,Items,Gross,Discount,GST,Expenses,Payable,User', ...rows.map((p) => [p.purchaseNo, p.date, p.type || 'CASH', p.supplier, p.invoiceNo || '', p.items.length, p.subtotal, (p.discount1 || 0) + (p.discount2 || 0), p.gst || 0, p.expenses || 0, p.total, p.user].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = 'purchase-history.csv'; a.click();
  };
  const head = <tr><th>VOUCHER #</th><th>DATE</th><th>TYPE</th><th>SUPPLIER</th><th>BILL #</th><th className="num">ITEMS</th><th className="num">GROSS</th><th className="num">DISC</th><th className="num">EXPENSES</th><th className="num">PAYABLE</th><th>USER</th></tr>;
  const line = (p) => <><td className="mono">{p.purchaseNo}</td><td>{p.date}</td><td><span className={'tag ' + ((p.type || 'CASH') === 'CASH' ? 'Create' : 'Credit')}>{(p.type || 'CASH') === 'CASH' ? 'Cash' : 'Credit'}</span></td><td>{p.supplier}</td><td>{p.invoiceNo}</td><td className="num">{p.items.length}</td><td className="num">{rs2(p.subtotal)}</td><td className="num">{rs2((p.discount1 || 0) + (p.discount2 || 0))}</td><td className="num">{rs2(p.expenses || 0)}</td><td className="num"><b>{rs2(p.total)}</b></td><td>{p.user}</td></>;
  return <>
    <div className="filters" style={{ justifyContent: 'flex-end' }}><button className="chip" disabled={!rows.length} onClick={csv}><Ico n="down" s={15} /> CSV</button><button className="chip" onClick={() => setPdf(true)}><Ico n="file" s={15} /> View in PDF Mode</button><button className="chip" disabled={!rows.length} onClick={() => { setPdf(true); setTimeout(() => window.print(), 200); }}><Ico n="print" s={15} /> Print</button></div>
    <div className="spanel">
      <div className="filters" style={{ padding: 12 }}>
        <input type="date" value={from} onChange={(e) => { setR([e.target.value, to]); setChip(''); setPage(0); }} style={{ width: 150 }} />→<input type="date" value={to} onChange={(e) => { setR([from, e.target.value]); setChip(''); setPage(0); }} style={{ width: 150 }} />
        {['Today', 'Yesterday', '7 days', '30 days', 'This month'].map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => pick(k)}>{k}</button>)}
        <input className="grow" placeholder="Supplier / party name, voucher or bill #" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      {rows.length === 0 ? <div className="empty" style={{ padding: 40, textAlign: 'center' }}><Ico n="clip" s={30} /><br /><b>Nothing in this range</b></div> : <>
        <table style={{ width: '100%' }}><thead>{head}</thead><tbody>{shown.map((p) => <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setDet(p)}>{line(p)}</tr>)}</tbody></table>
        <div className="grand"><span>Total Purchases: {rows.length}</span><span className="grow" /><b>GRAND TOTAL</b><span>{rs2(T.g)}</span><span>{rs2(T.d)}</span><span>{rs2(T.e)}</span><span>{rs2(T.n)}</span></div>
        <div className="filters" style={{ padding: 8 }}><small>Showing {pg * PER + 1}–{pg * PER + shown.length} of {rows.length}</small><span className="grow" /><button className="chip" disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button><b>Page {pg + 1} of {pages}</b><button className="chip" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button></div></>}
    </div>
    {det && <div className="modal" onClick={() => setDet(null)}><div className="mbox wide" onClick={(e) => e.stopPropagation()}><b className="mono" style={{ fontSize: 18 }}>{det.purchaseNo}</b>
      <p style={{ margin: 0 }}>{det.date} · {(det.type || 'CASH') === 'CASH' ? 'Cash' : 'Credit'} · {det.supplier}{det.invoiceNo && ` · their bill ${det.invoiceNo}`} · by {det.user}</p>{det.remarks && <p style={{ margin: 0 }}>Remarks: {det.remarks}</p>}
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">FOC</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">VALUE</th></tr></thead>
        <tbody>{det.items.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name}</td><td className="num">{x.qty}</td><td className="num">{x.foc || 0}</td><td className="num">{rs2(x.price ?? x.cost)}</td><td className="num">{x.disc || 0}</td><td className="num">{rs2(x.value ?? x.qty * x.cost)}</td></tr>)}</tbody></table>
      <div className="dtot"><div><span>Total Bill</span><i>{rs2(det.subtotal)}</i></div><div><span>Discount-1</span><i>{rs2(det.discount1 || 0)}</i></div><div><span>Discount-2</span><i>{rs2(det.discount2 || 0)}</i></div>{det.gst > 0 && <div><span>GST {det.gstPct}%</span><i>{rs2(det.gst)}</i></div>}<div><span>Expenses</span><i>{rs2(det.expenses || 0)}</i></div><div className="b"><span>Payable</span><i>{rs2(det.total)}</i></div></div>
      <div className="btns" style={{ justifyContent: 'flex-end' }}><button className="pri" onClick={() => setDet(null)}>Done</button></div></div></div>}
    {pdf && <div className="preport"><div className="preport-bar"><b>Purchase History · PDF mode</b><span className="grow" /><button className="pri" onClick={() => window.print()}><Ico n="print" s={15} /> Print / Save as PDF</button><button onClick={() => setPdf(false)}>Close</button></div>
      <div className="preport-page"><h2 style={{ margin: 0 }}>{shop.name || 'Purchase History'}</h2><div style={{ color: '#556', marginBottom: 8 }}>Purchase History · {from} to {to}{q && ` · "${q}"`}</div>
        <table style={{ width: '100%' }}><thead>{head}</thead><tbody>{rows.map((p) => <tr key={p.id}>{line(p)}</tr>)}</tbody>
          <tfoot><tr><td colSpan="6"><b>Total ({rows.length})</b></td><td className="num"><b>{rs2(T.g)}</b></td><td className="num"><b>{rs2(T.d)}</b></td><td className="num"><b>{rs2(T.e)}</b></td><td className="num"><b>{rs2(T.n)}</b></td><td></td></tr></tfoot></table></div></div>}
  </>;
}

// ---------- Cash: vouchers and cash book ----------
const n2 = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dmy = (s) => (s ? s.split('-').reverse().join('-') : '');
const balTxt = (b) => (!b ? '0.00' : n2(Math.abs(b)) + (b > 0 ? ' Dr' : ' Cr'));
const vadj = (vch, name) => vch.reduce((t, v) => t + (v.lines || []).filter((l) => String(l.title).toLowerCase() === String(name || '').trim().toLowerCase()).reduce((s, l) => s + (v.kind === 'PAYMENT' ? l.amount : -l.amount), 0), 0);

function VoucherReceipt({ pr, shop }) {
  return <div className="receipt" style={paperVars(shop)}>
    <div className="rc big">{shop.name}</div><hr />
    <div className="rc sm">{pr.kind === 'PAYMENT' ? 'Payment Voucher' : 'Receipt Voucher'}</div>
    <div className="rl sm"><span>#{pr.voucherNo}</span><span>{pr.date}</span></div>{pr.remarks && <div className="rl sm"><span>Remarks</span><span>{pr.remarks}</span></div>}<hr />
    {pr.lines.map((l, i) => <div key={i}><div className="rl sm b"><span>{l.title}</span><span>{n2(l.amount)}</span></div><div className="rc sm" style={{ textAlign: 'left' }}>{l.particulars}</div></div>)}<hr />
    <div className="rl big"><span>Total</span><span>Rs {n2(pr.total)}</span></div><hr /><div className="rc sm">{pr.user}</div>
  </div>;
}

function CashVoucher({ kind }) {
  const pay = kind === 'PAYMENT', tag = pay ? 'PV' : 'RV', today = ld(new Date()), defPart = pay ? 'CASH PAID' : 'CASH RECEIVED';
  const [accts, setAccts] = useState([]), [vch, setVch] = useState([]), [shop, setShop] = useState({}), [inHand, setInHand] = useState(0);
  const [cat, setCat] = useState('ALL ACCOUNTS'), [mode, setMode] = useState('Anywhere'), [by, setBy] = useState('name'), [date, setDate] = useState(today), [remarks, setRemarks] = useState('');
  const [codeIn, setCodeIn] = useState(''), [nameIn, setNameIn] = useState(''), [sel, setSel] = useState(null), [hi, setHi] = useState(0), [part, setPart] = useState(defPart), [amt, setAmt] = useState('');
  const [lines, setLines] = useState([]), [row, setRow] = useState(-1), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false), [pr, setPr] = useState(null);
  const nameRef = useRef(), codeRef = useRef(), amtRef = useRef(), partRef = useRef(), listRef = useRef();
  const arr = (r) => (Array.isArray(r) ? r : []);
  const load = () => { api('accounts').then((r) => setAccts(arr(r))); api('vouchers').then((r) => setVch(arr(r))); api('settings').then((a) => setShop(arr(a).find((x) => x.id === 'shop') || {})); api(`cashbook?from=${today}&to=${today}`).then((r) => setInHand(r.inHand || 0)); };
  useEffect(() => { load(); nameRef.current?.focus(); }, []);
  const till = shop.till || 'T11', last = Math.max(0, ...vch.filter((v) => v.kind === kind).map((v) => +(new RegExp(`-${tag}-(\\d+)$`).exec(v.voucherNo || '')?.[1] || 0)));
  const no = `${till}-${tag}-${String(last + 1).padStart(5, '0')}`, total = lines.reduce((t, l) => t + l.amount, 0);
  const cats = [...new Set(accts.map((a) => a.category))].sort();
  const m = (txt, q) => (mode === 'Starts with' ? txt.toLowerCase().startsWith(q) : txt.toLowerCase().includes(q));
  const qn = nameIn.trim().toLowerCase(), qc = codeIn.trim().toLowerCase();
  const list = accts.filter((a) => (cat === 'ALL ACCOUNTS' || a.category === cat) && (!qn || m(by === 'name' ? a.title : a.code, qn)) && (!qc || a.code.toLowerCase().startsWith(qc)));
  const cur = Math.min(hi, Math.max(0, list.length - 1));
  useEffect(() => { listRef.current?.querySelector('tr.sel')?.scrollIntoView({ block: 'nearest' }); }, [cur, list.length]);
  const pick = (a) => { setSel(a); setNameIn(a.title); setCodeIn(a.code); setMsg(null); setTimeout(() => amtRef.current?.select(), 0); };
  const clearEntry = () => { setSel(null); setNameIn(''); setCodeIn(''); setAmt(''); setPart(defPart); setHi(0); };
  const addLine = () => {
    if (!sel) return setMsg({ e: 'Pick an account first.' });
    if (!(+amt > 0)) { setMsg({ e: 'Enter an amount above zero.' }); return amtRef.current?.focus(); }
    setLines((ls) => [...ls, { code: sel.code, title: sel.title, particulars: part.trim() || defPart, amount: +(+amt).toFixed(2) }]);
    clearEntry(); setMsg(null); nameRef.current?.focus();
  };
  const reset = (keepMsg) => { setLines([]); setRow(-1); clearEntry(); setRemarks(''); setDate(today); if (keepMsg !== true) setMsg(null); nameRef.current?.focus(); };
  const save = async (print) => {
    if (busy) return;
    const ls = sel && +amt > 0 ? [...lines, { code: sel.code, title: sel.title, particulars: part.trim() || defPart, amount: +amt }] : lines; // a typed line that was not added yet still counts
    if (!ls.length) return setMsg({ e: 'Add at least one line to the voucher first.' });
    setBusy(true); const r = await api('vouchers', 'POST', { kind, date, remarks, lines: ls }); setBusy(false);
    if (r.error) return setMsg({ e: r.error });
    if (print) { setPr(r); setTimeout(() => { window.print(); setPr(null); }, 150); }
    reset(true); setMsg({ ok: `Saved ${r.voucherNo} · Rs ${n2(r.total)}` }); load();
  };
  const ref = useRef(); ref.current = { save, reset };
  useEffect(() => {
    const k = (e) => { const mm = { save: () => ref.current.save(false), save2: () => ref.current.save(false), savePrint: () => ref.current.save(true), clear: () => ref.current.reset() }; const id = acts(e).find((x) => mm[x]); if (id) { e.preventDefault(); mm[id](); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  const shown = sel || (row >= 0 ? accts.find((a) => a.code === lines[row]?.code) : null);
  const nameKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((cur + 1) % Math.max(1, list.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((cur - 1 + list.length) % Math.max(1, list.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (sel && +amt > 0) addLine(); else if (list[cur]) pick(list[cur]); }
    else if (e.key === 'Escape') { e.stopPropagation(); clearEntry(); }
  };
  const codeKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); const a = accts.find((x) => x.code.toLowerCase() === codeIn.trim().toLowerCase()) || list[cur]; if (a) pick(a); } else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((cur + 1) % Math.max(1, list.length)); } };
  return <>
    <h2 className="ptitle">{pay ? 'Payment' : 'Receipt'} Voucher (Multiple Entries) No. {no}</h2>
    <div className="cv">
      <div className="cvtop"><span>Voucher No. <b className="mono" style={{ color: 'var(--ac)' }}>{no}</b></span><span className="cih">Cash in hand: <b>{n2(inHand)}</b></span>
        <span className="hint"><kbd>↓</kbd> into the accounts · <kbd>Enter</kbd> pick / next · <kbd>Ctrl+S</kbd> save</span><span className="grow" />
        <fieldset className="cvsb"><legend>Search by</legend><label><input type="radio" checked={by === 'name'} onChange={() => setBy('name')} /> Account Name</label><label><input type="radio" checked={by === 'code'} onChange={() => setBy('code')} /> Account Code</label></fieldset></div>
      <div className="cvrow"><div style={{ width: 330 }}><label>Account Category</label><select value={cat} onChange={(e) => { setCat(e.target.value); setHi(0); }}><option>ALL ACCOUNTS</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div style={{ width: 186 }}><label>Search By</label><select value={mode} onChange={(e) => setMode(e.target.value)}><option>Anywhere</option><option>Starts with</option></select></div>
        <div style={{ width: 176 }}><label>Dated</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grow"><label>Remarks</label><input placeholder={pay ? 'e.g. Monthly bills' : 'e.g. Recovery round, Basti'} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div></div>
      <div className="cvrow"><div style={{ width: 120 }}><label>A/C Code</label><input ref={codeRef} className="mono" value={codeIn} onChange={(e) => { setCodeIn(e.target.value); setSel(null); setHi(0); }} onKeyDown={codeKey} /></div>
        <div className="grow"><label>Account Name</label><input ref={nameRef} placeholder={pay ? 'Paid to… (type to search)' : 'Received from… (type to search)'} value={nameIn} onChange={(e) => { setNameIn(e.target.value); setSel(null); setHi(0); }} onKeyDown={nameKey} /></div>
        <div style={{ width: 210 }}><label>Account Balance</label><input readOnly style={{ textAlign: 'right', fontWeight: 700 }} value={shown ? balTxt(shown.balance) : ''} /></div></div>
      <div className="acl" ref={listRef}><table style={{ width: '100%' }}><thead><tr><th style={{ width: 130 }}>A/C CODE</th><th>TITLE OF ACCOUNT</th><th style={{ width: 260 }}>TOWN/CATEGORY</th><th className="num" style={{ width: 170 }}>BALANCE</th></tr></thead>
        <tbody>{list.length === 0 && <tr><td colSpan="4" className="empty">No account matches. Customers and suppliers appear here once they have a bill.</td></tr>}
          {list.map((a, i) => <tr key={a.code} className={i === cur ? 'sel' : ''} onClick={() => { setHi(i); pick(a); }}><td className="mono">{a.code}</td><td><b>{a.title}</b></td><td style={{ color: '#2347b0' }}>{a.category}</td><td className="num">{balTxt(a.balance)}</td></tr>)}</tbody></table></div>
      <div className="cvrow" style={{ alignItems: 'flex-end' }}><div className="grow"><label>Particulars</label><input ref={partRef} value={part} onChange={(e) => setPart(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && amtRef.current?.focus()} /></div>
        <div style={{ width: 210 }}><label>Amount</label><div className="unit"><span>Rs</span><input ref={amtRef} type="number" min="0" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLine()} /></div></div>
        <button className="pri" onClick={addLine}>Add to Voucher</button></div>
      <div className="vl"><table style={{ width: '100%' }}><thead><tr><th style={{ width: 60 }}>SR.</th><th>TITLE OF ACCOUNT</th><th>PARTICULARS</th><th className="num" style={{ width: 180 }}>AMOUNT</th><th style={{ width: 40 }}></th></tr></thead>
        <tbody>{lines.length === 0 && <tr><td colSpan="5" className="empty" style={{ padding: 40 }}>No lines yet. Pick an account, type the amount and press Enter.</td></tr>}
          {lines.map((l, i) => <tr key={i} className={i === row ? 'sel' : ''} onClick={() => setRow(i)}><td>{i + 1}</td><td><b>{l.title}</b></td><td>{l.particulars}</td><td className="num">{n2(l.amount)}</td><td><button title="Remove" onClick={(e) => { e.stopPropagation(); setLines(lines.filter((_, j) => j !== i)); setRow(-1); }}>✕</button></td></tr>)}</tbody></table></div>
      <div className="vfoot"><span className="grow" style={{ color: '#b4300f' }}>A/C Balance : {shown ? `${shown.title} · ${balTxt(shown.balance)}` : ''}</span><div className="vtot"><b>TOTAL AMOUNT</b><span>{n2(total)}</span></div></div>
      <div className="btns"><button onClick={() => reset()}><Ico n="refresh" s={15} /> Reset <kbd>{KEYS.clear}</kbd></button><button disabled={busy || (!lines.length && !(sel && +amt > 0))} onClick={() => save(true)}><Ico n="print" s={15} /> Save & Print <kbd>{KEYS.savePrint}</kbd></button><button className="pri" disabled={busy || (!lines.length && !(sel && +amt > 0))} onClick={() => save(false)}>Save <kbd>Ctrl+S</kbd></button><button onClick={() => window.dispatchEvent(new CustomEvent('falcon-go', { detail: 'Sales Invoice' }))}>Close</button></div>
      {msg && <p className={msg.e ? 'rerr' : 'ok'} role={msg.e ? 'alert' : undefined}>{msg.e || msg.ok}</p>}
    </div>
    {pr && <VoucherReceipt pr={pr} shop={shop} />}
  </>;
}
const CashPayment = (p) => <CashVoucher {...p} kind="PAYMENT" />;
const CashReceipt = (p) => <CashVoucher {...p} kind="RECEIPT" />;

function CashBook() {
  const today = ld(new Date()), [shop, setShop] = useState({}), [from, setFrom] = useState(today), [to, setTo] = useState(today), [applied, setApplied] = useState([today, today]), [data, setData] = useState(null), [only, setOnly] = useState(''), [pdf, setPdf] = useState(false);
  const load = (f = applied[0], t = applied[1]) => { api(`cashbook?from=${f}&to=${t}`).then(setData); api('settings').then((a) => setShop((Array.isArray(a) && a.find((x) => x.id === 'shop')) || {})); };
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); document.getElementById('cb-reset')?.click(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  if (!data) return null;
  const apply = () => { const r = from <= to ? [from, to] : [to, from]; setFrom(r[0]); setTo(r[1]); setApplied(r); load(r[0], r[1]); };
  const reset = () => { setFrom(today); setTo(today); setOnly(''); setApplied([today, today]); load(today, today); };
  const op = data.opening, all = [{ op: true, date: data.from, doc: 'OP-BAL', title: 'CASH ACCOUNT', particulars: data.from === data.to ? 'OPENING BALANCE OF THE DAY' : 'OPENING BALANCE', receipt: op > 0 ? op : 0, payment: op < 0 ? -op : 0 }, ...data.rows];
  const rows = all.filter((r) => (only === 'PAY' ? r.payment > 0 && !r.op : only === 'REC' ? r.receipt > 0 && !r.op : true));
  const TR = all.reduce((t, r) => t + r.receipt, 0), TP = all.reduce((t, r) => t + r.payment, 0), shR = rows.reduce((t, r) => t + r.receipt, 0), shP = rows.reduce((t, r) => t + r.payment, 0);
  const cell = (v, c) => <td className="num" style={{ color: v ? c : undefined }}>{n2(v)}</td>;
  const table = (cls) => <table style={{ width: '100%' }} className={cls}><thead><tr><th>DOC NO.</th><th>DATED</th><th>TITLE OF A/C</th><th>PARTICULARS</th><th className="num">RECEIPT</th><th className="num">PAYMENT</th></tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className={r.op ? 'cbop' : ''}><td className="mono">{r.doc}</td><td>{dmy(r.date)}</td><td><b>{r.title}</b></td><td>{r.particulars}</td>{cell(r.receipt, '#15803d')}{cell(r.payment, '#b91c1c')}</tr>)}</tbody>
    <tfoot><tr className="cbtot"><td colSpan="3">CASH IN HAND {dmy(data.to)} ( {n2(TR)} − {n2(TP)} ) = {n2(data.inHand)}</td><td className="num">GRAND TOTAL</td><td className="num">{n2(shR)}</td><td className="num">{n2(shP)}</td></tr></tfoot></table>;
  return <>
    <div className="cvrow" style={{ alignItems: 'flex-end' }}><div><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 176 }} /></div><div><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 176 }} /></div>
      <button style={{ width: 88 }} onClick={apply}>OK</button><button className={only === 'PAY' ? 'chip on' : ''} onClick={() => setOnly(only === 'PAY' ? '' : 'PAY')}>PAYMENTS</button><button className={only === 'REC' ? 'chip on' : ''} onClick={() => setOnly(only === 'REC' ? '' : 'REC')}>RECEIPTS</button></div>
    <div className="vl" style={{ minHeight: 420 }}>{table('cbt')}</div>
    <div className="btns"><button id="cb-reset" onClick={reset}><Ico n="refresh" s={15} /> Reset <kbd>{KEYS.refresh}</kbd></button><button onClick={() => setPdf(true)}><Ico n="file" s={15} /> View in PDF Mode</button><button onClick={() => { setPdf(true); setTimeout(() => window.print(), 200); }}><Ico n="print" s={15} /> Print</button><button onClick={() => window.dispatchEvent(new CustomEvent('falcon-go', { detail: 'Sales Invoice' }))}>Close</button></div>
    {pdf && <div className="preport"><div className="preport-bar"><b>Cash Book · PDF mode</b><span className="grow" /><button className="pri" onClick={() => window.print()}><Ico n="print" s={15} /> Print / Save as PDF</button><button onClick={() => setPdf(false)}>Close</button></div>
      <div className="preport-page"><h2 style={{ margin: 0 }}>{shop.name || 'Cash Book'}</h2><div style={{ color: '#556', marginBottom: 8 }}>Cash Book · {dmy(data.from)} to {dmy(data.to)}</div>{table('')}</div></div>}
  </>;
}

// ---------- Dashboard ----------
const sday = (x) => (/^\d{4}-\d\d-\d\d$/.test(x.date || '') ? x.date : ld(new Date(x.createdAt)));
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return ld(d); };
const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const shortDay = (s) => new Date(s + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const kfmt = (v) => (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : String(Math.round(v)));
const niceMax = (m) => { if (m <= 0) return 1; const p = 10 ** Math.floor(Math.log10(m)), f = m / p; return ([1, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 4, 5, 6, 8, 10].find((s) => f <= s + 1e-9) || 10) * p; };
function smoothPath(pts) { // monotone cubic: smooth, never overshoots below the data
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
  const n = pts.length, dx = [], dy = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; m[i] = dy[i] / (dx[i] || 1); }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; } else { const a = t[i] / m[i], b = t[i + 1] / m[i], h = Math.hypot(a, b); if (h > 3) { t[i] = (3 * a / h) * m[i]; t[i + 1] = (3 * b / h) * m[i]; } } }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) { const x1 = pts[i][0] + dx[i] / 3, x2 = pts[i + 1][0] - dx[i] / 3; d += ` C${x1},${pts[i][1] + (t[i] * dx[i]) / 3} ${x2},${pts[i + 1][1] - (t[i + 1] * dx[i]) / 3} ${pts[i + 1][0]},${pts[i + 1][1]}`; }
  return d;
}
function AreaChart({ labels, series, h = 300 }) {
  const box = useRef(), [W, setW] = useState(900);
  useEffect(() => { const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.floor(e.contentRect.width)))); if (box.current) ro.observe(box.current); return () => ro.disconnect(); }, []);
  const L = 52, R = 16, T = 14, B = 30, iw = W - L - R, ih = h - T - B;
  const all = series.flatMap((s) => s.values), hi = niceMax(Math.max(0, ...all)), lo = Math.min(0, ...all), span = hi - lo || 1;
  const x = (i) => L + (labels.length < 2 ? iw / 2 : (i * iw) / (labels.length - 1)), y = (v) => T + ih - ((v - lo) / span) * ih;
  const step = Math.max(1, Math.ceil(labels.length / 9)), ticks = [0, 1, 2, 3, 4].map((i) => lo + (span * i) / 4);
  return <div ref={box} style={{ width: '100%' }}><svg className="achart" width={W} height={h} viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Chart">
    {ticks.map((v, i) => <g key={i}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="gl" /><text x={L - 8} y={y(v) + 4} className="gt" textAnchor="end">{kfmt(v)}</text></g>)}
    {labels.map((l, i) => i % step === 0 && <text key={i} x={x(i)} y={h - 8} className="gt" textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}>{l}</text>)}
    {series.map((s, si) => { const pts = s.values.map((v, i) => [x(i), y(v)]), d = smoothPath(pts);
      return <g key={s.name}>{si === 0 && pts.length > 1 && <path d={`${d} L${pts[pts.length - 1][0]},${y(Math.max(lo, 0))} L${pts[0][0]},${y(Math.max(lo, 0))}Z`} fill={s.color} opacity=".12" />}
        <path d={d} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {pts.length <= 40 && pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.4" fill="#fff" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke"><title>{`${labels[i]} · ${s.name}: Rs ${n2(s.values[i])}`}</title></circle>)}</g>; })}
  </svg></div>;
}

function Dashboard({ go, me }) {
  const today = ld(new Date()), [data, setData] = useState(null), [preset, setPreset] = useState('7'), [months, setMonths] = useState(3);
  const [from, setFrom] = useState(addDays(today, -6)), [to, setTo] = useState(today), [draft, setDraft] = useState([addDays(today, -6), today]), [metric, setMetric] = useState('net'), [profitGraph, setProfitGraph] = useState(false);
  const load = () => Promise.all(['sales', 'returns', 'products', 'pending', 'settings'].map((c) => api(c))).then(([sales, returns, products, pending, settings]) => setData({ sales: Array.isArray(sales) ? sales : [], returns: Array.isArray(returns) ? returns : [], products: Array.isArray(products) ? products : [], pending: Array.isArray(pending) ? pending : [], shop: (Array.isArray(settings) && settings.find((x) => x.id === 'shop')) || {} }));
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const setRange = (f, t, p) => { setFrom(f); setTo(t); setDraft([f, t]); setPreset(p); };
  const pickDays = (n) => setRange(addDays(today, -(n - 1)), today, String(n));
  const pickMonths = (m) => { const mm = Math.min(24, Math.max(1, m)), d = new Date(); d.setMonth(d.getMonth() - mm); d.setDate(d.getDate() + 1); setMonths(mm); setRange(ld(d), today, 'm'); };
  const calc = useMemo(() => {
    if (!data) return null;
    const cost = {}; for (const p of data.products) cost[p.id] = +p.costPrice || 0;
    const len = diffDays(from, to) + 1, pFrom = addDays(from, -len), pTo = addDays(from, -1);
    const blank = () => ({ gross: 0, disc: 0, ret: 0, net: 0, bills: 0, cash: 0, credit: 0, cashBills: 0, creditBills: 0, profit: 0, pCash: 0, pCredit: 0 });
    const cur = blank(), prev = blank(), days = {}, items = {}, heat = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (let i = 0; i < len; i++) days[addDays(from, i)] = { gross: 0, disc: 0, ret: 0, net: 0, cash: 0, credit: 0, profit: 0 };
    const bucket = (d) => (d >= from && d <= to ? cur : d >= pFrom && d <= pTo ? prev : null);
    for (const s of data.sales) {
      if (s.voided) continue; const d = sday(s), B = bucket(d); if (!B) continue;
      const gross = s.items.reduce((t, x) => t + x.qty * x.rate, 0), total = +s.total || 0, f = s.subtotal ? total / s.subtotal : 1;
      const cg = s.items.reduce((t, x) => t + (cost[x.productId] || 0) * x.qty, 0), profit = total - cg;
      B.gross += gross; B.disc += gross - total; B.bills++; B[s.type === 'CREDIT' ? 'credit' : 'cash'] += total; B[s.type === 'CREDIT' ? 'creditBills' : 'cashBills']++; B.profit += profit; B[s.type === 'CREDIT' ? 'pCredit' : 'pCash'] += profit;
      if (B === cur) {
        const D = days[d]; if (D) { D.gross += gross; D.disc += gross - total; D.cash += s.type === 'CREDIT' ? 0 : total; D.credit += s.type === 'CREDIT' ? total : 0; D.profit += profit; }
        for (const x of s.items) { const r = x.qty * x.rate * (1 - (x.disc || 0) / 100) * f, I = (items[x.name] ||= { name: x.name, qty: 0, rev: 0 }); I.qty += x.qty; I.rev += r; }
        const dt = new Date(s.createdAt); heat[(dt.getDay() + 6) % 7][dt.getHours()] += total;
      }
    }
    for (const r of data.returns) {
      const d = sday(r), B = bucket(d); if (!B) continue; const t = +r.total || 0, cg = (r.items || []).reduce((s, x) => s + (cost[x.productId] || 0) * x.qty, 0);
      B.ret += t; B.profit -= t - cg; B[r.type === 'CREDIT' ? 'pCredit' : 'pCash'] -= t - cg;
      if (B === cur && days[d]) { days[d].ret += t; days[d].profit -= t - cg; }
    }
    for (const B of [cur, prev]) B.net = B.gross - B.disc - B.ret;
    for (const k in days) days[k].net = days[k].gross - days[k].disc - days[k].ret;
    const arr = Object.values(items), low = data.products.filter((p) => p.active !== false && p.stock <= (p.minStock || 0)).length;
    return { cur, prev, days, len, pFrom, pTo, topQty: [...arr].sort((a, b) => b.qty - a.qty).slice(0, 5), topRev: [...arr].sort((a, b) => b.rev - a.rev).slice(0, 5), heat, low };
  }, [data, from, to]);
  if (!calc) return <p className="soon">Loading…</p>;
  const { cur, prev, days, pFrom, pTo, topQty, topRev, heat, low } = calc, keys = Object.keys(days), labels = keys.map(shortDay), hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const pct = (a, b) => (b ? ((a - b) / Math.abs(b)) * 100 : a ? 100 : 0);
  const Kpi = ({ title, icon, val, p, p0, money = true, goodUp = true, on, onClick }) => { const d = pct(p, p0), up = d >= 0, good = up === goodUp;
    return <button className={'kpi' + (on ? ' on' : '')} onClick={onClick}><div className="kh"><span>{title}</span><Ico n={icon} s={16} /></div><div className="kv">{money ? 'Rs ' : ''}{money ? n2(val) : Math.round(val).toLocaleString()}</div>
      <div className={'kd ' + (good ? 'good' : 'bad')}><Ico n={up ? 'arrowup' : 'arrowdown'} s={12} /> <b>{Math.abs(d).toFixed(1)}%</b> <span>vs previous</span></div></button>; };
  const avg = cur.bills ? cur.net / cur.bills : 0, avgP = prev.bills ? prev.net / prev.bills : 0;
  const M = { gross: ['Gross sales', 'gross', '#4a5bb5'], disc: ['Discounts', 'disc', '#b7791f'], ret: ['Returns', 'ret', '#b4443a'], net: ['Net sales', 'net', 'var(--ac)'] };
  const appEl = typeof document !== 'undefined' && document.querySelector('.app'), accent = (appEl && getComputedStyle(appEl).getPropertyValue('--ac').trim()) || '#2f7d4f';
  let series, title, sub = 'By day';
  if (profitGraph) { series = [{ name: 'Profit', color: '#2f7d4f', values: keys.map((k) => days[k].profit) }]; title = 'Profit'; }
  else if (metric === 'cc') { series = [{ name: 'Cash', color: accent, values: keys.map((k) => days[k].cash) }, { name: 'Credit', color: '#1f8a8a', values: keys.map((k) => days[k].credit) }]; title = 'Cash vs credit'; }
  else { series = [{ name: M[metric][0], color: metric === 'net' ? accent : M[metric][2], values: keys.map((k) => days[k][M[metric][1]]) }]; title = M[metric][0]; }
  const ccTot = cur.cash + cur.credit || 1, maxQ = Math.max(1, ...topQty.map((x) => x.qty)), maxR = Math.max(1, ...topRev.map((x) => x.rev)), hmax = Math.max(1, ...heat.flat());
  const hours = Array.from({ length: 17 }, (_, i) => i + 6), hl = (h) => (h === 6 ? '6a' : h === 9 ? '9a' : h === 12 ? '12p' : h === 15 ? '3p' : h === 18 ? '6p' : h === 21 ? '9p' : '');
  const expDays = data.shop.expiryDays ?? 3;
  return <div className="dash">
    <p className="ssub" style={{ margin: '0 0 12px' }}>{preset === '7' ? 'Last 7 days' : preset === '15' ? 'Last 15 days' : preset === '30' ? 'Last 30 days' : preset === 'm' ? `Last ${months} month${months > 1 ? 's' : ''}` : 'Custom range'} · {shortDay(from)} – {shortDay(to)} · figures from this till’s data, updated live</p>
    <div className="card drange">
      <div className="seg">{[['7', 'Last 7 days'], ['15', 'Last 15 days'], ['30', 'Last 30 days']].map(([k, l]) => <button key={k} className={preset === k ? 'on' : ''} onClick={() => pickDays(+k)}>{l}</button>)}</div>
      <div className={'seg months' + (preset === 'm' ? ' act' : '')}><span>Last</span><button onClick={() => pickMonths(months - 1)} aria-label="Fewer months">−</button><b>{months}</b><button onClick={() => pickMonths(months + 1)} aria-label="More months">+</button><span>months</span></div>
      <div className="dr"><Ico n="cal" s={16} /><input type="date" value={draft[0]} onChange={(e) => setDraft([e.target.value, draft[1]])} /><span>→</span><input type="date" value={draft[1]} onChange={(e) => setDraft([draft[0], e.target.value])} />
        <button onClick={() => { const [a, b] = draft[0] <= draft[1] ? draft : [draft[1], draft[0]]; setRange(a, b, 'c'); }}>Apply</button></div>
      <span className="grow" /><small>Compared with {shortDay(pFrom)} – {shortDay(pTo)}</small></div>
    <div className="kpis">
      <Kpi title="Net sales" icon="trend" val={cur.net} p={cur.net} p0={prev.net} on={!profitGraph && metric === 'net'} onClick={() => { setProfitGraph(false); setMetric('net'); }} />
      <Kpi title="Gross sales" icon="cart" val={cur.gross} p={cur.gross} p0={prev.gross} on={!profitGraph && metric === 'gross'} onClick={() => { setProfitGraph(false); setMetric('gross'); }} />
      <Kpi title="Discounts given" icon="tag" val={cur.disc} p={cur.disc} p0={prev.disc} goodUp={false} on={!profitGraph && metric === 'disc'} onClick={() => { setProfitGraph(false); setMetric('disc'); }} />
      <Kpi title="Returns" icon="undo" val={cur.ret} p={cur.ret} p0={prev.ret} goodUp={false} on={!profitGraph && metric === 'ret'} onClick={() => { setProfitGraph(false); setMetric('ret'); }} />
      <Kpi title="Transactions" icon="receipt" val={cur.bills} p={cur.bills} p0={prev.bills} money={false} />
      <Kpi title="Average basket" icon="wallet" val={avg} p={avg} p0={avgP} />
    </div>
    <div className="dgrid">
      <div className="card"><div className="ch"><div><b>{title}</b><small>{sub}</small></div><span className="grow" />
        <div className="seg sm">{[['gross', 'Gross'], ['disc', 'Discounts'], ['ret', 'Returns'], ['net', 'Net'], ['cc', 'Cash vs Credit']].map(([k, l]) => <button key={k} className={!profitGraph && metric === k ? 'on' : ''} onClick={() => { setProfitGraph(false); setMetric(k); }}>{l}</button>)}</div></div>
        <div className="cb">{series.length > 1 && <div className="legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>}<AreaChart labels={labels} series={series} /></div></div>
      <div className="dside">
        <div className="card pad"><b>Cash vs credit</b><div className="ccbar"><i style={{ width: (cur.cash / ccTot) * 100 + '%' }} /></div>
          <div className="cc2"><div><span className="dot" style={{ background: 'var(--ac)' }} /> Cash<b>Rs {n2(cur.cash)}</b><small>{cur.cashBills.toLocaleString()} bills</small></div><div><span className="dot" style={{ background: '#1f8a8a' }} /> Credit<b>Rs {n2(cur.credit)}</b><small>{cur.creditBills.toLocaleString()} bills</small></div></div></div>
        <div className="card pad"><div className="ch" style={{ padding: 0, border: 0 }}><b>Profit</b><span className="grow" /><button className="lnk" onClick={() => setProfitGraph(!profitGraph)}>{profitGraph ? 'Hide graph' : 'Show graph'}</button></div>
          <div className="pv">Rs {n2(cur.profit)}</div><small>{cur.net ? ((cur.profit / cur.net) * 100).toFixed(1) : '0.0'}% of net sales</small>
          <div className="cc2"><div><span className="dot" style={{ background: '#2b6cb0' }} /> On cash<b>Rs {n2(cur.pCash)}</b></div><div><span className="dot" style={{ background: '#b4443a' }} /> On credit<b>Rs {n2(cur.pCredit)}</b></div></div></div>
        <div className="card pad"><div className="att"><Ico n="warn" s={18} /><b>Needs attention</b></div>
          {[['Low stock items', low, low ? 'warn' : 'ok', () => go('Define Products')], [`Expiring within ${expDays} days`, 0, 'ok', () => go('Define Products')], ['Held sales waiting', data.pending.length, data.pending.length ? 'warn' : 'ok', () => go('Pending Entries')]].map(([l, v, c, f]) => <button key={l} className="arow" onClick={f}><span>{l}</span><i className={'pill ' + c}>{v.toLocaleString()}</i></button>)}</div>
      </div>
    </div>
    <div className="d3">
      {[['Top 5 by quantity sold', topQty, (x) => x.qty.toLocaleString(), (x) => x.qty / maxQ], ['Top 5 by revenue', topRev, (x) => 'Rs ' + n2(x.rev), (x) => x.rev / maxR]].map(([t, rows, f, w]) => <div className="card" key={t}><div className="ch"><b>{t}</b></div>
        <div className="cb">{rows.length === 0 && <p className="soon">No sales in this range.</p>}{rows.map((x, i) => <div className="top" key={x.name}><span className="rk">{i + 1}</span><div className="grow"><div className="tl"><span>{x.name}</span><b>{f(x)}</b></div><div className="tb"><i style={{ width: Math.max(3, w(x) * 100) + '%' }} /></div></div></div>)}</div></div>)}
      <div className="card"><div className="ch"><div><b>Busy hours</b><small>Net sales by hour and weekday. Helps plan staff and baking.</small></div></div>
        <div className="cb heat"><div className="hh"><span />{hours.map((h) => <span key={h}>{hl(h)}</span>)}</div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dn, r) => <div className="hrow" key={dn}><span>{dn}</span>{hours.map((h) => { const v = heat[r][h]; return <i key={h} title={`${dn} ${h}:00 · Rs ${n2(v)}`} style={{ background: v ? `color-mix(in srgb, var(--ac) ${12 + (v / hmax) * 88}%, #fff)` : undefined }} />; })}</div>)}</div></div>
    </div>
  </div>;
}

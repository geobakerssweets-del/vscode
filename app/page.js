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
  const [tab, setTab] = useState('SALES'), [screen, setScreen] = useState('Sales Invoice'), [prepOpen, setPrepOpen] = useState(true), [pwOpen, setPwOpen] = useState(false), [pendN, setPendN] = useState(0), [tabs, setTabs] = useState([{ id: 1, kind: 'sale', n: 1 }, { id: 2, kind: 'ret', n: 1 }]), [act, setAct] = useState({ sale: 1, ret: 2 }), [dirty, setDirty] = useState({}), [now, setNow] = useState(null), [editBill, setEditBill] = useState(null), [resumeBill, setResumeBill] = useState(null), [me, setMe] = useState({}), [low, setLow] = useState(0), [, setKv] = useState(0), [sq, setSq] = useState(''), [sres, setSres] = useState(false), [sprods, setSprods] = useState([]), [pref, setPref] = useState({ theme: 'Light', colour: '', size: 100, width: 100 });
  useEffect(() => { api('products').then((a) => Array.isArray(a) && setLow(a.filter((p) => p.active !== false && p.stock <= (p.minStock || 0)).length)); }, [screen]);
  const searchRef = useRef();
  useEffect(() => { api('pending').then((r) => setPendN(Array.isArray(r) ? r.length : 0)); }, [screen]);
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
  const go = (sc) => {
    if (sc === 'Change Password') { setPwOpen(true); return; }
    if (sc === 'Calculator') { api('launch', 'POST', { app: 'calculator' }).then((r) => r.error && window.alert(r.error)); return; }
    setEditBill(null); setResumeBill(null); setScreen(sc);
  };
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
  const SCREEN = { Dashboard, 'Sales History': SalesHistory, 'Pending Entries': Pending, 'Change Password': ChangePassword, 'Define Products': Products, 'Audit Log': Audit, Settings, 'Users Manager': UsersScreen, 'Look & Feel': LookScreen, 'Printer Settings': PrinterScreen, 'Keyboard Shortcuts': KeysScreen, Shortcuts: KeysScreen, 'Return History': ReturnHistory, Updates, Support, 'Bill Template': BillTemplate, 'Backup Data': Backup, 'Purchase Invoice': PurchaseInvoice, 'Purchase History': PurchaseHistory, 'Purchase Return': PurchaseReturnScreen, 'Purchase Return History': PurchaseReturnHistory, 'Advance Sales': AdvanceSales, 'Sales Report': SalesReport, 'Stock Analysis': StockAnalysis, 'Reports Center': ReportsCenter, 'Sales Summary': SalesSummaryScreen, 'Stock Report': StockReportScreen, 'Theme Setup': LookScreen, 'Cash Payment': CashPayment, 'Cash Receipt': CashReceipt, 'Cash Book': CashBook };
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
        <div className="items">{items.map(([n, i]) => <button key={n} className={'rb' + (n === screen ? ' on' : '')} onClick={() => go(n)}><span className="ic" style={{ '--tn': toneOf(n) }}><Ico n={i} s={20} />{n === 'Pending Entries' && pendN > 0 && <i className="rbadge">{pendN}</i>}</span>{tr(n)}</button>)}</div><small>{tr(g)}</small></div>)}</div>
      <div className="datebar" style={{ background: COLOURS[pref.colour] || SCREEN_COLOR[screen] || COLOR[tab] }}>{d}, {wd}</div>
      <div className="body">
        <aside><div className="ql">{tr('QUICK LAUNCH')}</div>{QUICK.map((q) => <button key={q} className={q === screen ? 'on' : ''} onClick={() => go(q)}><Ico n={ICON_OF[q] || 'dot'} s={16} /><span>{tr(q)}</span></button>)}
          <div className="grow" />
          <div className="prep"><button className="prepH" onClick={() => setPrepOpen(!prepOpen)} aria-expanded={prepOpen}><Ico n={prepOpen ? 'chevd' : 'chevr'} s={13} /> ORDER PREP</button>
            {prepOpen && <p>{low > 0 ? <>{low.toLocaleString()} items are at or below their minimum stock. <button className="lnk" onClick={() => go('Purchase Invoice')}>Open Purchase Invoice</button> to restock.</> : 'No supplier due in the next 3 days, and nothing to order.'}</p>}</div>
          <button className={screen === 'Settings' ? 'on' : ''} onClick={() => go('Settings')}><Ico n="gear" s={16} /><span>{tr('Settings')}</span></button>
          <button className={screen === 'Updates' ? 'on' : ''} onClick={() => go('Updates')}><Ico n="cloud" s={16} /><span>{tr('Updates')}</span></button></aside>
        <section>{screen !== 'Sales Invoice' && screen !== 'Sales Return' && !['Purchase Invoice', 'Purchase Return', 'Cash Payment', 'Cash Receipt'].includes(screen) && <h2 className="ptitle">{screen === 'Dashboard' ? `${!now ? 'Hello' : now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${me.name || ''}` : tr(screen)}</h2>}
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
      {pwOpen && <div className="modal" onClick={() => setPwOpen(false)}><div className="mbox" style={{ width: 400 }} role="dialog" aria-modal="true" aria-label="Change password" onClick={(e) => e.stopPropagation()}>
        <div className="mhead"><b>Change password</b><button className="px" aria-label="Close" onClick={() => setPwOpen(false)}><Ico n="x" s={14} /></button></div><ChangePassword onClose={() => setPwOpen(false)} /></div></div>}
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
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [pr, setPr] = useState(null), [z, setZ0] = useState(90), [vch, setVch] = useState([]);
  const setZ = (f) => setZ0((v) => { const n = typeof f === 'function' ? f(v) : f; savePrefs({ ...getPrefs(), size: n }); return n; });
  const latest = useRef(null), codeRef = useRef(), qtyRef = useRef(), custRef = useRef(), cashRef = useRef();
  const load = () => {
    api('vouchers').then((r) => setVch(Array.isArray(r) ? r : [])); api('products').then(setProds); api('returns').then((r) => setRets(Array.isArray(r) ? r : [])); api('settings').then((a) => setShop(a[0] || {}));
    api('sales').then((a) => { setSales(a); setNo('T11-' + String(a.length + 1).padStart(5, '0')); });
  };
  useEffect(() => { load(); if (active) codeRef.current?.focus(); if (resume) api('pending/' + resume.id, 'DELETE'); return () => onDirty?.(false); }, []);
  const first = useRef(true);
  useEffect(() => { setZ0(getPrefs().size || 90); }, []); // read the saved size after the page has loaded, so the server and browser agree on first paint
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

function ChangePassword({ onClose }) {
  const [o, setO] = useState(''), [n, setN] = useState(''), [c, setC] = useState(''), [m, setM] = useState(null), [busy, setBusy] = useState(false), first = useRef();
  useEffect(() => { first.current?.focus(); const k = (e) => e.key === 'Escape' && onClose?.(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const save = async () => {
    if (busy || !o || !n) return;
    if (n !== c) return setM({ e: 'The new passwords do not match.' });
    setBusy(true); const r = await api('auth/password', 'POST', { oldPassword: o, newPassword: n }); setBusy(false);
    if (r.error) return setM({ e: r.error });
    setM({ ok: 'Password changed.' }); setO(''); setN(''); setC(''); if (onClose) setTimeout(onClose, 1100);
  };
  const f = (l, v, set, ref) => <div><label>{l}</label><input ref={ref} type="password" autoComplete="off" value={v} onChange={(e) => { set(e.target.value); setM(null); }} onKeyDown={(e) => e.key === 'Enter' && save()} /></div>;
  return <div className="pwform">{f('Current password', o, setO, first)}{f('New password', n, setN)}{f('Confirm new password', c, setC)}
    {m?.e && <p className="rerr" role="alert">{m.e}</p>}{m?.ok && <p className="ok">{m.ok}</p>}
    <div className="btns" style={{ justifyContent: 'flex-end', margin: 0 }}>{onClose && <button onClick={onClose}>Cancel</button>}<button className="pri" disabled={!o || !n || busy} onClick={save}>Change password</button></div></div>;
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

function PurchaseReturnReceipt({ pr, shop }) {
  return <div className="receipt" style={paperVars(shop)}>
    {shop.logo && <div className="rc"><img src={shop.logo} alt="" style={{ width: '70%' }} /></div>}
    <div className="rc big">{shop.name}</div><hr /><div className="rc sm">Purchase Return · {pr.type === 'CASH' ? 'Cash refund' : 'Credit note'}</div>
    <div className="rl sm"><span>#{pr.returnNo}</span><span>{pr.date}</span></div><div className="rl sm"><span>Supplier</span><span>{pr.supplier}</span></div>{pr.invoiceNo && <div className="rl sm"><span>Their bill</span><span>{pr.invoiceNo}</span></div>}<hr />
    <div className="rl sm b"><span>DESCRIPTION</span><span>QTY+FOC · PRICE · VALUE</span></div>
    {pr.items.map((x, i) => <div key={i}><div className="rl sm"><span>{x.name}</span><span>{x.qty}{x.foc ? `+${x.foc}` : ''} · {x.price} · {Math.round(x.value)}</span></div>{x.reason !== 'No reason' && <div className="rc sm" style={{ textAlign: 'left' }}>({x.reason})</div>}</div>)}<hr />
    <div className="rl b"><span>Total Bill</span><span>{Math.round(pr.subtotal)}</span></div>{pr.discount > 0 && <div className="rl sm"><span>Discount</span><span>{Math.round(pr.discount)}</span></div>}
    <div className="rl big"><span>Refund due</span><span>Rs {Math.round(pr.total)}</span></div><hr /><div className="rc sm">Stock sent back · {pr.user}</div></div>;
}
const PREASONS = ['No reason', 'Expired', 'Damaged', 'Wrong item', 'Customer changed mind', 'Other'];

function PurchaseInvoice({ onClose, ret }) {
  const pfx = ret ? 'PR' : 'PI', endpoint = ret ? 'preturns' : 'purchases';
  const [prods, setProds] = useState([]), [shop, setShop] = useState({}), [past, setPast] = useState([]), [prets, setPrets] = useState([]), [vch, setVch] = useState([]);
  const [type, setType] = useState('CREDIT'), [supplier, setSupplier] = useState(''), [inv, setInv] = useState(''), [remarks, setRemarks] = useState(''), [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState([]), [row, setRow] = useState(-1), [editAt, setEditAt] = useState(null), [d1, setD1] = useState(''), [d2, setD2] = useState(''), [exp, setExp] = useState('');
  const [code, setCode] = useState(''), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [foc, setFoc] = useState(0), [price, setPrice] = useState(0), [disc, setDisc] = useState(0), [sale, setSale] = useState(0), [reason, setReason] = useState('No reason'), [hi, setHi] = useState(0);
  const [cat, setCat] = useState(false), [cq, setCq] = useState(''), [msg, setMsg] = useState(null), [pr, setPr] = useState(null), [busy, setBusy] = useState(false);
  const codeRef = useRef(), nameRef = useRef(), qtyRef = useRef(), supRef = useRef(), listRef = useRef();
  const arr = (r) => (Array.isArray(r) ? r : []);
  const load = () => { api('vouchers').then((r) => setVch(arr(r))); api('products').then((r) => setProds(arr(r).filter((p) => p.active !== false))); api('purchases').then((r) => setPast(arr(r))); api('preturns').then((r) => setPrets(arr(r))); api('settings').then((a) => setShop(arr(a).find((x) => x.id === 'shop') || {})); };
  useEffect(() => { load(); codeRef.current?.focus(); }, []);
  const till = shop.till || 'T11', gst = ret ? 0 : Math.max(0, +shop.gst || 0), mine = ret ? prets : past, re = new RegExp(`-${pfx}-(\\d+)$`);
  const no = `${till}-${pfx}-${String(Math.max(0, ...mine.map((p) => +(re.exec(p.purchaseNo || p.returnNo || '')?.[1] || 0))) + 1).padStart(5, '0')}`;
  const val = (x) => x.qty * x.price * (1 - (x.disc || 0) / 100);
  const sub = lines.reduce((t, x) => t + val(x), 0), units = lines.reduce((t, x) => t + x.qty + (x.foc || 0), 0);
  let a1, a2, ex, g, payable;
  if (ret) { a1 = Math.min(+d1 || 0, sub); a2 = Math.min(100, Math.max(0, +d2 || 0)); ex = 0; g = 0; payable = Math.max(0, sub - a1 - ((sub - a1) * a2) / 100); }
  else { a1 = Math.min(+d1 || 0, sub); a2 = Math.min(+d2 || 0, sub - a1); ex = Math.max(0, +exp || 0); g = ((sub - a1 - a2) * gst) / 100; payable = Math.max(0, sub - a1 - a2 + g + ex); }
  const sup = supplier.trim(), owed = sup ? past.filter((p) => p.supplier === sup).reduce((t, p) => t + (p.balance || 0), 0) - prets.filter((p) => p.supplier === sup && p.type === 'CREDIT').reduce((t, p) => t + p.total, 0) - vadj(vch, sup) : 0;
  const payTotal = ret ? (type === 'CREDIT' ? owed - payable : owed) : (type === 'CREDIT' ? owed + payable : payable);
  const suppliers = [...new Set([...prods.map((p) => p.supplier), ...past.map((p) => p.supplier)].filter((s) => s && s !== '(cash purchase)'))].sort();
  const hits = name && !sel ? prods.filter((p) => (p.name + ' ' + (p.code || '') + ' ' + (p.barcode || '')).toLowerCase().includes(name.toLowerCase())).slice(0, 8) : [];
  const entryVal = (+qty || 0) * (+price || 0) * (1 - (+disc || 0) / 100);
  const avg = sel ? ((sel.stock || 0) * (sel.costPrice || 0) + entryVal) / Math.max(1, (sel.stock || 0) + (+qty || 0) + (+foc || 0)) : null;
  const pick = (p) => { setSel(p); setName(p.name); setCode(p.barcode || ''); setPrice(p.costPrice || 0); setSale(p.salePrice || 0); setDisc(0); setQty(1); setFoc(0); setReason('No reason'); setMsg(null); setCat(false); setTimeout(() => qtyRef.current?.select(), 0); };
  const clearEntry = () => { setEditAt(null); setSel(null); setName(''); setCode(''); setQty(1); setFoc(0); setPrice(0); setDisc(0); setSale(0); setReason('No reason'); setHi(0); };
  const addLine = () => {
    if (!sel) return setMsg({ e: 'Pick a product first.' });
    const q = +qty, f = +foc || 0, r = +price, d = +disc || 0, s = +sale || 0;
    if (!(q > 0)) return setMsg({ e: 'Enter a quantity above zero.' });
    if (!(r >= 0) || price === '' || !(d >= 0 && d <= 100) || f < 0) return setMsg({ e: 'Check the price, discount and FOC.' });
    const L = { productId: sel.id, code: sel.barcode || sel.code || '', name: sel.name, qty: q, foc: f, price: r, disc: d, salePrice: s, reason };
    setLines((ls) => (editAt != null ? ls.map((l, i) => (i === editAt ? L : l)) : [...ls, L])); clearEntry(); setMsg(null); codeRef.current?.focus();
  };
  const scan = () => { const p = code && prods.find((x) => x.barcode === code || x.code === code || String(x.pid) === code || x.id === code); p ? pick(p) : setMsg({ e: 'No product with that barcode or ID.' }); };
  const edit = (i) => { const x = lines[i]; if (!x) return; setSel(prods.find((p) => p.id === x.productId) || { id: x.productId, name: x.name, stock: 0 }); setName(x.name); setCode(x.code); setQty(x.qty); setFoc(x.foc || 0); setPrice(x.price); setDisc(x.disc || 0); setSale(x.salePrice || 0); setReason(x.reason || 'No reason'); setEditAt(i); setMsg(null); setTimeout(() => qtyRef.current?.select(), 0); };
  const remove = (i) => { setLines((ls) => ls.filter((_, j) => j !== i)); setRow(Math.min(i, lines.length - 2)); if (editAt === i) clearEntry(); else if (editAt != null && editAt > i) setEditAt(editAt - 1); };
  const reset = (keepMsg) => { setLines([]); setRow(-1); clearEntry(); setSupplier(''); setInv(''); setRemarks(''); setD1(''); setD2(''); setExp(''); setType('CREDIT'); if (keepMsg !== true) setMsg(null); codeRef.current?.focus(); };
  const save = async (print) => {
    if (busy) return;
    if (!lines.length) return setMsg({ e: 'Add at least one item first.' });
    if (type === 'CREDIT' && !sup) { setMsg({ e: 'Choose the supplier whose account should be credited (or switch to CASH).' }); return supRef.current?.focus(); }
    setBusy(true); const r = await api(endpoint, 'POST', ret ? { type, supplier: sup, invoiceNo: inv, date, remarks, discountRs: a1, discountPct: a2, items: lines } : { type, supplier: sup, invoiceNo: inv, date, remarks, discount1: a1, discount2: a2, expenses: ex, items: lines }); setBusy(false);
    if (r.error) return setMsg({ e: r.error });
    if (print) { setPr(r); setTimeout(() => { window.print(); setPr(null); }, 150); }
    reset(true); setMsg({ ok: `Saved ${r.purchaseNo || r.returnNo} · ${ret ? 'refund due' : 'payable'} ${rs2(r.total)} · stock ${ret ? 'sent back' : 'updated'}` }); load();
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
  const fld = (l, el, w) => <div className="ef" style={w ? { width: w, flex: 'none' } : undefined}><label>{l}</label>{el}</div>;
  const enter = (e) => e.key === 'Enter' && sel && addLine();
  const info = (l, v) => <div className="pinfo"><label>{l}</label><input readOnly value={v} /></div>;
  return <>
    <h2 className="ptitle">Purchase {ret ? 'Return' : ''} No. {no}</h2>
    <div className="inv">
      <p className="hint"><kbd>↑↓</kbd> move · <kbd>Enter</kbd> change an item · <kbd>Del</kbd> remove · <kbd>{KEYS.save}</kbd> save · {ret ? 'stock goes back to the supplier' : 'stock comes in, the supplier gets paid or credited'}</p>
      <div className="hdr">
        <div className="fl"><label>Type ({KEYS.pType})</label><button className={'typebtn ' + type} title={ret ? 'CASH: the supplier refunds cash. CREDIT: taken off what you owe them.' : 'CASH: paid now. CREDIT: added to what you owe the supplier.'} onClick={() => setType(type === 'CASH' ? 'CREDIT' : 'CASH')}>{type}<small>{KEYS.pType} to switch</small></button></div>
        <div className="fl"><label>Invoice No.</label><input placeholder="From their bill" value={inv} onChange={(e) => setInv(e.target.value)} /><label style={{ width: 'auto', marginLeft: 12 }}>Invoice Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200 }} /></div>
        <div className="fl"><label>Supplier ({KEYS.supplier})</label><input ref={supRef} list="sups" placeholder="Title of account" value={supplier} onChange={(e) => setSupplier(e.target.value)} /><datalist id="sups">{suppliers.map((s) => <option key={s} value={s} />)}</datalist></div>
        <div className="fl"><label>Remarks</label><input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
      </div>
      <div className="entry2">
        <div className="er1">
          {fld(`ID / BARCODE (${KEYS.barcode})`, <input ref={codeRef} className="mono" placeholder="Scan or ID" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />, 170)}
          <div className="ef pname"><label>PRODUCT NAME</label>
            <input ref={nameRef} className="pn" title={name} placeholder="Type the product name" value={name} onChange={(e) => { setName(e.target.value); setSel(null); setHi(0); }} onKeyDown={(e) => {
              if (!hits.length) { if (e.key === 'ArrowDown' && lines.length && !name) { e.preventDefault(); setRow(0); listRef.current?.focus(); } return; }
              if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % hits.length); } else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + hits.length) % hits.length); }
              else if (e.key === 'Enter') { e.preventDefault(); pick(hits[Math.min(hi, hits.length - 1)]); } else if (e.key === 'Escape') { e.stopPropagation(); setName(''); } }} />
            {hits.length > 0 && <div className="hits wide">{hits.map((p, i) => <div key={p.id} className={'hit' + (i === hi ? ' on' : '')} onMouseDown={() => pick(p)}><span>{p.name}</span><small>stock {p.stock} {p.unit}</small></div>)}</div>}</div>
          <button className="catbtn" onClick={() => setCat(true)}><Ico n="box" s={15} /> Catalogue ({KEYS.catalogue})</button>
        </div>
        <div className="er2">
          {fld('QTY', <input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={enter} />, 90)}
          {fld('FOC', <input type="number" min="0" value={foc} onChange={(e) => setFoc(e.target.value)} onKeyDown={enter} />, 80)}
          {fld('PRICE', <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={enter} />, 120)}
          {fld('DISC %', <input type="number" min="0" max="100" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={enter} />, 90)}
          {fld('NET VALUE', <input readOnly value={'Rs ' + rs2(entryVal).replace('Rs ', '')} style={{ textAlign: 'right', fontWeight: 700 }} />, 130)}
          {fld('SALE PRICE', <input type="number" min="0" value={sale} onChange={(e) => setSale(e.target.value)} onKeyDown={enter} />, 120)}
          {ret && fld('REASON', <select value={reason} onChange={(e) => setReason(e.target.value)}>{PREASONS.map((r) => <option key={r}>{r}</option>)}</select>, 210)}
          <button className="pri addb" onClick={addLine}>{editAt != null ? 'Update' : 'Add'}</button>
        </div>
      </div>
      <div className="rlines" tabIndex="0" ref={listRef} onKeyDown={listKey}>
        <table style={{ width: '100%' }} className="ptab2"><thead><tr><th>SR</th><th>SKU/CODE</th><th className="descc">DESCRIPTION</th><th className="num">QTY</th><th className="num">FOC</th><th className="num">PRICE</th><th className="num">DISC</th><th className="num">VALUE</th><th className="num">S/RATE</th>{ret && <th>REASON</th>}<th></th></tr></thead>
          <tbody>{lines.length === 0 && <tr><td colSpan={ret ? 11 : 10} className="empty"><Ico n="truck" s={30} /><br />No items yet. Scan or type the items on their bill; choose the supplier ({KEYS.supplier}) any time before saving.</td></tr>}
            {lines.map((x, i) => <tr key={i} className={(i === row ? 'sel ' : '') + (i === editAt ? 'editing' : '')} onClick={() => { setRow(i); listRef.current?.focus(); }} onDoubleClick={() => edit(i)}>
              <td>{i + 1}</td><td className="mono">{x.code}</td><td className="descc"><b>{x.name}</b></td><td className="num">{qf(x.qty)}</td><td className="num">{x.foc || 0}</td><td className="num">{rs2(x.price).replace('Rs ', '')}</td><td className="num">{x.disc || 0}</td><td className="num">{rs2(val(x)).replace('Rs ', '')}</td><td className="num">{x.salePrice ? rs2(x.salePrice).replace('Rs ', '') : '—'}</td>{ret && <td>{x.reason}</td>}
              <td><button title="Remove (Del)" aria-label={`Remove ${x.name}`} onClick={(e) => { e.stopPropagation(); remove(i); }}><Ico n="x" s={12} /></button></td></tr>)}</tbody></table>
      </div>
      <div className="status"><span>{lines.length} items · {units} units</span>{gst > 0 && <span>GST {gst}% is added to the bill</span>}</div>
      <div className="bottom">
        <div className="bl">
          <div><span>Prev. Bal.</span><i>Rs {rs2(owed).replace('Rs ', '')}</i></div><div><span>This Bill</span><i>Rs {rs2(payable).replace('Rs ', '')}</i></div>
          <div><span>Payable</span><i className="pay">Rs {rs2(payTotal).replace('Rs ', '')}</i></div>
          <div className="pinfos">{info('Stock', sel ? `${sel.stock ?? 0} ${sel.unit || ''}` : '—')}{info(`Price + GST${gst ? ' ' + gst + '%' : ''}`, sel ? rs2((+price || 0) * (1 + gst / 100)).replace('Rs ', '') : '—')}{info('Avg. Price', avg == null ? '—' : rs2(avg).replace('Rs ', ''))}{info('FOC Ratio', +foc > 0 && +qty > 0 ? `${foc} : ${qty}` : '—')}</div>
        </div>
        <div className="br">
          <div><span className="red">TOTAL BILL</span><i>Rs {rs2(sub).replace('Rs ', '')}</i></div>
          {ret ? <>
            <div><span>DISC (RS)</span><input type="number" min="0" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} /></div>
            <div><span>DISC (%)</span><input type="number" min="0" max="100" value={d2} placeholder="0.00" onChange={(e) => setD2(e.target.value)} /></div>
            <div><span>REFUND DUE</span><i className="net">{rs2(payable).replace('Rs ', '')}</i></div></> : <>
            <div><span>DISCOUNT-1</span><input type="number" min="0" value={d1} placeholder="0.00" onChange={(e) => setD1(e.target.value)} /></div>
            <div><span>DISCOUNT-2</span><input type="number" min="0" value={d2} placeholder="0.00" onChange={(e) => setD2(e.target.value)} /></div>
            {gst > 0 && <div><span>GST {gst}%</span><i>Rs {rs2(g).replace('Rs ', '')}</i></div>}
            <div><span className="red">EXPENSES</span><input type="number" min="0" value={exp} placeholder="0.00" onChange={(e) => setExp(e.target.value)} /></div>
            <div><span>PAYABLE</span><i className="net">{rs2(payable).replace('Rs ', '')}</i></div></>}
        </div>
      </div>
      <div className="btns"><button onClick={() => reset()}>Clear <kbd>{KEYS.clear}</kbd></button><button disabled={!lines.length || busy} onClick={() => save(true)}><Ico n="print" s={15} /> Save & Print <kbd>{KEYS.savePrint}</kbd></button><button className="pri" disabled={!lines.length || busy} onClick={() => save(false)}>Save <kbd>{KEYS.save}</kbd></button><button onClick={onClose}>Close</button></div>
      {msg && <p className={msg.e ? 'rerr' : 'ok'} role={msg.e ? 'alert' : undefined}>{msg.e || msg.ok}</p>}
    </div>
    {cat && <div className="modal" onClick={() => setCat(false)}><div className="mbox wide" onClick={(e) => e.stopPropagation()}><b>Product Catalogue</b><input autoFocus placeholder="Search products" value={cq} onChange={(e) => setCq(e.target.value)} />
      <div className="mlist">{prods.filter((p) => p.name.toLowerCase().includes(cq.toLowerCase())).map((p) => <div key={p.id} className="hit cat" onClick={() => { pick(p); setCq(''); }}><span>{p.name}</span><small>cost {rs(p.costPrice || 0)} · stock {p.stock} {p.unit}</small></div>)}</div></div></div>}
    {pr && (ret ? <PurchaseReturnReceipt pr={pr} shop={shop} /> : <PurchaseReceipt pr={pr} shop={shop} />)}
  </>;
}
const PurchaseReturnScreen = (p) => <PurchaseInvoice {...p} ret />;

// Purchase History and Purchase Return History share one layout
function PurHistory({ ret }) {
  const kind = ret ? 'preturns' : 'purchases', today = ld(new Date());
  const [all, setAll] = useState([]), [shop, setShop] = useState({}), [q, setQ] = useState(''), [det, setDet] = useState(null), [pdf, setPdf] = useState(false), [page, setPage] = useState(0), [chip, setChip] = useState('30 days'), [pr, setPr] = useState(null);
  const range = (n) => [addDays(today, -n), today];
  const [[from, to], setR] = useState(range(29));
  const load = () => { api(kind).then((a) => setAll(Array.isArray(a) ? a : [])); api('settings').then((a) => setShop((Array.isArray(a) && a.find((x) => x.id === 'shop')) || {})); };
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const chips = rangeChips(), pick = (k) => { setChip(k); setPage(0); setR(chips[k]); };
  const noOf = (p) => p.returnNo || p.purchaseNo, tType = (p) => p.type || 'CASH', disc = (p) => (ret ? p.discount || 0 : (p.discount1 || 0) + (p.discount2 || 0));
  const rows = all.filter((p) => p.date >= from && p.date <= to && (noOf(p) + ' ' + p.supplier + ' ' + (p.invoiceNo || '')).toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  const pages = Math.max(1, Math.ceil(rows.length / PER)), pg = Math.min(page, pages - 1), shown = rows.slice(pg * PER, pg * PER + PER);
  const T = rows.reduce((t, p) => ({ g: t.g + p.subtotal, d: t.d + disc(p), e: t.e + (p.expenses || 0), n: t.n + p.total }), { g: 0, d: 0, e: 0, n: 0 });
  const title = ret ? 'Purchase Return History' : 'Purchase History', last = ret ? 'REFUND' : 'PAYABLE';
  const csv = () => {
    const t = [`${ret ? 'Return' : 'Voucher'},Date,Type,Supplier,Bill #,Items,Gross,Discount,${ret ? '' : 'Expenses,'}${ret ? 'Refund' : 'Payable'},User`, ...rows.map((p) => [noOf(p), p.date, tType(p), p.supplier, p.invoiceNo || '', p.items.length, p.subtotal, disc(p), ...(ret ? [] : [p.expenses || 0]), p.total, p.user].map((v) => `"${v}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = (ret ? 'purchase-return-history' : 'purchase-history') + '.csv'; a.click();
  };
  const head = <tr><th>{ret ? 'RETURN #' : 'VOUCHER #'}</th><th>DATE</th><th>TYPE</th><th>SUPPLIER</th><th>BILL #</th><th className="num">ITEMS</th><th className="num">GROSS</th><th className="num">DISC</th>{!ret && <th className="num">EXPENSES</th>}<th className="num">{last}</th><th>USER</th></tr>;
  const line = (p) => <><td className="mono">{noOf(p)}</td><td>{p.date}</td><td><span className={'tag ' + (tType(p) === 'CASH' ? 'Create' : 'Credit')}>{tType(p) === 'CASH' ? 'Cash' : 'Credit'}</span></td><td className="wrapc">{p.supplier}</td><td>{p.invoiceNo}</td><td className="num">{p.items.length}</td><td className="num">{n2(p.subtotal)}</td><td className="num">{n2(disc(p))}</td>{!ret && <td className="num">{n2(p.expenses || 0)}</td>}<td className="num"><b>{n2(p.total)}</b></td><td>{p.user}</td></>;
  const ncols = ret ? 10 : 11;
  const doPrint = (x) => { setPr(x); setTimeout(() => { window.print(); setPr(null); }, 150); };
  return <div className="phist">
    <div className="phtools"><button disabled={!rows.length} onClick={csv}><Ico n="down" s={15} /> CSV</button><button className="pdfb" onClick={() => setPdf(true)}><Ico n="file" s={15} /> View in PDF Mode</button><button disabled={!rows.length} onClick={() => { setPdf(true); setTimeout(() => window.print(), 250); }}><Ico n="print" s={15} /> Print</button></div>
    <div className="card phcard">
      <div className="phbar">
        <div className="dpill"><Ico n="cal" s={16} /><input type="date" aria-label="From date" value={from} onChange={(e) => { setR([e.target.value, to]); setChip(''); setPage(0); }} /><span>→</span><input type="date" aria-label="To date" value={to} onChange={(e) => { setR([from, e.target.value]); setChip(''); setPage(0); }} /></div>
        <div className="chips">{Object.keys(chips).map((k) => <button key={k} className={'chip sq' + (chip === k ? ' on' : '')} onClick={() => pick(k)}>{k}</button>)}</div>
        <div className="phsearch"><Ico n="search" s={16} className="gsi" /><input placeholder="Supplier / party name, voucher or bill #" aria-label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      </div>
      {rows.length === 0 ? <div className="phempty"><Ico n="clip" s={34} /><b>Nothing in this range</b></div> : <>
        <div className="phscroll"><table className="phtable"><thead>{head}</thead><tbody>{shown.map((p) => <tr key={p.id} onClick={() => setDet(p)}>{line(p)}</tr>)}</tbody></table></div>
        <div className="grand"><span>Total {ret ? 'Returns' : 'Purchases'}: {rows.length}</span><span className="grow" /><b>GRAND TOTAL</b><span>{n2(T.g)}</span><span>{n2(T.d)}</span>{!ret && <span>{n2(T.e)}</span>}<span>{n2(T.n)}</span></div>
        <div className="phpage"><small>Showing {pg * PER + 1}–{pg * PER + shown.length} of {rows.length}</small><span className="grow" /><button disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button><b>Page {pg + 1} of {pages}</b><button disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}>Next</button></div></>}
    </div>
    {det && <div className="modal" onClick={() => setDet(null)}><div className="mbox wide" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}><div className="mhead"><b className="mono" style={{ fontSize: 18 }}>{noOf(det)}</b><button className="px" aria-label="Close" onClick={() => setDet(null)}><Ico n="x" s={14} /></button></div>
      <p style={{ margin: 0 }}>{det.date} · {tType(det) === 'CASH' ? 'Cash' : 'Credit'} · {det.supplier}{det.invoiceNo && ` · their bill ${det.invoiceNo}`} · by {det.user}</p>{det.remarks && <p style={{ margin: 0 }}>Remarks: {det.remarks}</p>}
      <table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">FOC</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">VALUE</th>{ret && <th>REASON</th>}</tr></thead>
        <tbody>{det.items.map((x, i) => <tr key={i}><td>{i + 1}</td><td className="wrapc">{x.name}</td><td className="num">{qf(x.qty)}</td><td className="num">{x.foc || 0}</td><td className="num">{n2(x.price ?? x.cost)}</td><td className="num">{x.disc || 0}</td><td className="num">{n2(x.value ?? x.qty * x.cost)}</td>{ret && <td>{x.reason}</td>}</tr>)}</tbody></table>
      <div className="dtot"><div><span>Total Bill</span><i>{n2(det.subtotal)}</i></div>{ret ? <><div><span>Disc (Rs)</span><i>{n2(det.discountRs || 0)}</i></div><div><span>Disc (%)</span><i>{n2(det.discountPct || 0)}</i></div></> : <><div><span>Discount-1</span><i>{n2(det.discount1 || 0)}</i></div><div><span>Discount-2</span><i>{n2(det.discount2 || 0)}</i></div>{det.gst > 0 && <div><span>GST {det.gstPct}%</span><i>{n2(det.gst)}</i></div>}<div><span>Expenses</span><i>{n2(det.expenses || 0)}</i></div></>}<div className="b"><span>{ret ? 'Refund due' : 'Payable'}</span><i>{n2(det.total)}</i></div></div>
      <div className="btns" style={{ justifyContent: 'flex-end' }}><button onClick={() => doPrint(det)}><Ico n="print" s={15} /> Print</button><button className="pri" onClick={() => setDet(null)}>Done</button></div></div></div>}
    {pdf && <div className="preport"><div className="preport-bar"><b>{title} · PDF mode</b><span className="grow" /><button className="pri" onClick={() => window.print()}><Ico n="print" s={15} /> Print / Save as PDF</button><button onClick={() => setPdf(false)}>Close</button></div>
      <div className="preport-page"><h2 style={{ margin: 0 }}>{shop.name || title}</h2><div style={{ color: '#556', marginBottom: 8 }}>{title} · {from} to {to}{q && ` · "${q}"`}</div>
        <table style={{ width: '100%' }}><thead>{head}</thead><tbody>{rows.map((p) => <tr key={p.id}>{line(p)}</tr>)}</tbody><tfoot><tr><td colSpan="6"><b>Total ({rows.length})</b></td><td className="num"><b>{n2(T.g)}</b></td><td className="num"><b>{n2(T.d)}</b></td>{!ret && <td className="num"><b>{n2(T.e)}</b></td>}<td className="num"><b>{n2(T.n)}</b></td><td></td></tr></tfoot></table></div></div>}
    {pr && (ret ? <PurchaseReturnReceipt pr={pr} shop={shop} /> : <PurchaseReceipt pr={pr} shop={shop} />)}
  </div>;
}
const PurchaseHistory = () => <PurHistory />;
const PurchaseReturnHistory = () => <PurHistory ret />;

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

// ---------- Reports: shared pieces ----------
const qf = (v) => (v === '' || v == null ? '' : Number.isInteger(+v) ? String(+v) : String(+(+v).toFixed(3)));
const dd = (s) => (s ? s.slice(8, 10) + '-' + s.slice(5, 7) + '-' + s.slice(2, 4) : '');
const cellText = (c, v) => (v == null || v === '' ? '' : c.n === 'm' ? n2(v) : c.n === 'q' ? qf(v) : c.n === 'p' ? (+v).toFixed(1) + '%' : c.n === 'i' ? Math.round(v).toLocaleString() : v);
const sumRows = (rows, ks) => Object.fromEntries(ks.map((k) => [k, rows.filter((r) => !r._h && !r._t).reduce((t, r) => t + (+r[k] || 0), 0)]));
function useData(extra = []) {
  const [D, setD] = useState(null);
  const load = () => Promise.all(['sales', 'returns', 'products', 'purchases', 'vouchers', 'settings', 'accounts', 'preturns', ...extra].map((c) => api(c))).then((r) => { const a = (x) => (Array.isArray(x) ? x : []); setD({ sales: a(r[0]), returns: a(r[1]), products: a(r[2]), purchases: a(r[3]), vouchers: a(r[4]), settings: a(r[5]), accounts: a(r[6]), preturns: a(r[7]) }); });
  useEffect(() => { load(); const k = (e) => { if (acts(e).includes('refresh')) { e.preventDefault(); load(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return [D, load];
}
function RTable({ cols, rows, grand, cls }) {
  return <table className={'rt ' + (cls || '')}><thead><tr>{cols.map((c) => <th key={c.k} className={c.n ? 'num' : ''}>{c.t}</th>)}</tr></thead>
    <tbody>{rows.length === 0 && <tr><td colSpan={cols.length} className="empty">Nothing to show for this selection.</td></tr>}
      {rows.map((r, i) => (r._h ? <tr key={i} className="rgh"><td colSpan={cols.length}>{r._h}</td></tr> : <tr key={i} className={r._t ? 'rst' : ''}>{cols.map((c) => <td key={c.k} className={c.n ? 'num' : ''}>{cellText(c, r[c.k])}</td>)}</tr>))}
      {grand && rows.length > 0 && <tr className="rgt">{cols.map((c, i) => <td key={c.k} className={c.n ? 'num' : ''}>{i === 0 ? 'GRAND TOTAL' : cellText(c, grand[c.k])}</td>)}</tr>}</tbody></table>;
}
function PdfView({ title, sub, shop, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return <div className="preport"><div className="preport-bar"><b>{title} · PDF mode</b><span className="grow" /><button className="pri" onClick={() => window.print()}><Ico n="print" s={15} /> Print / Save as PDF</button><button onClick={onClose}>Close</button></div>
    <div className="preport-page"><h2 style={{ margin: 0 }}>{shop?.name || ''}</h2><h3 style={{ margin: '2px 0 2px' }}>{title}</h3><div style={{ color: '#556', marginBottom: 10 }}>{sub}</div>{children}</div></div>;
}
function csvDownload(name, cols, rows, grand) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`, body = rows.filter((r) => !r._h).map((r) => cols.map((c) => q(r[c.k] ?? '')).join(','));
  if (grand) body.push(cols.map((c, i) => q(i === 0 ? 'GRAND TOTAL' : grand[c.k] ?? '')).join(','));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([[cols.map((c) => q(c.t)).join(','), ...body].join('\n')])); a.download = name + '.csv'; a.click();
}
function ActionBar({ onCsv, onPdf, onPrint, onClose, onRefresh, children }) {
  return <div className="btns">{children}{onRefresh && <button onClick={onRefresh}><Ico n="refresh" s={15} /> Refresh <kbd>{KEYS.refresh}</kbd></button>}{onCsv && <button onClick={onCsv}><Ico n="down" s={15} /> CSV</button>}
    <button onClick={onPdf}><Ico n="file" s={15} /> View in PDF Mode</button><button onClick={onPrint}><Ico n="print" s={15} /> Print</button><button onClick={onClose}>Close</button></div>;
}
const rangeChips = (setR, today = ld(new Date())) => ({ Today: [today, today], Yesterday: [addDays(today, -1), addDays(today, -1)], '7 days': [addDays(today, -6), today], '30 days': [addDays(today, -29), today], 'This month': [today.slice(0, 8) + '01', today] });

// ---------- Reports: numbers ----------
function mkCtx(D) {
  const pm = {}; for (const p of D.products) pm[p.id] = p;
  const shop = D.settings.find((x) => x.id === 'shop') || {}, sales = D.sales.filter((s) => !s.voided);
  const acc = {}; for (const p of D.purchases) for (const it of p.items) { const u = it.qty + (it.foc || 0); if (u) { const e = (acc[it.productId] ||= { v: 0, u: 0 }); e.v += it.value ?? it.qty * (it.price ?? it.cost ?? 0); e.u += u; } }
  const avgCost = {}; for (const k in acc) avgCost[k] = acc[k].v / acc[k].u;
  const lastCost = {}; [...D.purchases].sort((x, y) => ((x.date || '') + x.createdAt).localeCompare((y.date || '') + y.createdAt)).forEach((p) => p.items.forEach((it) => { const u = it.qty + (it.foc || 0); if (u) lastCost[it.productId] = (it.value ?? it.qty * (it.price ?? it.cost ?? 0)) / u; }));
  const cost = (id) => +pm[id]?.costPrice || 0, f = (s) => (s.subtotal ? s.total / s.subtotal : 1), net = (x, s) => x.qty * x.rate * (1 - (x.disc || 0) / 100) * f(s), inR = (d, a, b) => d >= a && d <= b;
  const pday = (p) => p.date || ld(new Date(p.createdAt));
  const PR = (a, b) => D.preturns.filter((p) => inR(pday(p), a, b));
  const S = (a, b) => sales.filter((s) => inR(sday(s), a, b)), R = (a, b) => D.returns.filter((r) => inR(sday(r), a, b)), P = (a, b) => D.purchases.filter((p) => inR(pday(p), a, b)), V = (a, b) => D.vouchers.filter((v) => inR(v.date, a, b));
  const meta = (id, fb) => { const p = pm[id]; return { company: p?.company || '(none)', category: p?.category || '(none)', code: p?.barcode || p?.code || '', name: p?.name || fb }; };
  const gross = (s) => s.items.reduce((t, x) => t + x.qty * x.rate, 0);
  const cashRows = () => { // same rules as the Cash Book
    const rows = []; const by = {}, add = (k, d, r, p) => { (by[k + d] ||= (rows.push({ date: d, receipt: 0, payment: 0 }), rows[rows.length - 1])); by[k + d].receipt += r; by[k + d].payment += p; };
    for (const s of sales) add('S', sday(s), Math.min(+s.paid || 0, +s.total || 0), 0);
    for (const r of D.returns) if (r.type === 'CASH') add('R', sday(r), 0, +r.total || 0);
    for (const p of D.purchases) if (p.type === 'CASH') add('P', pday(p), 0, +p.total || 0);
    for (const r of D.preturns) if (r.type === 'CASH') add('X', pday(r), +r.total || 0, 0);
    for (const v of D.vouchers) for (const l of v.lines || []) rows.push({ date: v.date, receipt: v.kind === 'RECEIPT' ? l.amount : 0, payment: v.kind === 'PAYMENT' ? l.amount : 0 });
    return rows;
  };
  const cashOpen = (a) => cashRows().filter((r) => r.date < a).reduce((t, r) => t + r.receipt - r.payment, +shop.openingCash || 0);
  const mov = (a, b) => {
    const m = {}, g = (id) => (m[id] ||= { purchased: 0, sold: 0, returned: 0, pa: 0, sa: 0, ra: 0 });
    for (const p of D.purchases) { const d = pday(p); for (const it of p.items) { const q = it.qty + (it.foc || 0); if (d > b) g(it.productId).pa += q; else if (d >= a) g(it.productId).purchased += q; } }
    for (const r of D.preturns) { const d = pday(r); for (const it of r.items) { const q = -(it.qty + (it.foc || 0)); if (d > b) g(it.productId).pa += q; else if (d >= a) g(it.productId).purchased += q; } }
    for (const s of sales) { const d = sday(s); for (const it of s.items) if (it.taken !== false) { if (d > b) g(it.productId).sa += it.qty; else if (d >= a) g(it.productId).sold += it.qty; } }
    for (const r of D.returns) { const d = sday(r); for (const it of r.items || []) if (it.taken !== false) { if (d > b) g(it.productId).ra += it.qty; else if (d >= a) g(it.productId).returned += it.qty; } }
    return D.products.filter((p) => p.active !== false).map((p) => { const x = m[p.id] || { purchased: 0, sold: 0, returned: 0, pa: 0, sa: 0, ra: 0 }, closing = (+p.stock || 0) - (x.pa + x.ra - x.sa);
      return { ...meta(p.id, p.name), id: p.id, cost: +p.costPrice || 0, sale: +p.salePrice || 0, purchased: x.purchased, sold: x.sold, returned: x.returned, closing, opening: closing - x.purchased - x.returned + x.sold }; });
  };
  const prodX = (kind, a, b) => { const m = {}, put = (id, name, qty, amt) => { const e = (m[id || name] ||= { id, name, qty: 0, net: 0 }); e.qty += qty; e.net += amt; };
    if (kind === 'sales') for (const s of S(a, b)) for (const x of s.items) put(x.productId, x.name, x.qty, net(x, s));
    if (kind === 'purchases') for (const p of P(a, b)) for (const x of p.items) put(x.productId, x.name, x.qty + (x.foc || 0), x.value ?? x.qty * (x.cost ?? 0));
    if (kind === 'returns') for (const r of R(a, b)) for (const x of r.items || []) put(x.productId, x.name, x.qty, x.qty * x.rate * (1 - (x.disc || 0) / 100));
    if (kind === 'pret') for (const r of PR(a, b)) for (const x of r.items) put(x.productId, x.name, x.qty + (x.foc || 0), x.value);
    return Object.values(m).map((e) => ({ ...meta(e.id, e.name), id: e.id, qty: e.qty, net: e.net })); };
  return { D, pm, shop, sales, PR, avgCost, lastCost, cost, net, gross, S, R, P, V, meta, cashRows, cashOpen, mov, prodX, pday };
}
const byKey = (arr, kf) => { const m = {}; for (const x of arr) (m[kf(x)] ||= []).push(x); return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])); };
const daysIn = (a, b) => Array.from({ length: Math.min(400, diffDays(a, b) + 1) }, (_, i) => addDays(a, i));
const periodCols = (...x) => [{ k: 'date', t: 'DATE' }, ...x];

// 28 reports. build(C, {from,to}) -> { cols, rows, grand?, note? }
const REPORTS = [
  { id: 'd-sales', g: 'DAILY REPORTS', t: 'Daily Sales Report', mode: 'day', build: (C, p) => { const rows = C.S(p.from, p.to).map((s) => { const g = C.gross(s); return { no: s.billNo, time: new Date(s.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), cust: s.customer, type: s.type, items: s.items.length, gross: g, disc: g - s.total, net: s.total, by: s.cashier }; });
    return { cols: [{ k: 'no', t: 'BILL #' }, { k: 'time', t: 'TIME' }, { k: 'cust', t: 'CUSTOMER' }, { k: 'type', t: 'TYPE' }, { k: 'items', t: 'ITEMS', n: 'i' }, { k: 'gross', t: 'GROSS', n: 'm' }, { k: 'disc', t: 'DISCOUNT', n: 'm' }, { k: 'net', t: 'NET', n: 'm' }, { k: 'by', t: 'USER' }], rows, grand: sumRows(rows, ['items', 'gross', 'disc', 'net']) }; } },
  { id: 'd-purch', g: 'DAILY REPORTS', t: 'Daily Purchase Report', mode: 'day', build: (C, p) => { const rows = C.P(p.from, p.to).map((x) => ({ no: x.purchaseNo, sup: x.supplier, type: x.type || 'CASH', bill: x.invoiceNo, items: x.items.length, total: x.total, by: x.user }));
    return { cols: [{ k: 'no', t: 'VOUCHER' }, { k: 'sup', t: 'SUPPLIER' }, { k: 'type', t: 'TYPE' }, { k: 'bill', t: 'THEIR BILL' }, { k: 'items', t: 'ITEMS', n: 'i' }, { k: 'total', t: 'TOTAL', n: 'm' }, { k: 'by', t: 'USER' }], rows, grand: sumRows(rows, ['items', 'total']) }; } },
  { id: 'd-sret', g: 'DAILY REPORTS', t: 'Daily Sales Return Report', mode: 'day', build: (C, p) => { const rows = C.R(p.from, p.to).map((r) => ({ no: r.returnNo, cust: r.customer, bill: r.billNo || '', type: r.type, items: (r.items || []).length, total: r.total, by: r.cashier }));
    return { cols: [{ k: 'no', t: 'RETURN #' }, { k: 'cust', t: 'CUSTOMER' }, { k: 'bill', t: 'AGAINST BILL' }, { k: 'type', t: 'TYPE' }, { k: 'items', t: 'ITEMS', n: 'i' }, { k: 'total', t: 'REFUND', n: 'm' }, { k: 'by', t: 'USER' }], rows, grand: sumRows(rows, ['items', 'total']) }; } },
  { id: 'd-pret', g: 'DAILY REPORTS', t: 'Daily Purchase Return Report', mode: 'day', build: (C, p) => { const rows = C.PR(p.from, p.to).map((x) => ({ no: x.returnNo, sup: x.supplier, type: x.type, bill: x.invoiceNo, items: x.items.length, total: x.total, by: x.user }));
    return { cols: [{ k: 'no', t: 'RETURN #' }, { k: 'sup', t: 'SUPPLIER' }, { k: 'type', t: 'TYPE' }, { k: 'bill', t: 'THEIR BILL' }, { k: 'items', t: 'ITEMS', n: 'i' }, { k: 'total', t: 'REFUND', n: 'm' }, { k: 'by', t: 'USER' }], rows, grand: sumRows(rows, ['items', 'total']) }; } },
  { id: 'd-dayend', g: 'DAILY REPORTS', t: 'Day End Report', mode: 'day', build: (C, p) => dayEnd(C, p.from, p.to, false) },
  { id: 'd-price', g: 'DAILY REPORTS', t: 'Price Comparison Analysis', mode: 'asof', build: (C) => { const rows = C.D.products.filter((p) => p.active !== false).map((p) => { const c = +p.costPrice || 0, s = +p.salePrice || 0; return { code: p.barcode || p.code || '', name: p.name, cost: c, avg: C.avgCost[p.id] ?? '', last: C.lastCost[p.id] ?? '', sale: s, margin: s ? ((s - c) / s) * 100 : 0 }; }).sort((a, b) => a.margin - b.margin);
    return { cols: [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, { k: 'cost', t: 'COST', n: 'm' }, { k: 'avg', t: 'AVG BOUGHT', n: 'm' }, { k: 'last', t: 'LAST BOUGHT', n: 'm' }, { k: 'sale', t: 'SALE PRICE', n: 'm' }, { k: 'margin', t: 'MARGIN', n: 'p' }], rows, note: 'Lowest margins first.' }; } },
  { id: 'd-activity', g: 'DAILY REPORTS', t: 'Daily Business Activity Analysis', mode: 'day', build: (C, p) => { const rows = Array.from({ length: 24 }, (_, h) => { const ss = C.S(p.from, p.to).filter((s) => new Date(s.createdAt).getHours() === h), rr = C.R(p.from, p.to).filter((r) => new Date(r.createdAt).getHours() === h);
      return { hour: `${String(h).padStart(2, '0')}:00`, bills: ss.length, sales: ss.reduce((t, s) => t + s.total, 0), rets: rr.reduce((t, r) => t + r.total, 0), net: ss.reduce((t, s) => t + s.total, 0) - rr.reduce((t, r) => t + r.total, 0) }; }).filter((r) => r.bills || r.rets);
    return { cols: [{ k: 'hour', t: 'HOUR' }, { k: 'bills', t: 'BILLS', n: 'i' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'rets', t: 'RETURNS', n: 'm' }, { k: 'net', t: 'NET', n: 'm' }], rows, grand: sumRows(rows, ['bills', 'sales', 'rets', 'net']) }; } },
  { id: 's-cat', g: 'SALES REPORTS', t: 'Product Sales Summary Category Wise', mode: 'range', build: (C, p) => salesSummary(C, p, 'category') },
  { id: 's-prod', g: 'SALES REPORTS', t: 'Product Sales Summary Product Wise', mode: 'range', build: (C, p) => salesSummary(C, p, 'name') },
  { id: 's-mfr', g: 'SALES REPORTS', t: 'Product Sales Summary Manufacturer Based', mode: 'range', build: (C, p) => salesSummary(C, p, 'company') },
  { id: 'pu-mfr', g: 'PURCHASE REPORTS', t: 'Manufacturer Based Purchase Summary', mode: 'range', build: (C, p) => { const rows = byKey(C.prodX('purchases', p.from, p.to), (x) => x.company).map(([k, a]) => ({ company: k, items: a.length, qty: a.reduce((t, x) => t + x.qty, 0), net: a.reduce((t, x) => t + x.net, 0) }));
    return { cols: [{ k: 'company', t: 'MANUFACTURER' }, { k: 'items', t: 'ITEMS', n: 'i' }, { k: 'qty', t: 'QTY (WITH FOC)', n: 'q' }, { k: 'net', t: 'PURCHASED VALUE', n: 'm' }], rows, grand: sumRows(rows, ['items', 'qty', 'net']) }; } },
  { id: 'st-mfr', g: 'STOCK REPORTS', t: 'Stock Valuation Summary Manufacturer Wise', mode: 'asof', build: (C, p) => stockVal(C, p, 'mfr', false) },
  { id: 'st-all', g: 'STOCK REPORTS', t: 'Stock Valuation Summary Manufacturer, Category & Product Wise', mode: 'asof', build: (C, p) => stockVal(C, p, 'all', false) },
  { id: 'st-all-p', g: 'STOCK REPORTS', t: 'Stock Valuation Summary Manufacturer, Category & Product Wise (Periodic)', mode: 'range', build: (C, p) => stockVal(C, p, 'all', true) },
  { id: 'st-mfr-p', g: 'STOCK REPORTS', t: 'Stock Valuation Summary Manufacturer Wise (Periodic)', mode: 'range', build: (C, p) => stockVal(C, p, 'mfr', true) },
  { id: 'p-sales', g: 'PERIODIC REPORTS', t: 'Sales Summary Report', mode: 'range', build: (C, p) => { const rows = daysIn(p.from, p.to).map((d) => { const ss = C.S(d, d), g = ss.reduce((t, s) => t + C.gross(s), 0), tot = ss.reduce((t, s) => t + s.total, 0), ret = C.R(d, d).reduce((t, r) => t + r.total, 0);
      return { date: d, bills: ss.length, gross: g, disc: g - tot, ret, net: tot - ret, cash: ss.filter((s) => s.type !== 'CREDIT').reduce((t, s) => t + s.total, 0), credit: ss.filter((s) => s.type === 'CREDIT').reduce((t, s) => t + s.total, 0) }; }).filter((r) => r.bills || r.ret);
    return { cols: periodCols({ k: 'bills', t: 'BILLS', n: 'i' }, { k: 'gross', t: 'GROSS', n: 'm' }, { k: 'disc', t: 'DISCOUNTS', n: 'm' }, { k: 'ret', t: 'RETURNS', n: 'm' }, { k: 'net', t: 'NET SALES', n: 'm' }, { k: 'cash', t: 'CASH', n: 'm' }, { k: 'credit', t: 'CREDIT', n: 'm' }), rows, grand: sumRows(rows, ['bills', 'gross', 'disc', 'ret', 'net', 'cash', 'credit']) }; } },
  { id: 'p-purch', g: 'PERIODIC REPORTS', t: 'Purchase Summary Report', mode: 'range', build: (C, p) => { const rows = daysIn(p.from, p.to).map((d) => { const x = C.P(d, d); return { date: d, n: x.length, sub: x.reduce((t, y) => t + y.subtotal, 0), disc: x.reduce((t, y) => t + (y.discount1 || 0) + (y.discount2 || 0), 0), gst: x.reduce((t, y) => t + (y.gst || 0), 0), exp: x.reduce((t, y) => t + (y.expenses || 0), 0), total: x.reduce((t, y) => t + y.total, 0) }; }).filter((r) => r.n);
    return { cols: periodCols({ k: 'n', t: 'PURCHASES', n: 'i' }, { k: 'sub', t: 'GROSS', n: 'm' }, { k: 'disc', t: 'DISCOUNTS', n: 'm' }, { k: 'gst', t: 'GST', n: 'm' }, { k: 'exp', t: 'EXPENSES', n: 'm' }, { k: 'total', t: 'TOTAL', n: 'm' }), rows, grand: sumRows(rows, ['n', 'sub', 'disc', 'gst', 'exp', 'total']) }; } },
  { id: 'p-sret', g: 'PERIODIC REPORTS', t: 'Sales Return Summary Report', mode: 'range', build: (C, p) => { const rows = daysIn(p.from, p.to).map((d) => { const x = C.R(d, d); return { date: d, n: x.length, cash: x.filter((r) => r.type === 'CASH').reduce((t, r) => t + r.total, 0), credit: x.filter((r) => r.type === 'CREDIT').reduce((t, r) => t + r.total, 0), total: x.reduce((t, r) => t + r.total, 0) }; }).filter((r) => r.n);
    return { cols: periodCols({ k: 'n', t: 'RETURNS', n: 'i' }, { k: 'cash', t: 'CASH REFUNDS', n: 'm' }, { k: 'credit', t: 'CREDITED TO ACCOUNTS', n: 'm' }, { k: 'total', t: 'TOTAL', n: 'm' }), rows, grand: sumRows(rows, ['n', 'cash', 'credit', 'total']) }; } },
  { id: 'p-pret', g: 'PERIODIC REPORTS', t: 'Purchase Return Summary Report', mode: 'range', build: (C, p) => { const rows = daysIn(p.from, p.to).map((d) => { const x = C.PR(d, d); return { date: d, n: x.length, cash: x.filter((r) => r.type === 'CASH').reduce((t, r) => t + r.total, 0), credit: x.filter((r) => r.type === 'CREDIT').reduce((t, r) => t + r.total, 0), total: x.reduce((t, r) => t + r.total, 0) }; }).filter((r) => r.n);
    return { cols: periodCols({ k: 'n', t: 'RETURNS', n: 'i' }, { k: 'cash', t: 'CASH REFUNDS', n: 'm' }, { k: 'credit', t: 'CREDIT NOTES', n: 'm' }, { k: 'total', t: 'TOTAL', n: 'm' }), rows, grand: sumRows(rows, ['n', 'cash', 'credit', 'total']) }; } },
  { id: 'p-dayend', g: 'PERIODIC REPORTS', t: 'Day End Report Periodic', mode: 'range', build: (C, p) => dayEnd(C, p.from, p.to, true) },
  { id: 'p-activity', g: 'PERIODIC REPORTS', t: 'Business Activity Report Periodic', mode: 'range', build: (C, p) => { const rows = daysIn(p.from, p.to).map((d) => ({ date: d, bills: C.S(d, d).length, sales: C.S(d, d).reduce((t, s) => t + s.total, 0), rets: C.R(d, d).reduce((t, r) => t + r.total, 0), purch: C.P(d, d).reduce((t, x) => t + x.total, 0), pay: C.V(d, d).filter((v) => v.kind === 'PAYMENT').reduce((t, v) => t + v.total, 0), rec: C.V(d, d).filter((v) => v.kind === 'RECEIPT').reduce((t, v) => t + v.total, 0) })).filter((r) => r.bills || r.rets || r.purch || r.pay || r.rec);
    return { cols: periodCols({ k: 'bills', t: 'BILLS', n: 'i' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'rets', t: 'RETURNS', n: 'm' }, { k: 'purch', t: 'PURCHASES', n: 'm' }, { k: 'pay', t: 'PAYMENTS', n: 'm' }, { k: 'rec', t: 'RECEIPTS', n: 'm' }), rows, grand: sumRows(rows, ['bills', 'sales', 'rets', 'purch', 'pay', 'rec']) }; } },
  { id: 'f-inv', g: 'FINANCIAL REPORTS', t: 'Invoice Based Profit/Loss', mode: 'range', build: (C, p) => { const rows = C.S(p.from, p.to).map((s) => { const c = s.items.reduce((t, x) => t + C.cost(x.productId) * x.qty, 0); return { no: s.billNo, date: sday(s), cust: s.customer, sales: s.total, cost: c, profit: s.total - c, pct: s.total ? ((s.total - c) / s.total) * 100 : 0 }; });
    return { cols: [{ k: 'no', t: 'BILL #' }, { k: 'date', t: 'DATE' }, { k: 'cust', t: 'CUSTOMER' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'cost', t: 'COST', n: 'm' }, { k: 'profit', t: 'PROFIT', n: 'm' }, { k: 'pct', t: 'MARGIN', n: 'p' }], rows, grand: { ...sumRows(rows, ['sales', 'cost', 'profit']), pct: 0 }, note: 'Cost uses each product’s current cost price.' }; } },
  { id: 'f-invd', g: 'FINANCIAL REPORTS', t: 'Invoice Based Profit/Loss Detailed Report', mode: 'range', build: (C, p) => { const rows = []; for (const s of C.S(p.from, p.to)) { rows.push({ _h: `${s.billNo} · ${dd(sday(s))} · ${s.customer}` }); for (const x of s.items) { const c = C.cost(x.productId) * x.qty, v = C.net(x, s); rows.push({ item: x.name, qty: x.qty, rate: x.rate, sales: v, cost: c, profit: v - c }); } }
    return { cols: [{ k: 'item', t: 'ITEM' }, { k: 'qty', t: 'QTY', n: 'q' }, { k: 'rate', t: 'RATE', n: 'm' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'cost', t: 'COST', n: 'm' }, { k: 'profit', t: 'PROFIT', n: 'm' }], rows, grand: sumRows(rows, ['sales', 'cost', 'profit']), note: 'Cost uses each product’s current cost price.' }; } },
  { id: 'f-item', g: 'FINANCIAL REPORTS', t: 'Itemized Profit/Loss Report', mode: 'range', build: (C, p) => profitByItem(C, p, false) },
  { id: 'f-stock', g: 'FINANCIAL REPORTS', t: 'Profit by Stock', mode: 'asof', build: (C) => { const rows = C.D.products.filter((x) => x.active !== false && (+x.stock || 0) > 0).map((x) => { const q = +x.stock || 0, c = +x.costPrice || 0, s = +x.salePrice || 0; return { code: x.barcode || x.code || '', name: x.name, qty: q, cost: q * c, value: q * s, profit: q * (s - c) }; }).sort((a, b) => b.profit - a.profit);
    return { cols: [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, { k: 'qty', t: 'IN STOCK', n: 'q' }, { k: 'cost', t: 'AT COST', n: 'm' }, { k: 'value', t: 'AT SALE PRICE', n: 'm' }, { k: 'profit', t: 'PROFIT IF ALL SOLD', n: 'm' }], rows, grand: sumRows(rows, ['cost', 'value', 'profit']) }; } },
  { id: 'f-avg', g: 'FINANCIAL REPORTS', t: 'Profit/Loss AVG Method', mode: 'range', build: (C, p) => profitByItem(C, p, true) },
  { id: 'f-tb', g: 'FINANCIAL REPORTS', t: 'Trial Balance', mode: 'asof', build: (C, p) => { const cash = C.cashOpen('9999-12-31') + 0, stock = C.D.products.reduce((t, x) => t + (+x.stock || 0) * (+x.costPrice || 0), 0);
    const rows = [{ acct: 'CASH ACCOUNT', cat: 'Cash', dr: cash > 0 ? cash : 0, cr: cash < 0 ? -cash : 0 }, { acct: 'STOCK IN TRADE (AT COST)', cat: 'Inventory', dr: stock > 0 ? stock : 0, cr: 0 }, ...C.D.accounts.filter((a) => a.balance).map((a) => ({ acct: a.title, cat: a.category, dr: a.balance > 0 ? a.balance : 0, cr: a.balance < 0 ? -a.balance : 0 }))], g = sumRows(rows, ['dr', 'cr']);
    return { cols: [{ k: 'acct', t: 'ACCOUNT' }, { k: 'cat', t: 'CATEGORY' }, { k: 'dr', t: 'DEBIT', n: 'm' }, { k: 'cr', t: 'CREDIT', n: 'm' }], rows, grand: g, note: `Built from the balances Falcon keeps: cash, stock, customers, suppliers and vouchers. Falcon is not a full double-entry ledger, so the two sides can differ. Difference: Rs ${n2(Math.abs(g.dr - g.cr))} ${g.dr >= g.cr ? 'more debit' : 'more credit'}.` }; } },
  { id: 'f-tbp', g: 'FINANCIAL REPORTS', t: 'Trial Balance Periodic', mode: 'range', build: (C, p) => { const m = {}, add = (t, c, dr, cr) => { const e = (m[t] ||= { acct: t, cat: c, dr: 0, cr: 0 }); e.dr += dr; e.cr += cr; };
    for (const s of C.S(p.from, p.to)) if (s.balance > 0) add(String(s.customer).toUpperCase(), 'Customers', s.balance, 0);
    for (const r of C.R(p.from, p.to)) if (r.type === 'CREDIT') add(String(r.customer).toUpperCase(), 'Customers', 0, r.total);
    for (const x of C.P(p.from, p.to)) if ((x.balance || 0) > 0) add(String(x.supplier).toUpperCase(), 'Suppliers', 0, x.balance);
    for (const v of C.V(p.from, p.to)) for (const l of v.lines) add(l.title, C.D.accounts.find((a) => a.title === l.title)?.category || '', v.kind === 'PAYMENT' ? l.amount : 0, v.kind === 'RECEIPT' ? l.amount : 0);
    const rows = Object.values(m).sort((a, b) => a.acct.localeCompare(b.acct));
    return { cols: [{ k: 'acct', t: 'ACCOUNT' }, { k: 'cat', t: 'CATEGORY' }, { k: 'dr', t: 'DEBIT', n: 'm' }, { k: 'cr', t: 'CREDIT', n: 'm' }], rows, grand: sumRows(rows, ['dr', 'cr']), note: 'Movement on customer, supplier and voucher accounts during the period.' }; } },
];
function dayEnd(C, a, b, periodic) {
  const rows = daysIn(a, b).map((d) => { const cr = C.cashRows().filter((r) => r.date === d), rec = cr.reduce((t, r) => t + r.receipt, 0), pay = cr.reduce((t, r) => t + r.payment, 0), op = C.cashOpen(d);
    return { date: d, open: op, rec, pay, close: op + rec - pay, bills: C.S(d, d).length, sales: C.S(d, d).reduce((t, s) => t + s.total, 0) }; }).filter((r) => periodic ? r.rec || r.pay || r.bills : true);
  return { cols: periodCols({ k: 'open', t: 'OPENING CASH', n: 'm' }, { k: 'bills', t: 'BILLS', n: 'i' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'rec', t: 'CASH IN', n: 'm' }, { k: 'pay', t: 'CASH OUT', n: 'm' }, { k: 'close', t: 'CASH IN HAND', n: 'm' }), rows, grand: periodic ? { ...sumRows(rows, ['bills', 'sales', 'rec', 'pay']) } : null, note: 'Cash in = cash sales, receipts. Cash out = cash refunds, cash purchases, payments.' };
}
function salesSummary(C, p, by) {
  const arr = C.prodX('sales', p.from, p.to), gross = {}; for (const s of C.S(p.from, p.to)) for (const x of s.items) gross[x.productId || x.name] = (gross[x.productId || x.name] || 0) + x.qty * x.rate;
  const rows = by === 'name' ? arr.map((x) => ({ key: x.name, code: x.code, qty: x.qty, gross: gross[x.id || x.name] || 0, net: x.net })).sort((a, b) => b.net - a.net)
    : byKey(arr, (x) => x[by]).map(([k, a]) => ({ key: k, code: '', qty: a.reduce((t, x) => t + x.qty, 0), gross: a.reduce((t, x) => t + (gross[x.id || x.name] || 0), 0), net: a.reduce((t, x) => t + x.net, 0) }));
  rows.forEach((r) => { r.disc = r.gross - r.net; });
  return { cols: [{ k: 'key', t: by === 'name' ? 'ITEM' : by === 'company' ? 'MANUFACTURER' : 'CATEGORY' }, ...(by === 'name' ? [{ k: 'code', t: 'CODE' }] : []), { k: 'qty', t: 'QTY SOLD', n: 'q' }, { k: 'gross', t: 'GROSS', n: 'm' }, { k: 'disc', t: 'DISCOUNT', n: 'm' }, { k: 'net', t: 'NET SALES', n: 'm' }], rows, grand: sumRows(rows, ['qty', 'gross', 'disc', 'net']) };
}
function stockVal(C, p, how, periodic) {
  const a = periodic ? p.from : '0000-01-01', all = C.mov(a, p.to).filter((x) => x.closing || x.purchased || x.sold || x.returned);
  const v = (x) => x.closing * x.cost, sv = (x) => x.closing * x.sale, base = [{ k: 'qty', t: periodic ? 'CLOSING QTY' : 'QTY', n: 'q' }, { k: 'val', t: 'COST VALUE', n: 'm' }, { k: 'sval', t: 'SALE VALUE', n: 'm' }];
  const per = periodic ? [{ k: 'open', t: 'OPENING', n: 'q' }, { k: 'in', t: 'IN', n: 'q' }, { k: 'out', t: 'OUT', n: 'q' }] : [], mk = (x) => ({ open: x.opening, in: x.purchased + x.returned, out: x.sold, qty: x.closing, val: v(x), sval: sv(x) }), ks = [...(periodic ? ['open', 'in', 'out'] : []), 'qty', 'val', 'sval'];
  if (how === 'mfr') { const rows = byKey(all, (x) => x.company).map(([k, arr]) => ({ name: k, items: arr.length, open: arr.reduce((t, x) => t + x.opening, 0), in: arr.reduce((t, x) => t + x.purchased + x.returned, 0), out: arr.reduce((t, x) => t + x.sold, 0), qty: arr.reduce((t, x) => t + x.closing, 0), val: arr.reduce((t, x) => t + v(x), 0), sval: arr.reduce((t, x) => t + sv(x), 0) }));
    return { cols: [{ k: 'name', t: 'MANUFACTURER' }, { k: 'items', t: 'ITEMS', n: 'i' }, ...per, ...base], rows, grand: sumRows(rows, ['items', ...ks]) }; }
  const rows = []; for (const [co, ca] of byKey(all, (x) => x.company)) { rows.push({ _h: `Manufacturer : ${co}` }); for (const [cat, arr] of byKey(ca, (x) => x.category)) { rows.push({ _h: `   Category : ${cat}` }); arr.sort((x, y) => x.name.localeCompare(y.name)).forEach((x) => rows.push({ code: x.code, name: x.name, ...mk(x) })); rows.push({ name: `Total ${cat}`, _t: 1, ...Object.fromEntries(ks.map((k) => [k, arr.reduce((t, x) => t + mk(x)[k], 0)])) }); } }
  return { cols: [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, ...per, ...base], rows, grand: sumRows(rows, ks) };
}
function profitByItem(C, p, avg) {
  const m = {}; for (const s of C.S(p.from, p.to)) for (const x of s.items) { const e = (m[x.productId || x.name] ||= { id: x.productId, name: x.name, qty: 0, sales: 0, cost: 0 }); e.qty += x.qty; e.sales += C.net(x, s); e.cost += (avg ? C.avgCost[x.productId] ?? C.cost(x.productId) : C.cost(x.productId)) * x.qty; }
  const rows = Object.values(m).map((e) => ({ code: C.meta(e.id, e.name).code, name: e.name, qty: e.qty, sales: e.sales, cost: e.cost, profit: e.sales - e.cost, pct: e.sales ? ((e.sales - e.cost) / e.sales) * 100 : 0 })).sort((a, b) => b.profit - a.profit);
  return { cols: [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, { k: 'qty', t: 'QTY', n: 'q' }, { k: 'sales', t: 'SALES', n: 'm' }, { k: 'cost', t: avg ? 'AVG COST' : 'COST', n: 'm' }, { k: 'profit', t: 'PROFIT', n: 'm' }, { k: 'pct', t: 'MARGIN', n: 'p' }], rows, grand: { ...sumRows(rows, ['qty', 'sales', 'cost', 'profit']), pct: 0 }, note: avg ? 'Cost is the average price paid across your purchases (current cost price when a product was never purchased).' : 'Cost uses each product’s current cost price.' };
}

// ---------- Reports: screens ----------
function RangeBar({ mode, a, b, setA, setB, chip, setChip, extra }) {
  const today = ld(new Date()), chips = rangeChips();
  return <div className="rbar">
    {mode === 'day' && <><button title="Previous day" aria-label="Previous day" onClick={() => setA(addDays(a, -1))}><Ico n="chevr" s={14} className="flip" /></button><input type="date" value={a} onChange={(e) => e.target.value && setA(e.target.value)} /><button title="Next day" aria-label="Next day" onClick={() => setA(addDays(a, 1))}><Ico n="chevr" s={14} /></button><button onClick={() => setA(today)}>Today</button></>}
    {mode === 'asof' && <><label>As of</label><input type="date" value={a} onChange={(e) => e.target.value && setA(e.target.value)} /></>}
    {mode === 'range' && <><div className="dr"><Ico n="cal" s={16} /><input type="date" value={a} onChange={(e) => { setA(e.target.value); setChip(''); }} /><span>→</span><input type="date" value={b} onChange={(e) => { setB(e.target.value); setChip(''); }} /></div>
      {Object.keys(chips).map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => { setA(chips[k][0]); setB(chips[k][1]); setChip(k); }}>{k}</button>)}</>}
    {extra}</div>;
}
function ReportViewer({ rid, onClose }) {
  const def = REPORTS.find((r) => r.id === rid), [D] = useData(), today = ld(new Date());
  const [a, setA] = useState(def.mode === 'range' ? today.slice(0, 8) + '01' : today), [b, setB] = useState(today), [chip, setChip] = useState('This month'), [q, setQ] = useState(''), [pdf, setPdf] = useState(false);
  const C = useMemo(() => (D ? mkCtx(D) : null), [D]);
  const out = useMemo(() => {
    if (!C) return null;
    const o = def.build(C, def.mode === 'day' ? { from: a, to: a } : def.mode === 'asof' ? { from: '0000-01-01', to: a } : { from: a, to: b });
    if (o.grand && o.cols.some((c) => c.k === 'pct') && o.grand.sales) o.grand.pct = (o.grand.profit / o.grand.sales) * 100;
    return o;
  }, [C, a, b, rid]);
  if (!out) return <p className="soon">Loading…</p>;
  const ql = q.trim().toLowerCase(), rows = ql ? out.rows.filter((r) => !r._h && !r._t && Object.values(r).join(' ').toLowerCase().includes(ql)) : out.rows, grand = ql ? null : out.grand;
  const sub = def.mode === 'day' ? dmy(a) : def.mode === 'asof' ? 'As of ' + dmy(a) : `${dmy(a)} to ${dmy(b)}`, n = rows.filter((r) => !r._h && !r._t).length;
  return <>
    <div className="rhead"><button onClick={onClose} aria-label="Back to Reports Center"><Ico n="chevr" s={14} className="flip" /> Reports Center</button><h3>{def.t}</h3></div>
    <RangeBar mode={def.mode} a={a} b={b} setA={setA} setB={setB} chip={chip} setChip={setChip} extra={<><span className="grow" /><div className="gsw rsearch"><Ico n="search" s={15} className="gsi" /><input placeholder="Filter rows" value={q} onChange={(e) => setQ(e.target.value)} /></div></>} />
    {out.note && <p className="rnote">{out.note}</p>}
    <div className="rwrap"><RTable cols={out.cols} rows={rows} grand={grand} /></div>
    <div className="rfoot">{n.toLocaleString()} rows</div>
    <ActionBar onCsv={() => csvDownload(def.t.replace(/\W+/g, '-').toLowerCase(), out.cols, rows, grand)} onPdf={() => setPdf(true)} onPrint={() => { setPdf(true); setTimeout(() => window.print(), 250); }} onClose={onClose} />
    {pdf && <PdfView title={def.t} sub={sub} shop={C.shop} onClose={() => setPdf(false)}>{out.note && <p>{out.note}</p>}<RTable cols={out.cols} rows={rows} grand={grand} /></PdfView>}
  </>;
}
const ReportPage = (rid) => function ReportPageScreen({ onClose }) { return <ReportViewer rid={rid} onClose={onClose} />; };

function ReportsCenter({ onClose }) {
  const groups = [...new Set(REPORTS.map((r) => r.g))], [fold, setFold] = useState({}), [sel, setSel] = useState(0), [open, setOpen] = useState(null), box = useRef();
  const flat = groups.flatMap((g) => (fold[g] ? [] : REPORTS.filter((r) => r.g === g)));
  useEffect(() => { if (!open) box.current?.focus(); }, [open]);
  useEffect(() => { box.current?.querySelector('.rrow.sel')?.scrollIntoView({ block: 'nearest' }); }, [sel, fold]);
  if (open) return <ReportViewer rid={open} onClose={() => setOpen(null)} />;
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && flat[sel]) { e.preventDefault(); setOpen(flat[sel].id); }
  };
  return <>
    <div className="rcenter" tabIndex="0" ref={box} onKeyDown={key}>
      {groups.map((g) => { const list = REPORTS.filter((r) => r.g === g);
        return <div key={g}><button className="rtype" onClick={() => setFold({ ...fold, [g]: !fold[g] })} aria-expanded={!fold[g]}><span className="fbox">{fold[g] ? '+' : '−'}</span><span>Type : <b>{g}</b></span><small>{list.length} report{list.length === 1 ? '' : 's'}</small></button>
          {!fold[g] && list.map((r, i) => { const fi = flat.indexOf(r); return <div key={r.id} className={'rrow' + (fi === sel ? ' sel' : '')} onClick={() => { setSel(fi); setOpen(r.id); }} onMouseEnter={() => setSel(fi)}><span className="rno">{i + 1}</span><span className="grow">{r.t}</span><Ico n="chevr" s={15} /></div>; })}</div>; })}
    </div>
    <div className="rcfoot"><small className="hint"><kbd>↑↓</kbd> choose a report · <kbd>Enter</kbd> opens it · click a type to fold it away</small><span className="grow" /><button onClick={onClose}>Close</button></div>
  </>;
}

function StockAnalysis({ onClose }) {
  const today = ld(new Date()), [D] = useData(), [a, setA] = useState(addDays(today, -29)), [b, setB] = useState(today), [chip, setChip] = useState('30 days'), [sort, setSort] = useState('Fast moving first'), [pdf, setPdf] = useState(false), [q, setQ] = useState('');
  const C = useMemo(() => (D ? mkCtx(D) : null), [D]);
  if (!C) return <p className="soon">Loading…</p>;
  const nd = Math.max(1, diffDays(a, b) + 1), SORT = { 'Fast moving first': (x, y) => y.sold - x.sold, 'Slow moving first': (x, y) => x.sold - y.sold, 'Lowest days of stock first': (x, y) => (x.dos ?? 1e9) - (y.dos ?? 1e9), 'Item name A–Z': (x, y) => x.name.localeCompare(y.name) };
  const ql = q.trim().toLowerCase();
  const rows = C.mov(a, b).map((x) => { const avg = x.sold / nd, dos = avg > 0 ? Math.round(x.closing / avg) : null; return { ...x, adjusted: '', avg, dos, days: dos == null ? '—' : dos + ' days' }; }).filter((x) => !ql || (x.name + ' ' + x.code).toLowerCase().includes(ql)).sort(SORT[sort]);
  const cols = [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, { k: 'opening', t: 'OPENING', n: 'q' }, { k: 'purchased', t: 'PURCHASED', n: 'q' }, { k: 'sold', t: 'SOLD', n: 'q' }, { k: 'returned', t: 'RETURNED', n: 'q' }, { k: 'adjusted', t: 'ADJUSTED', n: 'q' }, { k: 'closing', t: 'CLOSING', n: 'q' }, { k: 'avg', t: 'AVG/DAY', n: 'q' }, { k: 'days', t: 'DAYS OF STOCK', n: 's' }];
  const chips = rangeChips();
  return <>
    <div className="rbar card" style={{ padding: 12 }}><div className="dr"><Ico n="cal" s={16} /><input type="date" value={a} onChange={(e) => { setA(e.target.value); setChip(''); }} /><span>→</span><input type="date" value={b} onChange={(e) => { setB(e.target.value); setChip(''); }} /></div>
      {Object.keys(chips).map((k) => <button key={k} className={chip === k ? 'chip on' : 'chip'} onClick={() => { setA(chips[k][0]); setB(chips[k][1]); setChip(k); }}>{k}</button>)}
      <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }}>{Object.keys(SORT).map((k) => <option key={k}>{k}</option>)}</select><span className="grow" /><div className="gsw rsearch"><Ico n="search" s={15} className="gsi" /><input placeholder="Find an item" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
    <p className="rnote">Days of stock = closing stock ÷ average daily sale in this period. Low numbers need reordering or baking soon.</p>
    <div className="rwrap tall"><RTable cols={cols} rows={rows} cls="sa" /></div><div className="rfoot"><b>{rows.length.toLocaleString()} items</b></div>
    <ActionBar onCsv={() => csvDownload('stock-analysis', cols, rows)} onPdf={() => setPdf(true)} onPrint={() => { setPdf(true); setTimeout(() => window.print(), 250); }} onClose={onClose} />
    {pdf && <PdfView title="Stock Analysis" sub={`${dmy(a)} to ${dmy(b)} · ${sort}`} shop={C.shop} onClose={() => setPdf(false)}><RTable cols={cols} rows={rows} /></PdfView>}
  </>;
}

function SRList({ name, all, sel, setSel }) {
  return <div className="slist"><div className="slh"><b>{name}</b><small>{sel.size} of {all.length}</small><span className="grow" /><button onClick={() => setSel(new Set(all))}>Select All</button><button onClick={() => setSel(new Set())}>Clear</button></div>
    <div className="slb"><table style={{ width: '100%' }}><thead><tr><th style={{ width: 90 }}>SELECTION</th><th>DESCRIPTION</th></tr></thead><tbody>{all.map((x) => <tr key={x}><td style={{ textAlign: 'center' }}><input type="checkbox" checked={sel.has(x)} onChange={(e) => { const n = new Set(sel); e.target.checked ? n.add(x) : n.delete(x); setSel(n); }} /></td><td>{x}</td></tr>)}</tbody></table></div></div>;
}
const SR_TYPES = [['sales', 'Sales Summary'], ['purchases', 'Purchase Summary'], ['returns', 'Sales Return Summary'], ['pret', 'Purchase Return Summary']];
function SalesReport({ onClose }) {
  const today = ld(new Date()), [D] = useData(), [a, setA] = useState(addDays(today, -29)), [b, setB] = useState(today), [type, setType] = useState('sales'), [ord, setOrd] = useState('co'), [pdf, setPdf] = useState(false);
  const [selCo, setSelCo] = useState(null), [selCa, setSelCa] = useState(null);
  const C = useMemo(() => (D ? mkCtx(D) : null), [D]);
  if (!C) return <p className="soon">Loading…</p>;
  const cos = [...new Set(D.products.map((p) => p.company || '(none)'))].sort(), cas = [...new Set(D.products.map((p) => p.category || '(none)'))].sort();
  const sc = selCo || new Set(cos), sa = selCa || new Set(cas);
  const rowsAll = C.prodX(type, a, b).filter((x) => sc.has(x.company) && sa.has(x.category));
  const o1 = ord === 'co' ? 'company' : 'category', o2 = ord === 'co' ? 'category' : 'company', rows = [];
  for (const [k1, arr1] of byKey(rowsAll, (x) => x[o1])) { rows.push({ _h: `${o1 === 'company' ? 'Company' : 'Category'} : ${k1}` }); for (const [k2, arr2] of byKey(arr1, (x) => x[o2])) { rows.push({ _h: `   ${o2 === 'company' ? 'Company' : 'Category'} : ${k2}` }); arr2.sort((x, y) => x.name.localeCompare(y.name)).forEach((x) => rows.push({ code: x.code, name: x.name, qty: x.qty, net: x.net })); rows.push({ name: `Total ${k2}`, _t: 1, qty: arr2.reduce((t, x) => t + x.qty, 0), net: arr2.reduce((t, x) => t + x.net, 0) }); } }
  const cols = [{ k: 'code', t: 'CODE' }, { k: 'name', t: 'ITEM' }, { k: 'qty', t: 'QTY', n: 'q' }, { k: 'net', t: 'AMOUNT', n: 'm' }], grand = sumRows(rows, ['qty', 'net']), title = SR_TYPES.find((x) => x[0] === type)[1];
  return <>
    <div className="srgrid"><div className="srleft"><SRList name="COMPANIES" all={cos} sel={sc} setSel={setSelCo} /><SRList name="CATEGORIES" all={cas} sel={sa} setSel={setSelCa} /></div>
      <div className="srright">
        <div className="rbar"><div><label>From</label><input type="date" value={a} onChange={(e) => setA(e.target.value)} /></div><div><label>To</label><input type="date" value={b} onChange={(e) => setB(e.target.value)} /></div></div>
        <fieldset className="fs"><legend>Type of Report</legend>{SR_TYPES.map(([k, l]) => <label key={k} className="rad"><input type="radio" checked={type === k} onChange={() => setType(k)} /> {l}</label>)}</fieldset>
        <fieldset className="fs"><legend>Order by</legend><label className="rad"><input type="radio" checked={ord === 'co'} onChange={() => setOrd('co')} /> Order by Company then Category</label><label className="rad"><input type="radio" checked={ord === 'ca'} onChange={() => setOrd('ca')} /> Order by Category then Company</label></fieldset>
        <p className="rnote">{rowsAll.length.toLocaleString()} items in this report.</p>
        <div className="btns" style={{ justifyContent: 'flex-start' }}><button onClick={() => setPdf(true)}><Ico n="file" s={15} /> View in PDF Mode</button><button onClick={() => { setPdf(true); setTimeout(() => window.print(), 250); }}><Ico n="print" s={15} /> Print</button><button onClick={onClose}>Close</button></div></div></div>
    {pdf && <PdfView title={`Products Transactions · ${title}`} sub={`${dmy(a)} to ${dmy(b)} · ${ord === 'co' ? 'Company then Category' : 'Category then Company'}`} shop={C.shop} onClose={() => setPdf(false)}><RTable cols={cols} rows={rows} grand={grand} /></PdfView>}
  </>;
}

// ---------- Advance Sales ----------
function AdvanceReceipt({ pr, shop }) {
  return <div className="receipt" style={paperVars(shop)}><div className="rc big">{shop.name}</div><hr /><div className="rc sm">Advance Order</div>
    <div className="rl sm"><span>#{pr.orderNo}</span><span>{pr.date}</span></div><div className="rl sm"><span>Customer</span><span>{pr.customer}</span></div><hr />
    <div className="rl sm b"><span>DESCRIPTION</span><span>QTY · RATE · AMOUNT</span></div>
    {pr.items.map((x, i) => <div className="rl sm" key={i}><span>{x.name}</span><span>{x.qty} · {x.rate} · {Math.round(x.qty * x.rate * (1 - (x.disc || 0) / 100))}</span></div>)}<hr />
    <div className="rl big"><span>Total</span><span>Rs {n2(pr.total)}</span></div>{pr.advance > 0 && <><div className="rl sm"><span>Advance paid</span><span>{n2(pr.advance)}</span></div><div className="rl sm"><span>Balance due</span><span>{n2(pr.total - pr.advance)}</span></div></>}
    {pr.remarks && <div className="rc sm">{pr.remarks}</div>}<hr /><div className="rc sm">{pr.user}</div></div>;
}
function OrderEditor({ prods, customers, onClose, onSaved }) {
  const [cust, setCust] = useState(''), [date, setDate] = useState(ld(new Date())), [remarks, setRemarks] = useState(''), [adv, setAdv] = useState(''), [lines, setLines] = useState([]), [name, setName] = useState(''), [sel, setSel] = useState(null), [qty, setQty] = useState(1), [rate, setRate] = useState(''), [disc, setDisc] = useState(0), [hi, setHi] = useState(0), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const nameRef = useRef(), qtyRef = useRef();
  const hits = name && !sel ? prods.filter((p) => (p.name + ' ' + (p.code || '') + ' ' + (p.barcode || '')).toLowerCase().includes(name.toLowerCase())).slice(0, 6) : [];
  const total = lines.reduce((t, x) => t + x.qty * x.rate * (1 - x.disc / 100), 0);
  const pick = (p) => { setSel(p); setName(p.name); setRate(String(p.salePrice || '')); setQty(1); setDisc(0); setHi(0); setTimeout(() => qtyRef.current?.select(), 0); };
  const add = () => { if (!sel) return setErr('Pick a product first.'); if (!(+qty > 0) || rate === '' || +rate < 0) return setErr('Enter a quantity and a price.'); setLines([...lines, { productId: sel.id, name: sel.name, qty: +qty, rate: +rate, disc: +disc || 0 }]); setSel(null); setName(''); setRate(''); setQty(1); setDisc(0); setErr(''); nameRef.current?.focus(); };
  const save = async () => { if (busy) return; setBusy(true); const r = await api('advance', 'POST', { customer: cust, date, remarks, advance: adv, items: lines }); setBusy(false); if (r.error) return setErr(r.error); onSaved(r); };
  useEffect(() => { nameRef.current?.focus(); const k = (e) => { if (e.key === 'Escape') onClose(); else if (acts(e).some((x) => x === 'save' || x === 'save2')) { e.preventDefault(); document.getElementById('ao-save')?.click(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return <div className="modal" onClick={onClose}><div className="mbox wide" role="dialog" aria-modal="true" aria-label="New advance order" onClick={(e) => e.stopPropagation()}>
    <div className="mhead"><b>New advance order</b><button className="px" aria-label="Close" onClick={onClose}><Ico n="x" s={14} /></button></div>
    <div className="cvrow"><div className="grow"><label>Customer</label><input list="aocust" value={cust} placeholder="Walk-in customer" onChange={(e) => setCust(e.target.value)} /><datalist id="aocust">{customers.map((c) => <option key={c} value={c} />)}</datalist></div>
      <div style={{ width: 160 }}><label>Order date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div style={{ width: 150 }}><label>Advance paid</label><input type="number" min="0" value={adv} placeholder="0.00" onChange={(e) => setAdv(e.target.value)} /></div></div>
    <div><label>Remarks</label><input value={remarks} placeholder="e.g. Birthday cake, pick up at 5 pm" onChange={(e) => setRemarks(e.target.value)} /></div>
    <div className="cvrow" style={{ position: 'relative' }}><div className="grow" style={{ position: 'relative' }}><label>Product</label><input ref={nameRef} value={name} placeholder="Type the product name" onChange={(e) => { setName(e.target.value); setSel(null); }}
      onKeyDown={(e) => { if (!hits.length) { if (e.key === 'Enter') add(); return; } if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % hits.length); } else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + hits.length) % hits.length); } else if (e.key === 'Enter') { e.preventDefault(); pick(hits[Math.min(hi, hits.length - 1)]); } }} />
      {hits.length > 0 && <div className="hits">{hits.map((p, i) => <div key={p.id} className={'hit' + (i === hi ? ' on' : '')} onMouseDown={() => pick(p)}>{p.name} <small>Rs {p.salePrice}</small></div>)}</div>}</div>
      <div style={{ width: 80 }}><label>Qty</label><input ref={qtyRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /></div><div style={{ width: 110 }}><label>Price</label><input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /></div>
      <div style={{ width: 80 }}><label>Disc %</label><input type="number" min="0" max="100" value={disc} onChange={(e) => setDisc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /></div><button className="pri" onClick={add}>Add</button></div>
    <div className="vl" style={{ minHeight: 120, maxHeight: 220 }}><table style={{ width: '100%' }}><thead><tr><th>#</th><th>DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">AMOUNT</th><th></th></tr></thead>
      <tbody>{!lines.length && <tr><td colSpan="7" className="empty">No items yet.</td></tr>}{lines.map((x, i) => <tr key={i}><td>{i + 1}</td><td>{x.name}</td><td className="num">{x.qty}</td><td className="num">{n2(x.rate)}</td><td className="num">{x.disc}</td><td className="num">{n2(x.qty * x.rate * (1 - x.disc / 100))}</td><td><button aria-label="Remove" onClick={() => setLines(lines.filter((_, j) => j !== i))}><Ico n="x" s={12} /></button></td></tr>)}</tbody></table></div>
    {err && <p className="rerr" role="alert">{err}</p>}
    <div className="btns" style={{ justifyContent: 'space-between' }}><b style={{ fontSize: 16 }}>Total  Rs {n2(total)}</b><span><button onClick={onClose}>Cancel</button> <button id="ao-save" className="pri" disabled={!lines.length || busy} onClick={save}>Save order <kbd>{KEYS.save}</kbd></button></span></div>
  </div></div>;
}
function AdvanceSales({ onClose }) {
  const today = ld(new Date()), [orders, setOrders] = useState([]), [prods, setProds] = useState([]), [custs, setCusts] = useState([]), [shop, setShop] = useState({}), [from, setFrom] = useState(today), [to, setTo] = useState(today), [q, setQ] = useState(''), [iFrom, setIFrom] = useState(0), [iTo, setITo] = useState(0), [posted, setPosted] = useState('');
  const [crit, setCrit] = useState(null), [mode, setMode] = useState('date'), [openG, setOpenG] = useState({}), [selId, setSelId] = useState(null), [msg, setMsg] = useState(null), [edit, setEdit] = useState(false), [pdf, setPdf] = useState(false), [pr, setPr] = useState(null), [busy, setBusy] = useState(false);
  const arr = (r) => (Array.isArray(r) ? r : []);
  const load = () => { api('advance').then((r) => setOrders(arr(r))); api('products').then((r) => setProds(arr(r).filter((p) => p.active !== false))); api('accounts').then((r) => setCusts(arr(r).filter((x) => x.category === 'Customers').map((x) => x.title))); api('settings').then((r) => setShop(arr(r).find((x) => x.id === 'shop') || {})); };
  useEffect(() => { load(); const k = (e) => { const a = acts(e); if (a.includes('refresh')) { e.preventDefault(); load(); } else if (e.key === 'F2') { e.preventDefault(); setEdit(true); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const pm = Object.fromEntries(prods.map((p) => [p.id, p])), no = (o) => +(/-(\d+)$/.exec(o.orderNo)?.[1] || 0);
  const list = orders.filter((o) => !crit || ((!crit.dates || (o.date >= crit.from && o.date <= crit.to)) && (!crit.q || o.customer.toLowerCase().includes(crit.q)) && (!crit.iFrom || no(o) >= crit.iFrom) && (!crit.iTo || no(o) <= crit.iTo) && (!crit.posted || (crit.posted === 'Y') === !!o.posted))).sort((x, y) => x.date.localeCompare(y.date) || no(x) - no(y));
  const amt = (x) => x.qty * x.rate * (1 - (x.disc || 0) / 100), tot = (o) => o.items.reduce((t, x) => t + amt(x), 0);
  const lines = list.flatMap((o) => o.items.map((x) => ({ o, x, co: pm[x.productId]?.company || '(none)', cat: pm[x.productId]?.category || '(none)' })));
  const groups = mode === 'date' ? byKey(list, (o) => o.date).map(([k, os]) => ({ key: k, label: 'Dated : ' + dd(k), total: os.reduce((t, o) => t + tot(o), 0), count: `${os.length} order${os.length === 1 ? '' : 's'}`, live: os.some((o) => !o.posted), lines: os.flatMap((o) => o.items.map((x) => ({ o, x }))) }))
    : mode === 'mfr' ? byKey(lines, (l) => l.co).map(([k, ls]) => ({ key: k, label: 'Manufacturer : ' + k, total: ls.reduce((t, l) => t + amt(l.x), 0), count: `${ls.length} line${ls.length === 1 ? '' : 's'}`, live: ls.some((l) => !l.o.posted), lines: ls })) : [];
  const summ = mode === 'sum' || mode === 'tot' ? byKey(lines, (l) => (mode === 'tot' ? l.cat : l.x.name)).map(([k, ls]) => ({ k, qty: ls.reduce((t, l) => t + l.x.qty, 0), amount: ls.reduce((t, l) => t + amt(l.x), 0) })) : [];
  const grand = list.reduce((t, o) => t + tot(o), 0), selO = orders.find((o) => o.id === selId);
  const search = () => { setCrit({ dates: true, from: from <= to ? from : to, to: from <= to ? to : from, q: q.trim().toLowerCase(), iFrom: +iFrom || 0, iTo: +iTo || 0, posted }); setMsg(null); };
  const clear = () => { setCrit(null); setQ(''); setIFrom(0); setITo(0); setPosted(''); setFrom(today); setTo(today); setMsg(null); };
  const post = async () => {
    if (!selO) return setMsg({ e: 'Click an order first.' }); if (selO.posted) return setMsg({ e: `${selO.orderNo} is already posted as ${selO.postedBillNo}.` });
    if (!window.confirm(`Post ${selO.orderNo} to sales? Stock will go down and a bill will be made.`)) return;
    const walk = /walk-in/i.test(selO.customer), t = tot(selO); setBusy(true);
    const s = await api('sales', 'POST', { type: walk ? 'CASH' : 'CREDIT', customer: selO.customer, remarks: `From advance order ${selO.orderNo}`, date: ld(new Date()), items: selO.items.map((x) => ({ ...x })), discount: 0, paid: walk ? t : Math.min(t, selO.advance || 0) });
    if (s.error) { setBusy(false); return setMsg({ e: s.error }); }
    const r = await api('advance/' + selO.id, 'PUT', { billNo: s.billNo }); setBusy(false);
    setMsg(r.error ? { e: `Bill ${s.billNo} was made, but the order could not be marked: ${r.error}` } : { ok: `${selO.orderNo} posted as bill ${s.billNo}.` }); load();
  };
  const del = async () => { if (!selO) return setMsg({ e: 'Click an order first.' }); if (!window.confirm(`Delete ${selO.orderNo}?`)) return; const r = await api('advance/' + selO.id, 'DELETE'); setMsg(r.error ? { e: r.error } : { ok: 'Order deleted.' }); setSelId(null); load(); };
  const cols = mode === 'sum' || mode === 'tot' ? [{ k: 'k', t: mode === 'tot' ? 'CATEGORY' : 'PRODUCT' }, { k: 'qty', t: 'QTY', n: 'q' }, { k: 'amount', t: 'AMOUNT', n: 'm' }] : null;
  const body = (pdfMode) => mode === 'sum' || mode === 'tot' ? <RTable cols={cols} rows={summ} grand={{ qty: summ.reduce((t, r) => t + r.qty, 0), amount: summ.reduce((t, r) => t + r.amount, 0) }} />
    : <table className="advt"><thead><tr><th>VOUCHER</th><th>CUSTOMER NAME</th><th>PRODUCT DESCRIPTION</th><th className="num">QTY</th><th className="num">PRICE</th><th className="num">DISC %</th><th className="num">AMOUNT</th><th>USER</th></tr></thead>
      <tbody>{groups.length === 0 && <tr><td colSpan="8" className="empty">No advance orders{crit ? ' match these filters' : ' yet. Press New Order to take one'}.</td></tr>}
        {groups.map((g) => { const op = pdfMode || openG[g.key]; return [<tr key={g.key} className={'advhead' + (g.live ? '' : ' done')} onClick={() => setOpenG({ ...openG, [g.key]: !openG[g.key] })}><td colSpan="8"><span className="fbox">{op ? '−' : '+'}</span><b>{g.label}</b><b className="gt2">Total Amount : {n2(g.total)}</b><small>{g.count}</small></td></tr>,
          ...(op ? g.lines.map((l, i) => <tr key={g.key + i} className={(l.o.id === selId ? 'sel ' : '') + (l.o.posted ? 'posted' : '')} onClick={() => setSelId(l.o.id)}><td className="mono">{l.o.orderNo}</td><td>{l.o.customer}{l.o.posted && <span className="tag Create" style={{ marginLeft: 6 }}>Posted</span>}</td><td>{l.x.name}</td><td className="num">{qf(l.x.qty)}</td><td className="num">{n2(l.x.rate)}</td><td className="num">{l.x.disc || 0}</td><td className="num">{n2(amt(l.x))}</td><td>{l.o.user}</td></tr>) : [])]; })}</tbody></table>;
  return <>
    <fieldset className="fs wide"><legend>Search Criteria</legend><div className="cvrow" style={{ alignItems: 'flex-end' }}>
      <div><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 168 }} /></div><div><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 168 }} /></div>
      <div className="grow"><label>Customer Name</label><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} /></div>
      <div style={{ width: 110 }}><label>Invoice From</label><input type="number" min="0" value={iFrom} onChange={(e) => setIFrom(e.target.value)} style={{ textAlign: 'center' }} /></div><div style={{ width: 110 }}><label>Invoice To</label><input type="number" min="0" value={iTo} onChange={(e) => setITo(e.target.value)} style={{ textAlign: 'center' }} /></div>
      <div style={{ width: 110 }}><label>Posted (Y/N)</label><select value={posted} onChange={(e) => setPosted(e.target.value)}><option value=""></option><option value="Y">Y</option><option value="N">N</option></select></div>
      <button onClick={search}><Ico n="search" s={15} /> Search</button><button onClick={clear}>Clear</button></div></fieldset>
    <div className="vl advwrap">{body(false)}</div>
    <div className="rfoot">{list.length} order{list.length === 1 ? '' : 's'} · Total Rs {n2(grand)}{selO ? ` · Selected ${selO.orderNo}` : ''}</div>
    {msg && <p className={msg.e ? 'rerr' : 'ok'} role={msg.e ? 'alert' : undefined}>{msg.e || msg.ok}</p>}
    <div className="advfoot"><fieldset className="fs po"><legend>Print Options</legend>{[['date', 'Date Wise'], ['mfr', 'Manufacturer Wise'], ['sum', 'Product Summary'], ['tot', 'Product Totals']].map(([k, l]) => <label key={k} className="rad"><input type="radio" checked={mode === k} onChange={() => setMode(k)} /> {l}</label>)}</fieldset><span className="grow" />
      <div className="btns" style={{ margin: 0 }}><button onClick={() => setEdit(true)}><Ico n="plus" s={15} /> New Order <kbd>F2</kbd></button><button className="pri" disabled={!selO || selO.posted || busy} onClick={post}><Ico n="up" s={15} /> Post to Sales</button>
        <button disabled={!selO} onClick={() => { setPr(selO); setTimeout(() => { window.print(); setPr(null); }, 150); }}><Ico n="print" s={15} /> Print bill</button><button disabled={!selO || selO.posted} onClick={del}><Ico n="trash" s={15} /> Delete</button>
        <button onClick={() => setPdf(true)}><Ico n="file" s={15} /> View in PDF Mode</button><button onClick={() => { setPdf(true); setTimeout(() => window.print(), 250); }}><Ico n="print" s={15} /> Print</button><button onClick={() => load()}><Ico n="refresh" s={15} /> Refresh <kbd>{KEYS.refresh}</kbd></button><button onClick={onClose}>Close</button></div></div>
    {edit && <OrderEditor prods={prods} customers={custs} onClose={() => setEdit(false)} onSaved={(r) => { setEdit(false); setMsg({ ok: `Saved ${r.orderNo} · Rs ${n2(r.total)}` }); setSelId(r.id); load(); }} />}
    {pdf && <PdfView title="Advance Sales" sub={`${crit ? 'Filtered' : 'All orders'} · ${{ date: 'Date wise', mfr: 'Manufacturer wise', sum: 'Product summary', tot: 'Product totals' }[mode]}`} shop={shop} onClose={() => setPdf(false)}>{body(true)}</PdfView>}
    {pr && <AdvanceReceipt pr={pr} shop={shop} />}
  </>;
}

const UsersScreen = SettingsAt('staff'), LookScreen = SettingsAt('look'), PrinterScreen = SettingsAt('printer'), KeysScreen = SettingsAt('keys'), SalesSummaryScreen = ReportPage('p-sales'), StockReportScreen = ReportPage('st-all');

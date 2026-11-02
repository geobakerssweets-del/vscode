import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { currentUser } from './session';
const MODE = process.env.DB_MODE || 'json';
const FILE = path.join(process.cwd(), 'data', 'db.json');
const rd = async () => JSON.parse(await fs.readFile(FILE, 'utf8'));
const wr = (d) => fs.writeFile(FILE, JSON.stringify(d, null, 2));
let _m;
async function mongo() {
  if (!_m) {
    const { MongoClient } = await import('mongodb');
    const c = await new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').connect();
    _m = c.db(process.env.MONGODB_DB || 'bakery_pos');
  }
  return _m;
}
const P = { projection: { _id: 0 } };
export const db = {
  mode: MODE,
  async list(col) {
    if (MODE === 'mongo') {
      const c = (await mongo()).collection(col);
      if ((await c.countDocuments()) === 0) { // first run: seed from data/db.json
        const seed = (await rd())[col] || [];
        if (seed.length) await c.insertMany(seed.map((x) => ({ ...x })));
      }
      return c.find({}, P).toArray();
    }
    return (await rd())[col] || [];
  },
  async insert(col, doc) {
    doc = { id: randomUUID(), createdAt: new Date().toISOString(), ...doc };
    if (MODE === 'mongo') await (await mongo()).collection(col).insertOne({ ...doc });
    else { const d = await rd(); (d[col] ??= []).unshift(doc); await wr(d); }
    return doc;
  },
  async update(col, id, patch) {
    if (MODE === 'mongo') {
      await (await mongo()).collection(col).updateOne({ id }, { $set: patch }, { upsert: true });
      return { id, ...patch };
    }
    const d = await rd(); const a = (d[col] ??= []);
    const i = a.findIndex((x) => x.id === id);
    if (i < 0) a.push({ id, ...patch }); else a[i] = { ...a[i], ...patch };
    await wr(d); return a.find((x) => x.id === id);
  },
  async remove(col, id) {
    if (MODE === 'mongo') await (await mongo()).collection(col).deleteOne({ id });
    else { const d = await rd(); d[col] = (d[col] || []).filter((x) => x.id !== id); await wr(d); }
    return { ok: true };
  },
};
export const log = async (action, record, summary, who) =>
  db.insert('audit', { who: who || (await currentUser())?.name || 'System', action, record, summary });

// ---- backup / restore ----
export const COLLECTIONS = ['settings', 'users', 'products', 'sales', 'returns', 'purchases', 'vouchers', 'audit', 'pending'];
db.dump = async () => { const o = {}; for (const c of COLLECTIONS) o[c] = await db.list(c); return o; };
db.restore = async (data) => {
  if (MODE === 'mongo') {
    const m = await mongo();
    for (const c of COLLECTIONS) if (Array.isArray(data[c])) { await m.collection(c).deleteMany({}); if (data[c].length) await m.collection(c).insertMany(data[c].map((x) => ({ ...x }))); }
    return;
  }
  const d = await rd();
  for (const c of COLLECTIONS) if (Array.isArray(data[c])) d[c] = data[c];
  await wr(d);
};
db.snapshotFile = async () => { // json mode only: keep a copy of the data file before a restore
  if (MODE === 'mongo') return null;
  const dir = path.join(process.cwd(), 'data', 'backups'); await fs.mkdir(dir, { recursive: true });
  const f = path.join(dir, 'before-restore-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  await fs.copyFile(FILE, f); return f;
};

import { db, log, COLLECTIONS } from '@/lib/db';
import { isAdminUser } from '@/lib/auth';
import { VERSION } from '@/lib/version';
const bad = (error, status = 400) => Response.json({ error }, { status });
export async function GET(req) {
  if (!(await isAdminUser())) return bad('Only an Admin can back up the data.', 403);
  const data = await db.dump();
  if (new URL(req.url).searchParams.get('info')) return Response.json({ counts: Object.fromEntries(COLLECTIONS.map((c) => [c, data[c].length])), mode: db.mode });
  await log('Backup', 'data', 'Downloaded a full backup');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify({ app: 'falcon', version: VERSION, exportedAt: new Date().toISOString(), data }, null, 1), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="falcon-backup-${day}.json"` } });
}
export async function POST(req) {
  if (!(await isAdminUser())) return bad('Only an Admin can restore data.', 403);
  const b = await req.json(), d = b?.data;
  if (b?.app !== 'falcon' || !d || typeof d !== 'object') return bad('That file is not a Falcon backup.');
  if (!Array.isArray(d.users) || !d.users.some((u) => u.active !== false && /admin/i.test(u.role) && u.passwordHash)) return bad('The backup has no active Admin, so restoring it would lock everyone out.');
  for (const c of COLLECTIONS) if (d[c] !== undefined && !Array.isArray(d[c])) return bad(`"${c}" in the backup is damaged.`);
  const snap = await db.snapshotFile();
  await db.restore(d);
  await log('Backup', 'data', `Restored a backup from ${b.exportedAt || 'unknown date'}${snap ? ' (previous data saved in data/backups)' : ''}`);
  return Response.json({ ok: true, snapshot: snap ? 'data/backups' : '' });
}

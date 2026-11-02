import { db, log } from '@/lib/db';
import { hashPw } from '@/lib/session';
import { isAdminUser } from '@/lib/auth';
const ROLES = ['Owner / Admin', 'Accountant', 'Cashier / Counter'];
const bad = (error, status = 400) => Response.json({ error }, { status });
const lim = (v) => (v === '' || v == null || !(+v >= 0) ? null : +v);
export async function POST(req) {
  if (!(await isAdminUser())) return bad('Only an Admin can add staff.', 403);
  const b = await req.json();
  const name = String(b.name || '').trim(), username = String(b.username || '').trim().toLowerCase();
  if (!name || !username) return bad('Enter a name and a username.');
  if (!/^[a-z0-9._-]+$/.test(username)) return bad('Username can only use letters, numbers, dot, dash and underscore.');
  if (String(b.password || '').length < 4) return bad('The PIN / password needs at least 4 characters.');
  if (!ROLES.includes(b.role)) return bad('Pick a role.');
  if ((await db.list('users')).some((u) => u.username === username)) return bad('That username is already taken.');
  const u = await db.insert('users', { name, username, role: b.role, active: true, passwordHash: hashPw(String(b.password)), dailyDiscountLimit: lim(b.dailyDiscountLimit), creditLimit: lim(b.creditLimit) });
  await log('Create', 'user', `Added staff ${name} (${b.role})`);
  const { passwordHash, ...safe } = u; return Response.json(safe);
}

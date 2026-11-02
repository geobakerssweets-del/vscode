import { db, log } from '@/lib/db';
import { hashPw } from '@/lib/session';
import { isAdminUser } from '@/lib/auth';
const ROLES = ['Owner / Admin', 'Accountant', 'Cashier / Counter'];
const bad = (error, status = 400) => Response.json({ error }, { status });
const lim = (v) => (v === '' || v == null || !(+v >= 0) ? null : +v);
export async function PUT(req, { params }) {
  if (!(await isAdminUser())) return bad('Only an Admin can change staff.', 403);
  const { id } = await params, b = await req.json();
  const users = await db.list('users'), cur = users.find((u) => u.id === id);
  if (!cur) return bad('Person not found.', 404);
  const name = String(b.name || '').trim(), username = String(b.username || '').trim().toLowerCase();
  if (!name || !username) return bad('Enter a name and a username.');
  if (!ROLES.includes(b.role)) return bad('Pick a role.');
  if (users.some((u) => u.id !== id && u.username === username)) return bad('That username is already taken.');
  const active = b.active !== false;
  const isOwner = (u) => /admin/i.test(u.role) && u.active !== false;
  if (isOwner(cur) && !(/admin/i.test(b.role) && active) && users.filter((u) => u.id !== id && isOwner(u)).length === 0) return bad('Keep at least one active Admin.');
  const patch = { name, username, role: b.role, active, dailyDiscountLimit: lim(b.dailyDiscountLimit), creditLimit: lim(b.creditLimit) };
  if (b.password) { if (String(b.password).length < 4) return bad('The PIN / password needs at least 4 characters.'); patch.passwordHash = hashPw(String(b.password)); }
  await db.update('users', id, patch);
  await log('Update', 'user', `Changed staff ${name}`);
  return Response.json({ ok: true });
}

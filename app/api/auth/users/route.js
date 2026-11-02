import { db } from '@/lib/db';
// Public on purpose: the sign-in screen needs the list of names to pick from.
// Never returns password hashes.
export async function GET() {
  const users = (await db.list('users')).filter((u) => u.active !== false)
    .map(({ id, name, username, role }) => ({ id, name, username, role }));
  const shop = (await db.list('settings')).find((s) => s.id === 'shop') || {};
  return Response.json({ users, address: shop.address || '', till: shop.till || 'T11' });
}

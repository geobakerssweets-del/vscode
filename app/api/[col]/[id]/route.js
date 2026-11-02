import { db, log } from '@/lib/db';
import { currentUser } from '@/lib/session';
const locked = async (col) => col === 'users' || (col === 'settings' && !/admin/i.test((await currentUser())?.role || ''));
import { OK } from '../route';
export async function PUT(req, { params }) {
  const { col, id } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  if (await locked(col)) return Response.json({ error: 'Not allowed.' }, { status: 403 });
  const doc = await db.update(col, id, await req.json());
  await log('Update', col.replace(/s$/, ''), `Changed ${doc.name || id}`);
  return Response.json(doc);
}
export async function DELETE(_, { params }) {
  const { col, id } = await params;
  if (!OK.includes(col) || col === 'audit') return Response.json({}, { status: 404 });
  if (await locked(col)) return Response.json({ error: 'Not allowed.' }, { status: 403 });
  await log('Delete', col.replace(/s$/, ''), `Removed ${id}`);
  return Response.json(await db.remove(col, id));
}

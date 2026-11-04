import { db, log } from '@/lib/db';
const bad = (error, status = 400) => Response.json({ error }, { status });
// PUT { posted:true, billNo }  marks an order as posted to sales
export async function PUT(req, { params }) {
  const { id } = await params, o = (await db.list('advance')).find((x) => x.id === id);
  if (!o) return bad('Order not found.', 404);
  if (o.posted) return bad('This order is already posted to sales.');
  const b = await req.json();
  await db.update('advance', id, { posted: true, postedBillNo: String(b.billNo || ''), postedAt: new Date().toISOString() });
  await log('Update', 'advance', `Advance order ${o.orderNo} posted to sales as ${b.billNo || ''}`);
  return Response.json({ ok: true });
}
export async function DELETE(_req, { params }) {
  const { id } = await params, o = (await db.list('advance')).find((x) => x.id === id);
  if (!o) return bad('Order not found.', 404);
  if (o.posted) return bad('A posted order cannot be deleted.');
  await db.remove('advance', id);
  await log('Delete', 'advance', `Advance order ${o.orderNo} deleted`);
  return Response.json({ ok: true });
}

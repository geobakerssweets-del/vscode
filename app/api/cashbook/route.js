import { cashBook } from '@/lib/cash';
const ok = (s) => /^\d{4}-\d\d-\d\d$/.test(s || '');
export async function GET(req) {
  const q = new URL(req.url).searchParams, today = new Date().toLocaleDateString('en-CA');
  let from = ok(q.get('from')) ? q.get('from') : today, to = ok(q.get('to')) ? q.get('to') : from;
  if (to < from) [from, to] = [to, from];
  return Response.json({ from, to, ...(await cashBook(from, to)) });
}

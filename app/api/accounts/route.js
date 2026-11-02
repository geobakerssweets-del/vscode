import { accountList } from '@/lib/cash';
export async function GET() { return Response.json(await accountList()); }

import { spawn } from 'node:child_process';
const bad = (error, status = 400) => Response.json({ error }, { status });
// Opens the real calculator of the computer that runs Falcon. Only allowed from that same computer.
export async function POST(req) {
  const host = (req.headers.get('host') || '').replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) return bad('The calculator can only be opened on the computer that runs Falcon.', 403);
  const b = await req.json().catch(() => ({}));
  if (b.app !== 'calculator') return bad('Unknown program.');
  const [cmd, args] = process.platform === 'win32' ? ['calc.exe', []] : process.platform === 'darwin' ? ['open', ['-a', 'Calculator']] : ['gnome-calculator', []];
  return new Promise((resolve) => {
    let done = false; const end = (r) => { if (!done) { done = true; resolve(r); } };
    try {
      const c = spawn(cmd, args, { detached: true, stdio: 'ignore' });
      c.on('error', () => end(bad(`Could not start the calculator (${cmd}).`, 500)));
      c.unref(); setTimeout(() => end(Response.json({ ok: true })), 350);
    } catch { end(bad(`Could not start the calculator (${cmd}).`, 500)); }
  });
}

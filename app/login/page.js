'use client';
import { useEffect, useRef, useState } from 'react';
import NumPad, { applyKey } from '@/components/NumPad';
import cssLogin from './login.module.css';

function Logo() {
  return (
    <svg className={cssLogin.llogo} viewBox="0 0 64 64" role="img" aria-label="Falcon">
      <circle cx="32" cy="32" r="31" fill="#1a1a1a" />
      <path d="M12 42C20 31 33 22 52 19C45 25 40 29 38 35C31 35 22 38 12 42Z" fill="#f57c00" />
      <path d="M17 49C26 42 35 42 46 39C42 45 35 50 26 51Z" fill="#ffb25b" />
      <circle cx="43" cy="27" r="1.6" fill="#1a1a1a" />
    </svg>
  );
}

export default function Login() {
  const [info, setInfo] = useState({ users: [], address: '', till: '' }), [loaded, setLoaded] = useState(false);
  const [who, setWho] = useState(null), [pin, setPin] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const pinRef = useRef(null);

  useEffect(() => { fetch('/api/auth/users').then((r) => r.json()).then(setInfo).catch(() => setErr('Could not load users. Is the server running?')).finally(() => setLoaded(true)); }, []);
  useEffect(() => { if (who) pinRef.current?.focus(); }, [who]);

  const pick = (u) => { setWho(u); setPin(''); setErr(''); };
  const back = () => { setWho(null); setPin(''); setErr(''); };
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: who.username, password: pin }) }).then((x) => x.json());
      if (r.error) { setErr(r.error.replace('username or password', 'PIN')); setPin(''); setBusy(false); pinRef.current?.focus(); } else window.location.href = '/';
    } catch { setErr('Could not reach the server.'); setBusy(false); }
  };

  return (
    <div className={cssLogin.login}><div className={cssLogin.lwin}>
      <div className={cssLogin.lhead}>Falcon &nbsp;–&nbsp; Sign In</div>
      <aside className={cssLogin.lside}>
        <Logo />
        <p className={cssLogin.laddr}>{info.address}</p>
        <p className={cssLogin.ltag}>Counter sales, purchases, stock and accounts in one place. Keeps working without internet.</p>
        <div className={cssLogin.ltill}>Till: {info.till}</div>
      </aside>
      <main className={cssLogin.lmain}>
        {!who ? (<>
          <h1>Who is at the counter?</h1>
          <p className={cssLogin.lhint}>Click your name, then enter your PIN.</p>
          {err && <p className={cssLogin.lerr} role="alert">{err}</p>}
          {loaded && !err && !info.users.length && <p className={cssLogin.lerr}>No active users found.</p>}
          <div className={cssLogin.lusers}>{info.users.map((u) => (
            <button key={u.id} type="button" onClick={() => pick(u)}><span className={cssLogin.av}>{u.name[0]?.toUpperCase()}</span><div><b>{u.name}</b><span>{u.role}</span></div></button>
          ))}</div>
        </>) : (<>
          <h1>Enter your PIN</h1>
          <p className={cssLogin.lhint}>Signing in as {who.name}.</p>
          <form className={cssLogin.lpin} onSubmit={go}>
            <div className={cssLogin.lcol}>
              <div className={cssLogin.lwho}><span className={cssLogin.av}>{who.name[0]?.toUpperCase()}</span><div><b>{who.name}</b><span>{who.role}</span></div></div>
              <label htmlFor="pin">PIN</label>
              <input id="pin" ref={pinRef} type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="current-password" />
              {err && <p className={cssLogin.lerr} role="alert">{err}</p>}
              <button className="pri" disabled={busy || !pin}>{busy ? 'Signing in…' : 'Sign in'}</button>
              <button type="button" className={cssLogin.lback} onClick={back}>Not {who.name}? Change user</button>
            </div>
            <NumPad onKey={(k) => setPin((v) => applyKey(v, k))} />
          </form>
        </>)}
      </main>
    </div></div>
  );
}

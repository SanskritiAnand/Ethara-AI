'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:            #fafaf8;
    --bg-2:          #f2f1ee;
    --bg-3:          #e8e7e3;
    --border:        rgba(0,0,0,0.08);
    --border-2:      rgba(0,0,0,0.15);
    --text:          rgb(18,18,18);
    --text-muted:    rgb(70,70,70);
    --text-dim:      rgb(140,140,140);
    --accent:        #1a6b00;
    --accent-fg:     #ffffff;
    --accent-dim:    rgba(26,107,0,0.09);
    --accent-border: rgba(26,107,0,0.22);
    --danger:        #c0392b;
    --danger-dim:    rgba(192,57,43,0.08);
    --font-sans:     'Geist', ui-sans-serif, system-ui, sans-serif;
    --font-tight:    'Inter Tight', ui-sans-serif, sans-serif;
    --font-mono:     'JetBrains Mono', monospace;
  }

  html, body {
    font-family: var(--font-sans);
    background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased; min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px; padding-top: 76px;
  }

  .top-nav {
    position: fixed; top: 0; left: 0; right: 0;
    height: 52px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; background: var(--bg);
    border-bottom: 1px solid var(--border); z-index: 10;
  }
  .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-logo {
    width: 28px; height: 28px; background: var(--accent);
    border-radius: 5px; display: grid; place-items: center;
  }
  .nav-name {
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--text); letter-spacing: 0.02em;
  }
  .nav-back {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    text-decoration: none; letter-spacing: 0.05em; transition: color 0.15s;
  }
  .nav-back:hover { color: var(--text-muted); }

  .card {
    width: 100%; max-width: 400px;
    background: #fff; border: 1px solid var(--border);
    border-radius: 8px; padding: 36px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    animation: fadeUp 0.35s ease forwards;
  }

  .card-header { margin-bottom: 28px; }
  .card-eyebrow {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 8px;
  }
  .card-title {
    font-family: var(--font-tight); font-size: 22px; font-weight: 700;
    letter-spacing: -0.03em; color: var(--text);
  }

  .field { margin-bottom: 14px; }
  .field-label {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.07em; text-transform: uppercase;
    display: block; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; padding: 9px 11px;
    background: var(--bg); border: 1px solid var(--border-2);
    border-radius: 5px; color: var(--text);
    font-family: var(--font-sans); font-size: 13px;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  /* Role selector pills */
  .role-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .role-pill {
    padding: 9px 12px; border: 1px solid var(--border-2);
    border-radius: 5px; cursor: pointer; background: var(--bg);
    transition: all 0.15s; text-align: left;
  }
  .role-pill:hover { background: var(--bg-2); }
  .role-pill.active {
    border-color: var(--accent-border);
    background: var(--accent-dim);
    box-shadow: 0 0 0 2px var(--accent-dim);
  }
  .role-pill-name {
    font-family: var(--font-tight); font-size: 12px; font-weight: 600;
    color: var(--text); margin-bottom: 2px;
  }
  .role-pill.active .role-pill-name { color: var(--accent); }
  .role-pill-desc {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.02em;
  }

  .error-box {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 11px; margin-bottom: 14px;
    background: var(--danger-dim); border: 1px solid rgba(192,57,43,0.18);
    border-radius: 5px;
    font-family: var(--font-mono); font-size: 11px; color: var(--danger);
  }

  .btn-submit {
    width: 100%; padding: 10px 16px; margin-top: 6px;
    background: var(--accent); color: var(--accent-fg);
    border: none; border-radius: 5px; cursor: pointer;
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-submit:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .footer-link {
    text-align: center; margin-top: 20px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
  }
  .footer-link a { color: var(--accent); text-decoration: none; margin-left: 4px; }
  .footer-link a:hover { text-decoration: underline; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

export default function SignupPage() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('annotator');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await signup(name, email, password, role); router.push('/dashboard'); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{css}</style>

      <nav className="top-nav">
        <Link href="/" className="nav-brand">
          <div className="nav-logo">
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="nav-name">ETHARA AI</span>
        </Link>
        <Link href="/login" className="nav-back">Already have an account? Sign in →</Link>
      </nav>

      <div className="page">
        <div className="card">
          <div className="card-header">
            <div className="card-eyebrow">Ethara AI · Task Manager</div>
            <div className="card-title">Create your account</div>
          </div>

          {error && (
            <div className="error-box">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Full name</label>
              <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="field">
              <label className="field-label">Email address</label>
              <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@ethara.ai" required />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} required />
            </div>

            <div className="field">
              <label className="field-label">Role</label>
              <div className="role-pills">
                <button type="button" className={`role-pill${role === 'annotator' ? ' active' : ''}`} onClick={() => setRole('annotator')}>
                  <div className="role-pill-name">Member</div>
                  <div className="role-pill-desc">View & update tasks</div>
                </button>
                <button type="button" className={`role-pill${role === 'project_lead' ? ' active' : ''}`} onClick={() => setRole('project_lead')}>
                  <div className="role-pill-name">Admin</div>
                  <div className="role-pill-desc">Manage projects & users</div>
                </button>
              </div>
            </div>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading
                ? 'Creating account...'
                : <>Create account <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </form>

          <div className="footer-link">
            Already have an account?<Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
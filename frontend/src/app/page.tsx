'use client';
import Link from 'next/link';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #fafaf8;
    --bg-2:      #f2f1ee;
    --bg-3:      #e8e7e3;
    --border:    rgba(0,0,0,0.08);
    --border-2:  rgba(0,0,0,0.15);
    --text:      rgb(18,18,18);
    --text-muted:rgb(70,70,70);
    --text-dim:  rgb(140,140,140);
    --accent:        #1a6b00;
    --accent-fg:     #ffffff;
    --accent-dim:    rgba(26,107,0,0.09);
    --accent-border: rgba(26,107,0,0.22);
    --font-sans:  'Geist', ui-sans-serif, system-ui, sans-serif;
    --font-tight: 'Inter Tight', ui-sans-serif, sans-serif;
    --font-mono:  'JetBrains Mono', monospace;
  }

  html, body {
    font-family: var(--font-sans);
    background: var(--bg); color: var(--text);
    font-size: 16px; line-height: normal; font-weight: 400;
    -webkit-font-smoothing: antialiased; overflow-x: hidden;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    height: 52px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  .nav-left { display: flex; align-items: center; gap: 10px; }
  .nav-logo {
    width: 30px; height: 30px; background: var(--accent);
    border-radius: 6px; display: grid; place-items: center; flex-shrink: 0;
  }
  .nav-wordmark {
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--text); letter-spacing: 0.02em;
  }
  .nav-divider { width: 1px; height: 18px; background: var(--border-2); margin: 0 4px; }
  .nav-sub {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); line-height: 15px;
  }
  .nav-right { display: flex; align-items: center; gap: 8px; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 600;
    color: var(--text-muted); background: transparent;
    border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
    transition: all 0.15s; text-decoration: none; line-height: 20px;
  }
  .btn-ghost:hover { color: var(--text); background: var(--bg-2); }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--accent-fg); background: var(--accent);
    border: none; border-radius: 5px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s; text-decoration: none; line-height: 20px;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

  /* TICKER */
  .ticker-wrap {
    margin-top: 52px; overflow: hidden;
    border-bottom: 1px solid var(--border); padding: 11px 0; background: var(--bg-2);
  }
  .ticker { display: flex; width: max-content; animation: tick 34s linear infinite; }
  .tick-item {
    display: flex; align-items: center; gap: 8px; padding: 0 28px;
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    line-height: 15px; letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap;
  }
  .tick-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  @keyframes tick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  /* HERO */
  .hero { padding: 64px 28px 72px; max-width: 1120px; }
  .hero-eyebrow {
    display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase;
  }
  .hero-eyebrow::before { content:''; display:block; width:22px; height:1px; background:var(--text-dim); }
  .hero h1 {
    font-family: var(--font-sans); font-size: clamp(42px,5.8vw,82px);
    font-weight: 800; line-height: 1.0; letter-spacing: -0.04em; color: var(--text);
  }
  .hero h1 .muted { color: var(--text-dim); }
  .hero-desc {
    font-size: 15px; color: var(--text-muted); line-height: 1.65;
    max-width: 500px; margin-top: 26px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .btn-hero-primary {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--accent-fg); background: var(--accent);
    border: none; border-radius: 5px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s; text-decoration: none; letter-spacing: 0.01em;
  }
  .btn-hero-primary:hover { opacity: 0.86; transform: translateY(-1px); }
  .btn-hero-ghost {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 600;
    color: var(--text-muted); background: transparent;
    border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
    transition: all 0.15s; text-decoration: none;
  }
  .btn-hero-ghost:hover { color: var(--text); background: var(--bg-2); }

  .ibadges { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 32px; }
  .ibadge {
    display: flex; align-items: center; gap: 7px; padding: 5px 11px;
    background: var(--bg-2); border: 1px solid var(--border); border-radius: 5px;
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    transition: all 0.15s;
  }
  .ibadge:hover { border-color: var(--border-2); color: var(--text-muted); }
  .ibadge .ck { color: var(--accent); }

  /* SECTION */
  .section { padding: 64px 28px; }
  .section-lbl {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 36px;
    display: flex; align-items: center; gap: 12px;
  }
  .section-lbl::after { content:''; flex:1; height:1px; background:var(--border); max-width:180px; }

  /* FEAT GRID */
  .feat-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    border: 1px solid var(--border); border-radius: 7px; overflow: hidden;
  }
  .feat-card {
    padding: 28px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    transition: background 0.2s;
  }
  .feat-card:nth-child(3n) { border-right: none; }
  .feat-card:nth-last-child(-n+3) { border-bottom: none; }
  .feat-card:hover { background: var(--bg-2); }
  .feat-icon {
    width: 32px; height: 32px; background: var(--bg-3); border: 1px solid var(--border);
    border-radius: 7px; display: grid; place-items: center; margin-bottom: 18px;
    transition: background 0.2s; color: var(--accent);
  }
  .feat-card:hover .feat-icon { background: var(--accent-dim); }
  .feat-title {
    font-family: var(--font-tight); font-size: 13px; font-weight: 600;
    color: var(--text); margin-bottom: 7px; letter-spacing: -0.01em; line-height: 20px;
  }
  .feat-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

  /* STEPS */
  .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
  .step { display: flex; flex-direction: column; gap: 14px; }
  .step-num {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase;
  }
  .step-tag {
    display: inline-flex; align-items: center; padding: 3px 9px;
    background: var(--accent-dim); border: 1px solid var(--accent-border);
    border-radius: 20px; font-family: var(--font-mono); font-size: 10px;
    color: var(--accent); letter-spacing: 0.05em; text-transform: uppercase; width: fit-content;
  }
  .step-title {
    font-family: var(--font-tight); font-size: 18px; font-weight: 600;
    color: var(--text); letter-spacing: -0.02em; line-height: 1.2;
  }
  .step-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; }

  /* CTA */
  .cta-block {
    margin: 0 28px 72px; padding: 56px 44px;
    background: var(--bg-2); border: 1px solid var(--border); border-radius: 7px;
    display: flex; align-items: center; justify-content: space-between; gap: 28px;
  }
  .cta-left h2 {
    font-family: var(--font-tight); font-size: 32px; font-weight: 700;
    color: var(--text); letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 10px;
  }
  .cta-left p { font-size: 14px; color: var(--text-muted); line-height: 1.65; max-width: 380px; }
  .cta-right { display: flex; flex-direction: column; gap: 9px; flex-shrink: 0; }

  /* FOOTER */
  .footer {
    border-top: 1px solid var(--border); padding: 20px 28px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-l { display: flex; align-items: center; gap: 14px; }
  .footer-name {
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--text-dim); letter-spacing: 0.02em;
  }
  .footer-links { display: flex; gap: 14px; }
  .footer-links a {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    text-decoration: none; transition: color 0.15s;
  }
  .footer-links a:hover { color: var(--text-muted); }
  .footer-badge {
    font-family: var(--font-mono); font-size: 10px; color: var(--accent);
    padding: 3px 9px; background: var(--accent-dim); border: 1px solid var(--accent-border);
    border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;
  }

  .hr { height: 1px; background: var(--border); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fu  { opacity:0; animation: fadeUp 0.45s ease forwards; }
  .fu2 { opacity:0; animation: fadeUp 0.45s 0.08s ease forwards; }
  .fu3 { opacity:0; animation: fadeUp 0.45s 0.16s ease forwards; }
  .fu4 { opacity:0; animation: fadeUp 0.45s 0.24s ease forwards; }
`;

const ticks = [
  'JWT Authentication','Role-Based Access','Project Management','Task Assignment',
  'Real-time Dashboard','Overdue Alerts','Admin Controls','Member Permissions',
  'JWT Authentication','Role-Based Access','Project Management','Task Assignment',
  'Real-time Dashboard','Overdue Alerts','Admin Controls','Member Permissions',
];

export default function LandingPage() {
  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo">
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="nav-wordmark">ETHARA AI</span>
          <div className="nav-divider" />
          <span className="nav-sub">Team Task Manager</span>
        </div>
        <div className="nav-right">
          <Link href="/login" className="btn-ghost">Sign In</Link>
          <Link href="/signup" className="btn-primary">Get Started →</Link>
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          {ticks.map((t, i) => (
            <div key={i} className="tick-item"><div className="tick-dot" />{t}</div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow fu">Ethara AI</div>
        <h1 className="fu2">
          Manage Tasks.<br />
          <span className="muted">Ship Projects.</span>
        </h1>
        <p className="hero-desc fu3">
          A collaborative task management workspace where teams create projects,
          assign work, track progress — and actually get things done.
        </p>
        <div className="hero-actions fu3">
          <Link href="/signup" className="btn-hero-primary">Start for free →</Link>
          <Link href="/login" className="btn-hero-ghost">Sign in to dashboard</Link>
        </div>
        <div className="ibadges fu4">
          {['JWT Auth','Role-Based Access','Project Management','Task Tracking','Live Dashboard'].map(b => (
            <div key={b} className="ibadge"><span className="ck">✓</span>{b}</div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-lbl">Core capabilities</div>
        <div className="feat-grid">
          {[
            { icon: '🔐', title:'JWT Authentication',    desc:'Secure signup and login with hashed passwords. Token-based sessions that stay out of the way.' },
            { icon: '👥', title:'Project Management',    desc:'Create projects, invite members, manage roles. The creator becomes Admin automatically.' },
            { icon: '✅', title:'Task Assignment',       desc:'Create tasks with title, description, due date, and priority. Assign to any team member.' },
            { icon: '📊', title:'Live Dashboard',        desc:'Total tasks, tasks by status, per-user workload, and overdue alerts — all in one view.' },
            { icon: '🛡️', title:'Role-Based Access',    desc:'Admins manage everything. Members can only view and update their own assigned tasks.' },
            { icon: '🔄', title:'Status Tracking',       desc:'Move tasks through To Do → In Progress → Done. Progress is visible to the whole team.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="feat-card">
              <div className="feat-icon" style={{ fontSize: 15 }}>{icon}</div>
              <div className="feat-title">{title}</div>
              <div className="feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hr" />

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-lbl">How it works</div>
        <div className="steps">
          {[
            { n:'Step 01', tag:'Sign up', title:'Create your account', desc:'Register with your name, email, and password. Choose Admin to create projects or Member to join them.' },
            { n:'Step 02', tag:'Organize', title:'Build your project',  desc:'Create a project — you become Admin. Add team members, set roles, and start building your workspace.' },
            { n:'Step 03', tag:'Execute', title:'Assign & track tasks', desc:'Create tasks with priorities and due dates. Assign them to members. Watch the dashboard fill up.' },
          ].map(s => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-tag">{s.tag}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-block">
        <div className="cta-left">
          <h2>Ready to get<br />your team organized?</h2>
          <p>Sign up in seconds. No credit card, no setup. Just create an account and start managing tasks with your team today.</p>
        </div>
        <div className="cta-right">
          <Link href="/signup" className="btn-hero-primary">Create free account →</Link>
          <Link href="/login" className="btn-hero-ghost">Sign in instead</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-l">
          <span className="footer-name">ETHARA AI</span>
          <div className="footer-links">
            <a href="/login">Login</a>
            <a href="/signup">Signup</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </div>
        <div className="footer-badge">Task Manager</div>
      </footer>
    </>
  );
}
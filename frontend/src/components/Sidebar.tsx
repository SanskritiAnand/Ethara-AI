'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');

  .sidebar {
    width: 200px;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid rgba(0,0,0,0.08);
    overflow: hidden;
  }

  .sidebar-spacer {
    width: 200px;
    flex-shrink: 0;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 9px;
    padding: 16px 16px 14px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
  }
  .sidebar-logo-icon {
    width: 26px; height: 26px; background: #1a6b00;
    border-radius: 5px; display: grid; place-items: center; flex-shrink: 0;
  }
  .sidebar-logo-name {
    font-family: 'Inter Tight', sans-serif; font-size: 13px; font-weight: 700;
    color: rgb(18,18,18); letter-spacing: 0.01em; line-height: 1;
  }
  .sidebar-logo-sub {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: rgb(140,140,140); margin-top: 2px; letter-spacing: 0.04em;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-link {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 5px;
    font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
    color: rgb(70,70,70); text-decoration: none;
    transition: background 0.12s, color 0.12s;
    cursor: pointer; border: none; background: transparent; width: 100%;
    text-align: left;
  }
  .sidebar-link:hover { background: #f2f1ee; color: rgb(18,18,18); }
  .sidebar-link.active {
    background: rgba(26,107,0,0.09);
    color: #1a6b00; font-weight: 600;
  }
  .sidebar-link svg { flex-shrink: 0; opacity: 0.7; }
  .sidebar-link.active svg { opacity: 1; }

  .sidebar-bottom {
    flex-shrink: 0;
    border-top: 1px solid rgba(0,0,0,0.08);
    padding: 10px 8px;
  }

  .sidebar-user {
    padding: 8px 10px 6px;
    margin-bottom: 2px;
  }
  .sidebar-user-name {
    font-family: 'Inter Tight', sans-serif; font-size: 13px; font-weight: 600;
    color: rgb(18,18,18); margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-user-role {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: #1a6b00; text-transform: uppercase; letter-spacing: 0.07em;
  }

  .sidebar-logout {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 5px;
    font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
    color: rgb(140,140,140); cursor: pointer;
    border: none; background: transparent; width: 100%; text-align: left;
    transition: background 0.12s, color 0.12s;
  }
  .sidebar-logout:hover { background: rgba(192,57,43,0.07); color: #c0392b; }
`;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const nav = [
    { href: '/dashboard', label: 'QA Dashboard', icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    )},
    { href: '/projects', label: 'Projects', icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
      </svg>
    )},
    { href: '/tasks', label: 'All Tasks', icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    )},
  ];

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <>
      <style>{css}</style>
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">ETHARA AI</div>
            <div className="sidebar-logo-sub">Task Manager</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${pathname.startsWith(item.href) ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              {user?.role === 'project_lead' ? 'Project Lead' : 'Member'}
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

      </aside>
      <div className="sidebar-spacer" />
    </>
  );
}
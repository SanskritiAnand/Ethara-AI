'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

interface Project {
  id: number; name: string; description: string;
  admin_name: string; admin_id: number; task_count: number; member_count: number; created_at: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #fafaf8; --bg-2: #f2f1ee; --bg-3: #e8e7e3;
    --border: rgba(0,0,0,0.08); --border-2: rgba(0,0,0,0.15);
    --text: rgb(18,18,18); --text-muted: rgb(70,70,70); --text-dim: rgb(140,140,140);
    --accent: #1a6b00; --accent-fg: #ffffff;
    --accent-dim: rgba(26,107,0,0.09); --accent-border: rgba(26,107,0,0.22);
    --danger: #c0392b; --danger-dim: rgba(192,57,43,0.08);
    --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
    --font-tight: 'Inter Tight', ui-sans-serif, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  html, body { font-family: var(--font-sans); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  .shell { display: flex; min-height: 100vh; }
  .main  { flex: 1; overflow: auto; background: var(--bg); }
  .page-header {
    padding: 28px 32px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  }
  .page-eyebrow {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .page-eyebrow::before { content:''; width:16px; height:1px; background:var(--text-dim); }
  .page-title { font-family: var(--font-tight); font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: var(--text); margin-bottom: 3px; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--accent-fg); background: var(--accent);
    border: none; border-radius: 5px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s; text-decoration: none; flex-shrink: 0;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 600;
    color: var(--text-muted); background: transparent;
    border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
    transition: all 0.15s; text-decoration: none;
  }
  .btn-ghost:hover { color: var(--text); background: var(--bg-2); }
  .page-body { padding: 24px 32px; }
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .project-card {
    background: #fff; border: 1px solid var(--border); border-radius: 7px; padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
    transition: border-color 0.15s, box-shadow 0.15s; position: relative;
  }
  .project-card:hover { border-color: var(--accent-border); box-shadow: 0 2px 8px rgba(26,107,0,0.08); }
  .project-card-link { text-decoration: none; display: flex; flex-direction: column; gap: 14px; flex: 1; }
  .project-card-icon {
    width: 32px; height: 32px; background: var(--accent-dim);
    border: 1px solid var(--accent-border); border-radius: 6px; display: grid; place-items: center;
  }
  .project-card-name { font-family: var(--font-tight); font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.4; margin-bottom: 5px; }
  .project-card-desc { font-size: 12px; color: var(--text-muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .project-card-footer { display: flex; align-items: center; gap: 14px; padding-top: 12px; border-top: 1px solid var(--border); }
  .project-stat { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }
  .project-stat strong { font-weight: 600; color: var(--text); }
  .project-admin { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
  .delete-btn {
    position: absolute; top: 12px; right: 12px;
    width: 24px; height: 24px; border-radius: 4px;
    background: none; border: none; cursor: pointer;
    color: var(--text-dim); font-size: 16px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: color 0.15s, background 0.15s; opacity: 0;
  }
  .project-card:hover .delete-btn { opacity: 1; }
  .delete-btn:hover { color: var(--danger); background: var(--danger-dim); }
  .empty { padding: 56px 32px; text-align: center; background: #fff; border: 1px solid var(--border); border-radius: 7px; }
  .empty-title { font-family: var(--font-tight); font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .empty-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
  .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.25); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
  .modal-title { font-family: var(--font-tight); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); margin-bottom: 24px; }
  .field { margin-bottom: 14px; }
  .field-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); letter-spacing: 0.07em; text-transform: uppercase; display: block; margin-bottom: 6px; }
  .field-input { width: 100%; padding: 9px 11px; background: var(--bg); border: 1px solid var(--border-2); border-radius: 5px; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; resize: vertical; }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-dim); }
  .error-box { display: flex; align-items: center; gap: 8px; padding: 8px 11px; margin-bottom: 14px; background: var(--danger-dim); border: 1px solid rgba(192,57,43,0.18); border-radius: 5px; font-family: var(--font-mono); font-size: 11px; color: var(--danger); }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  .loading-wrap { padding: 60px 32px; display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
  .loading-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: 0.5; animation: blink 1s infinite; }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,100%{opacity:0.15} 50%{opacity:0.8} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.3s ease forwards; }
`;

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user) api.getProjects().then(setProjects).finally(() => setFetching(false)); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const p = await api.createProject({ name, description: desc });
      setProjects(prev => [p, ...prev]);
      setShowModal(false); setName(''); setDesc('');
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault(); // prevent card link navigation
    e.stopPropagation();
    if (!confirm('Delete this project? This will also delete all its tasks.')) return;
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <Sidebar />
        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-eyebrow">Projects</div>
              <div className="page-title">Projects</div>
              <div className="page-subtitle">Create and manage your team's projects</div>
            </div>
            {user?.role === 'project_lead' && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Project
              </button>
            )}
          </div>

          <div className="page-body">
            {fetching ? (
              <div className="loading-wrap">
                <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
                Loading projects…
              </div>
            ) : projects.length === 0 ? (
              <div className="empty">
                <div className="empty-title">No projects yet</div>
                <div className="empty-desc">Create your first project to get started.</div>
                {user?.role === 'project_lead' && (
                  <button className="btn-primary" onClick={() => setShowModal(true)}>Create first project</button>
                )}
              </div>
            ) : (
              <div className="projects-grid fu">
                {projects.map(p => (
                  <div key={p.id} className="project-card">
                    <Link href={`/projects/${p.id}`} className="project-card-link">
                      <div className="project-card-icon">
                        <svg width="15" height="15" fill="none" stroke="#1a6b00" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="project-card-name">{p.name}</div>
                        {p.description && <div className="project-card-desc">{p.description}</div>}
                      </div>
                      <div className="project-card-footer">
                        <span className="project-stat"><strong>{p.task_count}</strong> tasks</span>
                        <span className="project-stat"><strong>{p.member_count}</strong> members</span>
                        <span className="project-admin">{p.admin_name}</span>
                      </div>
                    </Link>
                    {user?.role === 'project_lead' && (
                      <button className="delete-btn" onClick={(e) => handleDelete(e, p.id)} title="Delete project">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">New Project</div>
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={handleCreate}>
                  <div className="field">
                    <label className="field-label">Project name</label>
                    <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. GPT-4o Response Evaluation – Batch 4" required />
                  </div>
                  <div className="field">
                    <label className="field-label">Description</label>
                    <textarea className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the project goals and scope..." rows={3} />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Project'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
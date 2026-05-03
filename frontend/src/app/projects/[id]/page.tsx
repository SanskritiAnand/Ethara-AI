'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, isOverdue, formatDate } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

interface ProjectDetail {
  id: number; name: string; description: string; admin_name: string; admin_id: number;
  members: { id: number; name: string; email: string; role: string }[];
}
interface Task {
  id: number; title: string; status: string; priority: string; difficulty: string;
  due_date: string; assignee_name: string; quality_score: number | null;
}
interface User { id: number; name: string; email: string; role: string; }

const S_LABEL: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done', queued: 'Queued', in_review: 'In Review', approved: 'Approved' };

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

  html, body { font-family: var(--font-sans); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  .shell { display: flex; min-height: 100vh; }
  .main  { flex: 1; overflow: auto; background: var(--bg); }

  .page-header {
    padding: 24px 32px 20px;
    border-bottom: 1px solid var(--border);
  }
  .back-link {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    text-decoration: none; letter-spacing: 0.05em; margin-bottom: 12px;
    transition: color 0.15s;
  }
  .back-link:hover { color: var(--text-muted); }
  .page-title {
    font-family: var(--font-tight); font-size: 20px; font-weight: 700;
    letter-spacing: -0.03em; color: var(--text); margin-bottom: 4px;
  }
  .page-desc { font-size: 13px; color: var(--text-muted); max-width: 560px; }

  .page-body { padding: 24px 32px; }
  .layout { display: grid; grid-template-columns: 1fr 240px; gap: 20px; align-items: start; }

  /* Section header */
  .section-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
  }
  .section-title {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
  }
  .section-count {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    background: var(--bg-2); border: 1px solid var(--border);
    padding: 1px 7px; border-radius: 10px;
  }

  /* Task cards */
  .task-list { display: flex; flex-direction: column; gap: 8px; }
  .task-card {
    background: #fff; border: 1px solid var(--border); border-radius: 6px;
    padding: 14px 16px; display: flex; align-items: center; gap: 12px;
    transition: border-color 0.15s;
  }
  .task-card:hover { border-color: var(--border-2); }
  .task-card.overdue { border-left: 3px solid var(--danger); }
  .task-card.done { border-left: 3px solid #1a6b00; }

  .task-info { flex: 1; min-width: 0; }
  .task-name {
    font-size: 13px; font-weight: 500; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px;
  }
  .task-name.overdue { color: var(--danger); }
  .task-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .badge {
    display: inline-flex; align-items: center; padding: 2px 7px;
    border-radius: 4px; border: 1px solid;
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;
  }
  .badge-todo        { color: #1d4ed8; border-color: rgba(29,78,216,0.2);  background: rgba(29,78,216,0.06); }
  .badge-in_progress { color: #b45309; border-color: rgba(180,83,9,0.2);   background: rgba(180,83,9,0.06); }
  .badge-done        { color: #1a6b00; border-color: rgba(26,107,0,0.2);   background: rgba(26,107,0,0.06); }
  .badge-queued      { color: #1d4ed8; border-color: rgba(29,78,216,0.2);  background: rgba(29,78,216,0.06); }
  .badge-in_review   { color: #b45309; border-color: rgba(180,83,9,0.2);   background: rgba(180,83,9,0.06); }
  .badge-approved    { color: #1a6b00; border-color: rgba(26,107,0,0.2);   background: rgba(26,107,0,0.06); }
  .badge-high        { color: #c0392b; border-color: rgba(192,57,43,0.2);  background: rgba(192,57,43,0.06); }
  .badge-medium      { color: #b45309; border-color: rgba(180,83,9,0.2);   background: rgba(180,83,9,0.06); }
  .badge-low         { color: #1d4ed8; border-color: rgba(29,78,216,0.2);  background: rgba(29,78,216,0.06); }
  .badge-overdue     { color: #c0392b; border-color: rgba(192,57,43,0.2);  background: rgba(192,57,43,0.06); }

  .task-meta-text {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
  }

  .status-select {
    padding: 5px 8px; border: 1px solid var(--border-2); border-radius: 5px;
    background: var(--bg); color: var(--text);
    font-family: var(--font-mono); font-size: 11px;
    outline: none; cursor: pointer; flex-shrink: 0;
    transition: border-color 0.15s;
  }
  .status-select:focus { border-color: var(--accent-border); }

  /* Members panel */
  .members-panel {
    background: #fff; border: 1px solid var(--border); border-radius: 7px; overflow: hidden;
  }
  .members-head {
    padding: 13px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .member-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-bottom: 1px solid var(--border);
  }
  .member-row:last-child { border-bottom: none; }
  .member-avatar {
    width: 26px; height: 26px; border-radius: 5px;
    background: var(--accent-dim); border: 1px solid var(--accent-border);
    display: grid; place-items: center;
    font-family: var(--font-tight); font-size: 11px; font-weight: 700;
    color: var(--accent); flex-shrink: 0;
  }
  .member-name { font-size: 13px; font-weight: 500; color: var(--text); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .member-role { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); }
  .member-role.lead { color: var(--accent); }
  .remove-btn {
    background: none; border: none; cursor: pointer; color: var(--text-dim);
    font-size: 16px; line-height: 1; padding: 2px 4px; border-radius: 3px;
    transition: color 0.15s, background 0.15s;
  }
  .remove-btn:hover { color: var(--danger); background: var(--danger-dim); }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 7px; padding: 7px 14px;
    font-family: var(--font-tight); font-size: 13px; font-weight: 700;
    color: var(--accent-fg); background: var(--accent);
    border: none; border-radius: 5px; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
    font-family: var(--font-tight); font-size: 12px; font-weight: 600;
    color: var(--text-muted); background: transparent;
    border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
    transition: all 0.15s;
  }
  .btn-ghost:hover { color: var(--text); background: var(--bg-2); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.25); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: #fff; border: 1px solid var(--border);
    border-radius: 8px; padding: 28px; width: 100%; max-width: 460px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .modal-title {
    font-family: var(--font-tight); font-size: 17px; font-weight: 700;
    letter-spacing: -0.02em; color: var(--text); margin-bottom: 22px;
  }
  .field { margin-bottom: 13px; }
  .field-label {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.07em; text-transform: uppercase; display: block; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; padding: 9px 11px;
    background: var(--bg); border: 1px solid var(--border-2);
    border-radius: 5px; color: var(--text);
    font-family: var(--font-sans); font-size: 13px;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s; resize: vertical;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-dim); }
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .error-box {
    padding: 8px 11px; margin-bottom: 13px;
    background: var(--danger-dim); border: 1px solid rgba(192,57,43,0.18);
    border-radius: 5px; font-family: var(--font-mono); font-size: 11px; color: var(--danger);
  }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

  .loading-wrap {
    padding: 60px 32px; display: flex; align-items: center; gap: 10px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
  }
  .loading-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: 0.5; animation: blink 1s infinite; }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,100%{opacity:0.15} 50%{opacity:0.8} }

  .empty-tasks {
    padding: 40px 20px; text-align: center;
    background: #fff; border: 1px solid var(--border); border-radius: 7px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
  }
`;

export default function ProjectDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'medium', difficulty: 'medium', dueDate: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getProject(id), api.getTasks(id),
      user.role === 'project_lead' ? api.getUsers() : Promise.resolve([])
    ]).then(([proj, t, users]) => {
      setProject(proj); setTasks(t); setAllUsers(users);
    }).finally(() => setFetching(false));
  }, [user, id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const task = await api.createTask({ ...taskForm, projectId: id, assigneeId: taskForm.assigneeId ? Number(taskForm.assigneeId) : undefined, dueDate: taskForm.dueDate || undefined });
      setTasks(prev => [task, ...prev]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assigneeId: '', priority: 'medium', difficulty: 'medium', dueDate: '' });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.addMember(id, Number(memberUserId));
      const proj = await api.getProject(id);
      setProject(proj); setShowMemberModal(false); setMemberUserId('');
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Remove this member?')) return;
    await api.removeMember(id, userId);
    const proj = await api.getProject(id);
    setProject(proj);
  };

  const handleStatusUpdate = async (taskId: number, status: string) => {
    const updated = await api.updateTask(taskId, { status });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
  };

  if (fetching || !project) return (
    <>
      <style>{css}</style>
      <div className="shell">
        <Sidebar />
        <main className="main">
          <div className="loading-wrap">
            <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
            Loading project…
          </div>
        </main>
      </div>
    </>
  );

  const isLead = user?.role === 'project_lead';
  const nonMembers = allUsers.filter(u => !project.members.find(m => m.id === u.id));

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <Sidebar />
        <main className="main">

          <div className="page-header">
            <Link href="/projects" className="back-link">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              All Projects
            </Link>
            <div className="page-title">{project.name}</div>
            {project.description && <div className="page-desc">{project.description}</div>}
          </div>

          <div className="page-body">
            <div className="layout">

              {/* Tasks */}
              <div>
                <div className="section-header">
                  <div className="section-title">
                    Tasks
                    <span className="section-count">{tasks.length}</span>
                  </div>
                  {isLead && (
                    <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      New Task
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="empty-tasks">No tasks yet.</div>
                ) : (
                  <div className="task-list">
                    {tasks.map(task => {
                      const overdue = isOverdue(task.due_date, task.status);
                      const isDone = task.status === 'done' || task.status === 'approved';
                      return (
                        <div key={task.id} className={`task-card${overdue ? ' overdue' : isDone ? ' done' : ''}`}>
                          <div className="task-info">
                            <div className={`task-name${overdue ? ' overdue' : ''}`}>
                              {overdue && '⚠ '}{task.title}
                            </div>
                            <div className="task-badges">
                              <span className={`badge badge-${task.status}`}>{S_LABEL[task.status] || task.status}</span>
                              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                              {overdue && <span className="badge badge-overdue">Overdue</span>}
                              <span className="task-meta-text">
                                {task.assignee_name || 'Unassigned'} · {formatDate(task.due_date)}
                              </span>
                            </div>
                          </div>
                          {(isLead || task.status !== 'approved') && (
                            <select className="status-select" value={task.status} onChange={e => handleStatusUpdate(task.id, e.target.value)}>
                              <option value="queued">Queued</option>
                              <option value="in_review">In Review</option>
                              <option value="approved">Approved</option>
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <div className="section-header">
                  <div className="section-title">Members</div>
                  {isLead && nonMembers.length > 0 && (
                    <button className="btn-ghost" onClick={() => setShowMemberModal(true)}>+ Add</button>
                  )}
                </div>
                <div className="members-panel">
                  {project.members.map(m => (
                    <div key={m.id} className="member-row">
                      <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="member-name">{m.name}</div>
                        <div className={`member-role${m.role === 'project_lead' ? ' lead' : ''}`}>
                          {m.role === 'project_lead' ? 'Admin' : 'Member'}
                        </div>
                      </div>
                      {isLead && m.id !== user?.id && m.role !== 'project_lead' && (
                        <button className="remove-btn" onClick={() => handleRemoveMember(m.id)}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Create Task Modal */}
          {showTaskModal && (
            <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">New Task</div>
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={handleCreateTask}>
                  <div className="field">
                    <label className="field-label">Task title</label>
                    <input className="field-input" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Evaluate prompt-response pair #48" required />
                  </div>
                  <div className="field">
                    <label className="field-label">Description</label>
                    <textarea className="field-input" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details..." rows={3} />
                  </div>
                  <div className="field-grid" style={{ marginBottom: 13 }}>
                    <div className="field">
                      <label className="field-label">Priority</label>
                      <select className="field-input" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Difficulty</label>
                      <select className="field-input" value={taskForm.difficulty} onChange={e => setTaskForm(f => ({ ...f, difficulty: e.target.value }))}>
                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Assign to</label>
                    <select className="field-input" value={taskForm.assigneeId} onChange={e => setTaskForm(f => ({ ...f, assigneeId: e.target.value }))}>
                      <option value="">Unassigned</option>
                      {project.members.filter(m => m.role !== 'project_lead').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Due date</label>
                    <input className="field-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showMemberModal && (
            <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
              <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                <div className="modal-title">Add Member</div>
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={handleAddMember}>
                  <div className="field">
                    <label className="field-label">Select user</label>
                    <select className="field-input" value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required>
                      <option value="">Choose…</option>
                      {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Member'}</button>
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
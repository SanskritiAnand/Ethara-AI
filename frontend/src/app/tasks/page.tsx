'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, isOverdue, formatDate } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  difficulty: string;
  due_date: string;
  assignee_name: string;
  project_name?: string;
  project_id?: number;
  quality_score: number | null;
}

const S_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  queued: 'Queued',
  in_review: 'In Review',
  approved: 'Approved',
};

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
  .main  { flex: 1; overflow: auto; background: var(--bg); min-width: 0; }

  .page-header {
    padding: 28px 32px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  }
  .page-eyebrow {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .page-eyebrow::before { content:''; width:16px; height:1px; background:var(--text-dim); }
  .page-title {
    font-family: var(--font-tight); font-size: 22px; font-weight: 700;
    letter-spacing: -0.03em; color: var(--text); margin-bottom: 3px;
  }
  .page-subtitle { font-size: 13px; color: var(--text-muted); }

  .stats-row {
    display: flex; gap: 10px; padding: 14px 32px;
    border-bottom: 1px solid var(--border); flex-wrap: wrap;
  }
  .stat-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 5px;
    background: #fff; border: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  }
  .stat-chip strong { color: var(--text); font-size: 13px; font-weight: 600; }

  .filter-bar {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 12px 32px; border-bottom: 1px solid var(--border);
    background: var(--bg);
  }
  .filter-pill {
    padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border-2);
    font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
    background: transparent; cursor: pointer; transition: all 0.15s;
  }
  .filter-pill:hover { background: var(--bg-2); color: var(--text); }
  .filter-pill.active { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
  .filter-sep { width: 1px; height: 18px; background: var(--border-2); margin: 0 2px; }
  .filter-select {
    padding: 4px 10px; border: 1px solid var(--border-2); border-radius: 5px;
    background: var(--bg); color: var(--text);
    font-family: var(--font-mono); font-size: 11px;
    outline: none; cursor: pointer;
  }

  .page-body { padding: 20px 32px; }
  .task-list { display: flex; flex-direction: column; gap: 6px; }

  .task-card {
    background: #fff; border: 1px solid var(--border); border-radius: 6px;
    padding: 13px 16px; display: flex; align-items: center; gap: 12px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .task-card:hover { border-color: var(--border-2); box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
  .task-card.overdue { border-left: 3px solid var(--danger); }
  .task-card.done    { border-left: 3px solid #1a6b00; }

  .task-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-todo        { background: #93c5fd; }
  .dot-in_progress { background: #fbbf24; }
  .dot-done        { background: #4ade80; }
  .dot-queued      { background: #93c5fd; }
  .dot-in_review   { background: #fbbf24; }
  .dot-approved    { background: #4ade80; }
  .dot-default     { background: var(--border-2); }

  .task-info { flex: 1; min-width: 0; }
  .task-name {
    font-size: 13px; font-weight: 500; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
  }
  .task-name.overdue { color: var(--danger); }
  .task-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

  .badge {
    display: inline-flex; align-items: center; padding: 2px 6px;
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

  .task-meta { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); }

  .project-link {
    font-family: var(--font-mono); font-size: 10px; color: var(--accent);
    text-decoration: none; padding: 2px 8px; border-radius: 4px;
    border: 1px solid var(--accent-border); background: var(--accent-dim);
    white-space: nowrap; flex-shrink: 0; transition: opacity 0.15s;
  }
  .project-link:hover { opacity: 0.7; }

  .status-select {
    padding: 5px 8px; border: 1px solid var(--border-2); border-radius: 5px;
    background: var(--bg); color: var(--text);
    font-family: var(--font-mono); font-size: 11px;
    outline: none; cursor: pointer; flex-shrink: 0;
  }
  .status-select:focus { border-color: var(--accent-border); }

  .empty {
    padding: 60px 20px; text-align: center;
    background: #fff; border: 1px solid var(--border); border-radius: 7px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); line-height: 1.8;
  }
  .loading-wrap {
    padding: 60px 0; display: flex; align-items: center; gap: 10px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
  }
  .loading-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: 0.5; animation: blink 1s infinite; }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,100%{opacity:0.15} 50%{opacity:0.8} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.25s ease forwards; }
`;

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.getAllTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setFetching(false));
  }, [user]);

  const handleStatusUpdate = async (taskId: number, status: string) => {
    try {
      const updated = await api.updateTask(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
    } catch { /* silent */ }
  };

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const overdueCount = tasks.filter(t => isOverdue(t.due_date, t.status)).length;
  const doneCount    = tasks.filter(t => t.status === 'done' || t.status === 'approved').length;
  const inProgCount  = tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length;
  const isLead = user?.role === 'project_lead';

  const statusFilters = [
    { key: 'all',         label: 'All' },
    { key: 'queued',      label: 'Queued' },
    { key: 'todo',        label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'in_review',   label: 'In Review' },
    { key: 'done',        label: 'Done' },
    { key: 'approved',    label: 'Approved' },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <Sidebar />
        <main className="main">

          <div className="page-header">
            <div>
              <div className="page-eyebrow">Tasks</div>
              <div className="page-title">All Tasks</div>
              <div className="page-subtitle">Every task across all your projects</div>
            </div>
          </div>

          {!fetching && (
            <div className="stats-row">
              <div className="stat-chip"><strong>{tasks.length}</strong>&nbsp;total</div>
              <div className="stat-chip"><strong>{inProgCount}</strong>&nbsp;in progress</div>
              <div className="stat-chip"><strong>{doneCount}</strong>&nbsp;done</div>
              {overdueCount > 0 && (
                <div className="stat-chip" style={{ color:'var(--danger)', borderColor:'rgba(192,57,43,0.2)', background:'rgba(192,57,43,0.04)' }}>
                  <strong style={{ color:'var(--danger)' }}>{overdueCount}</strong>&nbsp;overdue
                </div>
              )}
            </div>
          )}

          <div className="filter-bar">
            {statusFilters.map(f => (
              <button
                key={f.key}
                className={`filter-pill${statusFilter === f.key ? ' active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
            <div className="filter-sep" />
            <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="page-body">
            {fetching ? (
              <div className="loading-wrap">
                <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
                Loading tasks…
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                {tasks.length === 0
                  ? 'No tasks yet.\nCreate tasks inside a project.'
                  : 'No tasks match the current filters.'}
              </div>
            ) : (
              <div className="task-list fu">
                {filtered.map(task => {
                  const overdue = isOverdue(task.due_date, task.status);
                  const isDone  = task.status === 'done' || task.status === 'approved';
                  const dotClass = `task-dot dot-${task.status ?? 'default'}`;
                  return (
                    <div key={task.id} className={`task-card${overdue ? ' overdue' : isDone ? ' done' : ''}`}>
                      <div className={dotClass} />
                      <div className="task-info">
                        <div className={`task-name${overdue ? ' overdue' : ''}`}>
                          {overdue && '⚠ '}{task.title}
                        </div>
                        <div className="task-badges">
                          <span className={`badge badge-${task.status}`}>{S_LABEL[task.status] || task.status}</span>
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                          {overdue && <span className="badge badge-overdue">Overdue</span>}
                          <span className="task-meta">
                            {task.assignee_name || 'Unassigned'}
                            {task.due_date ? ` · Due ${formatDate(task.due_date)}` : ''}
                          </span>
                        </div>
                      </div>

                      {task.project_id && task.project_name && (
                        <Link href={`/projects/${task.project_id}`} className="project-link">
                          {task.project_name}
                        </Link>
                      )}

                      {(isLead || !isDone) && (
                        <select
                          className="status-select"
                          value={task.status}
                          onChange={e => handleStatusUpdate(task.id, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                          {isLead && <option value="queued">Queued</option>}
                          {isLead && <option value="approved">Approved</option>}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}
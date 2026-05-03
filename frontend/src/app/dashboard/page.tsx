'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, isOverdue, formatDate } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

interface DashboardData {
  totalTasks: number;
  byStatus: { status: string; count: number }[];
  overdueCount: number;
  tasksPerUser: { name: string; id: number; task_count: number; avg_quality: number | null }[];
  recentTasks: {
    id: number; title: string; status: string; priority: string;
    due_date: string; assignee_name: string; project_name: string;
  }[];
}

const S_LABEL: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

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
    --warning:       #b45309;
    --blue:          #1d4ed8;
    --font-sans:     'Geist', ui-sans-serif, system-ui, sans-serif;
    --font-tight:    'Inter Tight', ui-sans-serif, sans-serif;
    --font-mono:     'JetBrains Mono', monospace;
  }

  html, body {
    font-family: var(--font-sans);
    background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .dash-shell { display: flex; min-height: 100vh; }
  .dash-main  { flex: 1; overflow: auto; background: var(--bg); }

  /* Header */
  .dash-header {
    padding: 28px 32px 24px;
    border-bottom: 1px solid var(--border);
  }
  .dash-eyebrow {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .dash-eyebrow::before { content:''; width:16px; height:1px; background:var(--text-dim); }
  .dash-title {
    font-family: var(--font-tight); font-size: 22px; font-weight: 700;
    letter-spacing: -0.03em; color: var(--text); margin-bottom: 3px;
  }
  .dash-subtitle {
    font-size: 13px; color: var(--text-muted);
  }

  /* Body */
  .dash-body { padding: 24px 32px; }

  /* Stat strip */
  .stat-strip {
    display: grid; grid-template-columns: repeat(4,1fr);
    border: 1px solid var(--border); border-radius: 7px;
    overflow: hidden; margin-bottom: 20px; background: #fff;
  }
  .stat-cell {
    padding: 16px 20px; border-right: 1px solid var(--border);
    transition: background 0.15s;
  }
  .stat-cell:last-child { border-right: none; }
  .stat-cell:hover { background: var(--bg-2); }
  .stat-label {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 8px;
    display: flex; align-items: center; gap: 5px;
  }
  .stat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .stat-val {
    font-family: var(--font-tight); font-size: 28px; font-weight: 700;
    letter-spacing: -0.04em; line-height: 1; color: var(--text);
  }

  /* Cards row */
  .cards-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 16px;
  }

  .panel {
    background: #fff; border: 1px solid var(--border); border-radius: 7px; overflow: hidden;
  }
  .panel-head {
    padding: 13px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    letter-spacing: 0.09em; text-transform: uppercase;
  }
  .panel-meta {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
  }
  .panel-body { padding: 18px; }

  /* Status bars */
  .status-row { margin-bottom: 14px; }
  .status-row:last-child { margin-bottom: 0; }
  .status-meta {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
  }
  .status-name { font-size: 13px; color: var(--text-muted); }
  .status-count { font-family: var(--font-mono); font-size: 11px; font-weight: 500; }
  .bar-track {
    height: 4px; background: var(--bg-3); border-radius: 3px; overflow: hidden;
  }
  .bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }

  /* User workload */
  .user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid var(--border);
  }
  .user-row:last-child { border-bottom: none; }
  .user-avatar {
    width: 24px; height: 24px; border-radius: 5px;
    background: var(--accent-dim); border: 1px solid var(--accent-border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-tight); font-size: 11px; font-weight: 700;
    color: var(--accent); flex-shrink: 0;
  }
  .user-name {
    font-size: 13px; font-weight: 500; color: var(--text);
    flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .user-bar { flex: 1; height: 3px; background: var(--bg-3); border-radius: 2px; overflow: hidden; }
  .user-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.5s ease; }
  .user-count {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
    flex-shrink: 0; min-width: 18px; text-align: right;
  }

  /* Recent tasks */
  .task-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
    transition: background 0.1s;
  }
  .task-row:last-child { border-bottom: none; }
  .task-row:hover { background: var(--bg-2); margin: 0 -18px; padding: 10px 18px; border-radius: 4px; }
  .task-info { flex: 1; min-width: 0; }
  .task-title {
    font-size: 13px; font-weight: 500; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;
  }
  .task-title.overdue { color: var(--danger); }
  .task-meta { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); }
  .task-date {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
    flex-shrink: 0; min-width: 68px; text-align: right;
  }
  .task-date.overdue { color: var(--danger); }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; padding: 2px 7px;
    border-radius: 4px; border: 1px solid;
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
  }
  .badge-todo        { color: #1d4ed8; border-color: rgba(29,78,216,0.2); background: rgba(29,78,216,0.06); }
  .badge-in_progress { color: #b45309; border-color: rgba(180,83,9,0.2);  background: rgba(180,83,9,0.06); }
  .badge-done        { color: #1a6b00; border-color: rgba(26,107,0,0.2);  background: rgba(26,107,0,0.06); }
  .badge-high        { color: #c0392b; border-color: rgba(192,57,43,0.2); background: rgba(192,57,43,0.06); }
  .badge-medium      { color: #b45309; border-color: rgba(180,83,9,0.2);  background: rgba(180,83,9,0.06); }
  .badge-low         { color: #1d4ed8; border-color: rgba(29,78,216,0.2); background: rgba(29,78,216,0.06); }

  /* Loading */
  .loading-wrap {
    padding: 60px 32px; display: flex; align-items: center; gap: 10px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
  }
  .loading-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent); opacity: 0.5;
    animation: blink 1s infinite;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,100%{opacity:0.15} 50%{opacity:0.8} }

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fu  { animation: fadeUp 0.3s ease forwards; }
  .fu2 { animation: fadeUp 0.3s 0.07s ease both; }
  .fu3 { animation: fadeUp 0.3s 0.14s ease both; }
`;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) api.getDashboard().then(setData).finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching || !data) {
    return (
      <Shell>
        <style>{css}</style>
        <div className="loading-wrap">
          <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
          Loading dashboard…
        </div>
      </Shell>
    );
  }

  const total       = data.byStatus.reduce((a, b) => a + b.count, 0) || 1;
  const doneCount   = data.byStatus.find(s => s.status === 'done')?.count || 0;
  const inProgCount = data.byStatus.find(s => s.status === 'in_progress')?.count || 0;
  const todoCount   = data.byStatus.find(s => s.status === 'todo')?.count || 0;
  const maxUser     = Math.max(...data.tasksPerUser.map(u => u.task_count), 1);

  return (
    <Shell>
      <style>{css}</style>

      <div className="dash-header">
        <div className="dash-eyebrow">
          {user?.role === 'project_lead' ? 'Admin View' : 'Member View'}
        </div>
        <div className="dash-title">Dashboard</div>
        <div className="dash-subtitle">
          {user?.role === 'project_lead'
            ? 'Overview across all projects and team activity'
            : 'Your assigned tasks at a glance'}
        </div>
      </div>

      <div className="dash-body">

        {/* Stat strip */}
        <div className="stat-strip fu">
          <StatCell label="Total Tasks" value={data.totalTasks} dot="#999" />
          <StatCell label="Overdue"     value={data.overdueCount} dot="#c0392b" valColor="#c0392b" />
          <StatCell label="Done"        value={doneCount}         dot="#1a6b00" valColor="#1a6b00" />
          <StatCell label="In Progress" value={inProgCount}       dot="#b45309" valColor="#b45309" />
        </div>

        {/* Middle row */}
        <div className="cards-row fu2">

          {/* Tasks by status */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Tasks by Status</span>
              <span className="panel-meta">{total} total</span>
            </div>
            <div className="panel-body">
              {[
                { status:'todo',        count: todoCount,   color:'#1d4ed8' },
                { status:'in_progress', count: inProgCount, color:'#b45309' },
                { status:'done',        count: doneCount,   color:'#1a6b00' },
              ].map(({ status, count, color }) => (
                <div key={status} className="status-row">
                  <div className="status-meta">
                    <span className="status-name">{S_LABEL[status]}</span>
                    <span className="status-count" style={{ color }}>{count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${Math.round((count/total)*100)}%`, background:color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team workload */}
          {user?.role === 'project_lead' && data.tasksPerUser.length > 0 ? (
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Team Workload</span>
                <span className="panel-meta">{data.tasksPerUser.length} members</span>
              </div>
              <div className="panel-body" style={{ padding:'8px 18px' }}>
                {data.tasksPerUser.slice(0,6).map(u => (
                  <div key={u.id} className="user-row">
                    <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
                      <div className="user-name">{u.name}</div>
                      <div className="user-bar">
                        <div className="user-bar-fill" style={{ width:`${Math.round((u.task_count/maxUser)*100)}%` }} />
                      </div>
                    </div>
                    <div className="user-count">{u.task_count}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="panel" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-dim)' }}>No team data</span>
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="panel fu3">
          <div className="panel-head">
            <span className="panel-title">Recent Tasks</span>
            <span className="panel-meta">{data.recentTasks.length} shown</span>
          </div>
          <div className="panel-body">
            {data.recentTasks.length === 0 ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)' }}>No tasks yet.</p>
            ) : data.recentTasks.map(task => {
              const overdue = isOverdue(task.due_date, task.status);
              return (
                <div key={task.id} className="task-row">
                  <div className="task-info">
                    <div className={`task-title${overdue ? ' overdue' : ''}`}>
                      {overdue && '⚠ '}{task.title}
                    </div>
                    <div className="task-meta">{task.project_name} · {task.assignee_name || 'Unassigned'}</div>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <span className={`badge badge-${task.status}`}>{S_LABEL[task.status] || task.status}</span>
                  <span className={`task-date${overdue ? ' overdue' : ''}`}>{formatDate(task.due_date)}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Shell>
  );
}

function StatCell({ label, value, dot, valColor }: { label: string; value: number; dot?: string; valColor?: string }) {
  return (
    <div className="stat-cell">
      <div className="stat-label">
        <div className="stat-dot" style={{ background: dot || 'var(--text-dim)' }} />
        {label}
      </div>
      <div className="stat-val" style={{ color: valColor || 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">{children}</main>
    </div>
  );
}
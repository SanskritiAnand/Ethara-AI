const express = require('express');
const router = express.Router();
const { getDB, saveDB } = require('../database');
const { authMiddleware, requireLead } = require('../middleware/auth');

function rowsToObjs(result) {
  if (!result || !result.length || !result[0].values.length) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}
function rowToObj(result) {
  const arr = rowsToObjs(result);
  return arr[0] || null;
}

// GET /api/projects
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  let projects;
  if (req.user.role === 'project_lead') {
    const result = db.exec(`
      SELECT p.*, u.name as admin_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count
      FROM projects p
      JOIN users u ON p.admin_id = u.id
      ORDER BY p.created_at DESC
    `);
    projects = rowsToObjs(result);
  } else {
    const result = db.exec(`
      SELECT p.*, u.name as admin_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count
      FROM projects p
      JOIN users u ON p.admin_id = u.id
      JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${req.user.id}
      ORDER BY p.created_at DESC
    `);
    projects = rowsToObjs(result);
  }
  res.json(projects);
});

// POST /api/projects
router.post('/', authMiddleware, requireLead, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });

  const db = getDB();
  db.run(`INSERT INTO projects (name, description, admin_id) VALUES (?, ?, ?)`,
    [name, description || '', req.user.id]);

  const result = db.exec(`SELECT last_insert_rowid() as id`);
  const id = result[0].values[0][0];

  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [id, req.user.id]);
  saveDB();

  const proj = rowToObj(db.exec(`SELECT * FROM projects WHERE id = ${id}`));
  res.json(proj);
});

// GET /api/projects/:id
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const proj = rowToObj(db.exec(`
    SELECT p.*, u.name as admin_name FROM projects p
    JOIN users u ON p.admin_id = u.id WHERE p.id = ${req.params.id}
  `));
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const members = rowsToObjs(db.exec(`
    SELECT u.id, u.name, u.email, u.role FROM users u
    JOIN project_members pm ON pm.user_id = u.id
    WHERE pm.project_id = ${req.params.id}
  `));

  res.json({ ...proj, members });
});

// DELETE /api/projects/:id (any project_lead can delete any project)
router.delete('/:id', authMiddleware, requireLead, (req, res) => {
  const db = getDB();
  const proj = rowToObj(db.exec(`SELECT * FROM projects WHERE id = ${req.params.id}`));
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Delete tasks, members, then project
  db.run(`DELETE FROM tasks WHERE project_id = ?`, [req.params.id]);
  db.run(`DELETE FROM project_members WHERE project_id = ?`, [req.params.id]);
  db.run(`DELETE FROM projects WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

// POST /api/projects/:id/members
router.post('/:id/members', authMiddleware, requireLead, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const db = getDB();
  try {
    db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [req.params.id, userId]);
    saveDB();
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'User already a member' });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', authMiddleware, requireLead, (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
    [req.params.id, req.params.userId]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
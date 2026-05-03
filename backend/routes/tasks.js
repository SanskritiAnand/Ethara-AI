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
  return rowsToObjs(result)[0] || null;
}

router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const { projectId } = req.query;
  let query = `
    SELECT t.*, u.name as assignee_name, p.name as project_name, p.id as project_id
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  if (projectId) query += ` AND t.project_id = ${parseInt(projectId)}`;
  if (req.user.role !== 'project_lead') query += ` AND t.assignee_id = ${req.user.id}`;
  query += ` ORDER BY t.created_at DESC`;
  const result = db.exec(query);
  res.json(rowsToObjs(result));
});

router.post('/', authMiddleware, requireLead, (req, res) => {
  const { title, description, projectId, assigneeId, priority, difficulty, dueDate } = req.body;
  if (!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });
  const db = getDB();
  db.run(`INSERT INTO tasks (title, description, project_id, assignee_id, priority, difficulty, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [title, description || '', projectId, assigneeId || null, priority || 'medium', difficulty || 'medium', dueDate || null]);
  const result = db.exec(`SELECT last_insert_rowid() as id`);
  const id = result[0].values[0][0];
  saveDB();
  const task = rowToObj(db.exec(`
    SELECT t.*, u.name as assignee_name, p.name as project_name, p.id as project_id
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ${id}`));
  res.json(task);
});

router.patch('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const task = rowToObj(db.exec(`SELECT * FROM tasks WHERE id = ${req.params.id}`));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const canEdit = req.user.role === 'project_lead' || task.assignee_id === req.user.id || task.assignee_id === null;
  if (!canEdit) return res.status(403).json({ error: 'Not authorized' });

  const { title, description, assigneeId, priority, difficulty, dueDate, status, qualityScore } = req.body;

  if (req.user.role === 'project_lead') {
    const fields = [];
    const values = [];
    if (title        !== undefined) { fields.push('title = ?');         values.push(title); }
    if (description  !== undefined) { fields.push('description = ?');   values.push(description); }
    if (assigneeId   !== undefined) { fields.push('assignee_id = ?');   values.push(assigneeId); }
    if (priority     !== undefined) { fields.push('priority = ?');      values.push(priority); }
    if (difficulty   !== undefined) { fields.push('difficulty = ?');    values.push(difficulty); }
    if (dueDate      !== undefined) { fields.push('due_date = ?');      values.push(dueDate); }
    if (status       !== undefined) { fields.push('status = ?');        values.push(status); }
    if (qualityScore !== undefined) { fields.push('quality_score = ?'); values.push(qualityScore); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  } else {
    if (status      !== undefined && status      !== null) db.run(`UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, req.params.id]);
    if (qualityScore !== undefined && qualityScore !== null) db.run(`UPDATE tasks SET quality_score = ?, updated_at = datetime('now') WHERE id = ?`, [qualityScore, req.params.id]);
  }

  saveDB();
  const updated = rowToObj(db.exec(`
    SELECT t.*, u.name as assignee_name, p.name as project_name, p.id as project_id
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ${req.params.id}`));
  res.json(updated);
});

router.delete('/:id', authMiddleware, requireLead, (req, res) => {
  const db = getDB();
  db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

module.exports = router;
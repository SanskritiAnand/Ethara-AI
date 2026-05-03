const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const { authMiddleware } = require('../middleware/auth');

function rowsToObjs(result) {
  if (!result || !result.length || !result[0].values.length) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// GET /api/dashboard - analytics
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const isLead = req.user.role === 'project_lead';
  const scope = isLead ? '' : `AND t.assignee_id = ${userId}`;

  const totalTasks = db.exec(`SELECT COUNT(*) as count FROM tasks t WHERE 1=1 ${scope}`);

  const byStatus = db.exec(`SELECT status, COUNT(*) as count FROM tasks t WHERE 1=1 ${scope} GROUP BY status`);

  // Overdue = past due date AND not completed (done or approved)
  const overdue = db.exec(`
    SELECT COUNT(*) as count FROM tasks t
    WHERE due_date IS NOT NULL
      AND due_date < date('now')
      AND status NOT IN ('done', 'approved')
      ${scope}
  `);

  // Done = done OR approved
  const doneCount = db.exec(`
    SELECT COUNT(*) as count FROM tasks t
    WHERE status IN ('done', 'approved') ${scope}
  `);

  // In progress = in_progress OR in_review
  const inProgressCount = db.exec(`
    SELECT COUNT(*) as count FROM tasks t
    WHERE status IN ('in_progress', 'in_review') ${scope}
  `);

  const tasksPerUser = db.exec(`
    SELECT u.name, u.id, COUNT(t.id) as task_count,
      AVG(CASE WHEN t.quality_score IS NOT NULL THEN t.quality_score END) as avg_quality
    FROM users u
    LEFT JOIN tasks t ON t.assignee_id = u.id
    WHERE u.role != 'project_lead'
    GROUP BY u.id, u.name
    ORDER BY task_count DESC
  `);

  const recentTasks = db.exec(`
    SELECT t.*, u.name as assignee_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1 ${scope}
    ORDER BY t.updated_at DESC LIMIT 5
  `);

  res.json({
    totalTasks: totalTasks[0]?.values[0][0] || 0,
    byStatus: rowsToObjs(byStatus),
    overdueCount: overdue[0]?.values[0][0] || 0,
    doneCount: doneCount[0]?.values[0][0] || 0,
    inProgressCount: inProgressCount[0]?.values[0][0] || 0,
    tasksPerUser: rowsToObjs(tasksPerUser),
    recentTasks: rowsToObjs(recentTasks),
  });
});

module.exports = router;
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

// GET /api/users - get all users (for assignment dropdowns)
router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const result = db.exec(`SELECT id, name, email, role FROM users ORDER BY name`);
  res.json(rowsToObjs(result));
});

module.exports = router;

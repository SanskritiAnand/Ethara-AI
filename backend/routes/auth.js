const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, saveDB } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  const db = getDB();
  const existing = db.exec(`SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
  if (existing.length > 0 && existing[0].values.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const userRole = role === 'project_lead' ? 'project_lead' : 'annotator';
  
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [name, email, hash, userRole]);
  saveDB();

  const result = db.exec(`SELECT id, name, email, role FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
  const user = rowToObj(result[0]);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDB();
  const result = db.exec(`SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
  if (!result.length || !result[0].values.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rowToObj(result[0]);
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

function rowToObj(result) {
  if (!result) return null;
  const obj = {};
  result.columns.forEach((col, i) => { obj[col] = result.values[0][i]; });
  return obj;
}

module.exports = router;

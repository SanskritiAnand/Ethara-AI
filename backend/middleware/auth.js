const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ethara-ai-secret-2025';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireLead = (req, res, next) => {
  if (req.user.role !== 'project_lead') {
    return res.status(403).json({ error: 'Project Lead access required' });
  }
  next();
};

module.exports = { authMiddleware, requireLead, JWT_SECRET };

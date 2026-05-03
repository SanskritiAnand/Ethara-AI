require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Ethara Task Manager API' }));

// Start server after DB init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Ethara Task Manager API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

let db;
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

async function initDB() {
  const SQL = await initSqlJs();
  
  // Load existing DB if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'annotator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      admin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(project_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      project_id INTEGER NOT NULL,
      assignee_id INTEGER,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      difficulty TEXT DEFAULT 'medium',
      quality_score INTEGER,
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    )
  `);

  // Seed data if empty
  const userCount = db.exec("SELECT COUNT(*) as count FROM users")[0];
  const count = userCount.values[0][0];
  
  if (count === 0) {
    await seedData();
  }

  saveDB();
  return db;
}

async function seedData() {
  const hash1 = bcrypt.hashSync('password123', 10);
  const hash2 = bcrypt.hashSync('password123', 10);
  const hash3 = bcrypt.hashSync('password123', 10);
  const hash4 = bcrypt.hashSync('password123', 10);

  // Users
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Vanshika Juneja', 'lead@ethara.ai', hash1, 'project_lead']);
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Aryan Mehta', 'aryan@ethara.ai', hash2, 'annotator']);
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Priya Sharma', 'priya@ethara.ai', hash3, 'annotator']);
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Rahul Verma', 'rahul@ethara.ai', hash4, 'annotator']);

  // Projects
  db.run(`INSERT INTO projects (name, description, admin_id) VALUES (?, ?, ?)`,
    ['GPT-4o Response Evaluation – Batch 3', 'Evaluate prompt-response pairs for instruction following, accuracy, and naturalness dimensions.', 1]);
  db.run(`INSERT INTO projects (name, description, admin_id) VALUES (?, ?, ?)`,
    ['Healthcare Domain SFT Dataset', 'Create domain-specific instruction datasets for healthcare LLM fine-tuning.', 1]);
  db.run(`INSERT INTO projects (name, description, admin_id) VALUES (?, ?, ?)`,
    ['Code Generation RLHF Pipeline', 'Human feedback loops for Python and JavaScript code generation tasks.', 1]);

  // Members
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [1, 1]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [1, 2]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [1, 3]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [2, 1]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [2, 2]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [2, 4]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [3, 1]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [3, 3]);
  db.run(`INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`, [3, 4]);

  // Tasks - past due dates for overdue simulation
  const tasks = [
    [1, 'Evaluate prompt-response pair #47 – Instruction Following', 'Rate Response A vs B on instruction following dimension. Focus on format compliance and constraint adherence.', 1, 2, 'in_progress', 'high', 'hard', null, '2026-04-28'],
    [1, 'Evaluate prompt-response pair #52 – Accuracy Check', 'Verify all factual claims in both responses. Flag any hallucinations or incorrect data.', 1, 3, 'done', 'high', 'hard', 4, '2026-04-30'],
    [1, 'Annotate coding dataset – Python functions', 'Label and categorize Python function generation prompts by difficulty and domain.', 1, 2, 'todo', 'medium', 'medium', null, '2026-05-10'],
    [1, 'Review naturalness dimension – batch 3A', 'Flag robotic or unnatural responses. Provide evidence-based justifications.', 1, 3, 'in_progress', 'medium', 'easy', null, '2026-05-05'],
    [1, 'Evaluate completeness – medical Q&A pairs', 'Assess whether responses address all parts of the medical queries without omission.', 1, 2, 'todo', 'low', 'medium', null, '2026-05-15'],
    [2, 'Create instruction dataset – cardiology domain', 'Draft 50 high-quality instruction-response pairs for cardiology specialist queries.', 2, 4, 'in_progress', 'high', 'hard', null, '2026-04-25'],
    [2, 'Annotate pharmacology prompts', 'Label drug interaction queries with difficulty, domain, and quality score.', 2, 2, 'todo', 'medium', 'medium', null, '2026-05-08'],
    [2, 'Review SFT dataset – oncology subset', 'Quality check 30 oncology instruction pairs for accuracy and completeness.', 2, 4, 'done', 'high', 'hard', 5, '2026-04-20'],
    [3, 'RLHF feedback – Python code generation #12', 'Evaluate two Python code responses for correctness, efficiency, and style. Rank and justify.', 3, 3, 'done', 'high', 'hard', 5, '2026-04-22'],
    [3, 'RLHF feedback – JavaScript async functions', 'Compare responses for async/await implementations. Check for edge case handling.', 3, 4, 'in_progress', 'medium', 'hard', null, '2026-05-02'],
    [3, 'Annotate reward model training data – batch 7', 'Rank model outputs by preference for RL training signal generation.', 3, 3, 'todo', 'high', 'medium', null, '2026-05-12'],
    [3, 'Evaluate SQL query generation responses', 'Assess accuracy of SQL queries generated from natural language prompts.', 3, 2, 'todo', 'low', 'medium', null, '2026-05-20'],
  ];

  for (const t of tasks) {
    db.run(`INSERT INTO tasks (project_id, title, description, assignee_id, status, priority, difficulty, quality_score, due_date, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [t[0], t[1], t[2], t[3] - 1, t[4], t[5], t[6], t[7], t[9]]);
  }
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getDB() {
  return db;
}

// Auto-save every 5 seconds
setInterval(saveDB, 5000);

module.exports = { initDB, getDB, saveDB };
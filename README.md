# Ethara AI 

A full-stack team task management application where Project Leads create projects, assign tasks to team members, track progress, and view analytics — built with Next.js, Express, and SQLite.



## Live Demo

- **Frontend (Vercel):** 
- **Backend (Render):** 
- **GitHub:** https://github.com/SanskritiAnand/Ethara-AI



## Features

### User Authentication
- Signup with Name, Email, Password, and Role
- Secure login with JWT (stored in localStorage)
- Protected routes redirect unauthenticated users to login
- Role embedded in JWT — no extra DB call needed for permission checks

### Project Management
- Project Leads can create projects (creator becomes admin automatically)
- Admin can add and remove members from projects
- Members only see projects they've been added to

### Task Management
- Create tasks with Title, Description, Due Date, Priority, and Assignee
- Update task status: Queued → To Do → In Progress → In Review → Done → Approved
- Overdue tasks highlighted in red (due date passed and not done)
- Delete tasks (Project Lead only)

### Dashboard
- Total task count
- Overdue task count
- Tasks grouped by status (via SQL GROUP BY)
- Team workload — task count per member
- 5 most recently updated tasks

### Role-Based Access
| Feature | Project Lead | Member |
|---|---|---|
| Create projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Update any task status | ✅ | ❌ |
| Update assigned task status | ✅ | ✅ |
| View all tasks | ✅ | assigned only |
| View dashboard | ✅ | ✅ (own data) |



## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Backend | Node.js, Express |
| Database | SQLite via sql.js (persisted to disk) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Deployment | Railway (backend), Vercel (frontend) |



## Project Structure

```
team-task-manager/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── dashboard/page.tsx
│       │   ├── projects/
│       │   │   ├── page.tsx
│       │   │   └── [id]/page.tsx
│       │   ├── tasks/page.tsx
│       │   ├── login/page.tsx
│       │   └── signup/page.tsx
│       ├── components/
│       │   └── Sidebar.tsx
│       └── lib/
│           ├── api.ts
│           └── auth-context.tsx
└── backend/
    └── src/
        ├── server.js
        ├── database.js
        ├── middleware/
        │   └── auth.js
        └── routes/
            ├── auth.js
            ├── projects.js
            ├── tasks.js
            ├── dashboard.js
            └── users.js
```



## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/SanskritiAnand/Ethara-AI
cd team-task-manager
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
node src/server.js
```

Backend runs at `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`



## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Route | Description | Role |
|---|---|---|---|
| GET | `/api/projects` | List user's projects | All |
| POST | `/api/projects` | Create project | Lead |
| GET | `/api/projects/:id` | Get project + members | All |
| POST | `/api/projects/:id/members` | Add member | Lead |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Lead |
| DELETE | `/api/projects/:id` | Delete project | Lead |

### Tasks
| Method | Route | Description | Role |
|---|---|---|---|
| GET | `/api/tasks` | Get all tasks (filtered by role) | All |
| POST | `/api/tasks` | Create task | Lead |
| PATCH | `/api/tasks/:id` | Update task | Lead / Assignee |
| DELETE | `/api/tasks/:id` | Delete task | Lead |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Aggregated stats |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List all users (for dropdowns) |



## Database Schema

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'annotator',  -- 'project_lead' or 'annotator'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  admin_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project Members (many-to-many)
CREATE TABLE project_members (
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (project_id, user_id)
);

-- Tasks
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',  -- low / medium / high
  status TEXT DEFAULT 'queued',    -- queued / todo / in_progress / in_review / done / approved
  due_date TEXT,
  project_id INTEGER REFERENCES projects(id),
  assignee_id INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  quality_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```



## Demo Video

[Watch the demo here](https://your-video-link)

Features covered:
- User signup and JWT authentication
- Project creation and member management
- Task creation, assignment, and status updates
- Dashboard analytics
- Role-based access control
- Live deployment on Render + Vercel



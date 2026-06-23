#  PMS — Project Management System

A full-stack web application for managing projects and tasks with user authentication.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL + Sequelize ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Security | express-rate-limit, CORS |

## Prerequisites

- Node.js v18+
- MySQL 8+
- npm v9+

## Project Structure

```
project-management-system/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── backend/           # Express API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── validations/
```

## Setup

### 1. Database

```sql
CREATE DATABASE pms_db;
```

### 2. Backend

```bash
cd backend
npm install
```

Edit `.env` with your credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pms_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

```bash
npm run dev
```

Tables are auto-created by Sequelize on first run.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**  
API runs at **http://localhost:5000**

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `secret` |
| `DB_NAME` | Database name | `pms_db` |
| `JWT_SECRET` | JWT signing secret | `some_long_random_string` |
| `PORT` | Backend port | `5000` |

## Features

- **User Authentication** — Register, login, logout with JWT (7-day expiry)
- **Project Management** — Create, read, update, delete projects with search & status filter
- **Task Management** — Full CRUD tasks per project, filter by status/priority/search
- **Dashboard** — Live stats: total projects, tasks, completed, pending, in-progress
- **Security** — bcrypt hashing, rate limiting on auth, ownership enforcement (403), Sequelize ORM only

# API Documentation — Kiro PMS

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{ "fullname": "John Smith", "email": "john@example.com", "password": "secret123" }
```
**Success:** `201 { message: "User registered successfully." }`  
**Errors:** `400` (validation), `409` (email taken)

---

### POST /auth/login
Login and receive a JWT.

**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Success:** `200 { token, user: { id, fullname, email } }`  
**Errors:** `400` (validation), `401` (invalid credentials)

---

### POST /auth/logout
Logout (stateless — clears on frontend).

**Success:** `200 { message: "Logged out successfully." }`

---

## Project Endpoints

All require Bearer token.

### GET /projects
List all projects. Supports `?search=` and `?status=`.

**Success:** `200 [...]`

---

### GET /projects/:id
Get single project with its tasks.

**Success:** `200 { ...project, Tasks: [...] }`  
**Errors:** `403` (not owner), `404` (not found)

---

### POST /projects
Create a project.

**Body:**
```json
{
  "project_name": "Website Redesign",
  "description": "Redesign the company website",
  "status": "Not Started",
  "start_date": "2026-07-01",
  "end_date": "2026-09-30"
}
```
**Success:** `201 { ...project }`  
**Errors:** `400` (validation)

---

### PUT /projects/:id
Update a project. Same body as POST.

**Success:** `200 { ...project }`  
**Errors:** `400`, `403`, `404`

---

### DELETE /projects/:id
Delete project and all its tasks (cascade).

**Success:** `200 { message: "Project deleted successfully." }`  
**Errors:** `403`, `404`

---

## Task Endpoints

All require Bearer token.

### GET /tasks
List all tasks. Supports `?project_id=`, `?search=`, `?status=`, `?priority=`.

**Success:** `200 [...]`

---

### GET /tasks/:id
Get single task.

**Success:** `200 { ...task }`  
**Errors:** `403`, `404`

---

### POST /tasks
Create a task.

**Body:**
```json
{
  "project_id": 1,
  "task_name": "Design mockups",
  "description": "Create initial wireframes",
  "priority": "High",
  "status": "Pending",
  "due_date": "2026-07-15"
}
```
**Success:** `201 { ...task }`  
**Errors:** `400` (validation), `403` (project not owned)

---

### PUT /tasks/:id
Update task. Same body minus `project_id`.

**Success:** `200 { ...task }`  
**Errors:** `400`, `403`, `404`

---

### DELETE /tasks/:id
Delete a task.

**Success:** `200 { message: "Task deleted successfully." }`  
**Errors:** `403`, `404`

---

## Dashboard Endpoint

### GET /dashboard
Get summary stats for the logged-in user.

**Success:**
```json
{
  "total_projects": 5,
  "total_tasks": 20,
  "completed_tasks": 8,
  "pending_tasks": 7,
  "projects_in_progress": 3
}
```
**Errors:** `401`

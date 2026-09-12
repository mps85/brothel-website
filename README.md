# Brothel Website

Full-stack web app with React, Node.js (Express), and PostgreSQL.

Private, local project to facilitate learning the tech stack and prompt engineering.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL 16 (Docker)

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
npm run db:up
```

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

### 4. Run database migrations

```bash
npm run db:migrate -w backend
```

### 5. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend together |
| `npm run dev:frontend` | Start React dev server only |
| `npm run dev:backend` | Start Express server only |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run build` | Build both apps for production |
| `npm run docs` | Regenerate README endpoint table + CHANGELOG |

## Project Structure

```
brothel-website/
├── frontend/          React app (Vite)
├── backend/           Express API
├── docker-compose.yml PostgreSQL service
└── package.json       npm workspaces root
```

<!-- ENDPOINTS:START -->
## API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/health` | Public | Health check + DB status. |
| POST | `/api/login` | Public | Authenticate with email/password; returns user, roles, and session token. |
| POST | `/api/logout` | Public | Revoke the session token. |
| GET | `/api/users` | Admin | List all users and their roles (admin only). |
| POST | `/api/users` | Admin | Create a user, optionally with roles (admin only). |
| DELETE | `/api/users/:username` | Admin | Delete a user by username (admin only). |
| GET | `/api/messages` | Auth | List all messages (auth required). |
| GET | `/api/messages/:id` | Auth | Fetch a message by id, or the newest with ":id=latest" (auth required). |
| POST | `/api/messages` | Auth | Post a message as the authenticated user. |
<!-- ENDPOINTS:END -->

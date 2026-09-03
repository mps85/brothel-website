# Brothel Website

Full-stack web app with React, Node.js (Express), and PostgreSQL.

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

## Project Structure

```
brothel-website/
├── frontend/          React app (Vite)
├── backend/           Express API
├── docker-compose.yml PostgreSQL service
└── package.json       npm workspaces root
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + DB status |
| GET | `/api/messages` | List all messages |
| POST | `/api/messages` | Create a message |

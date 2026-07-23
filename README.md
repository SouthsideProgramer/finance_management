# FinCalc

Trang web quản lý tài chính với AI Chatbot hỗ trợ.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Backend**: Node.js + Express
- **AI**: Python (LLM + RAG)
- **Database**: PostgreSQL + Prisma

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev

# Docker (all services)
docker-compose up
```

## Project Structure

```
├── frontend/       # React SPA
├── backend/        # Express API
├── ai/             # Python AI services
├── database/       # SQL schemas + Prisma
├── uploads/        # User uploads
├── docs/           # Documentation
├── docker/         # Dockerfiles
└── docker-compose.yml
```

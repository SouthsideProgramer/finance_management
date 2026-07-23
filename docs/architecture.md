# Kiến trúc hệ thống FinCalc

## Tổng quan

```mermaid
flowchart LR
    A[Frontend<br/>React + Vite + Tailwind] --> B[Backend<br/>Express + Node.js]
    B --> C[(Database<br/>PostgreSQL + Prisma)]
    B --> D[AI Service<br/>Python + LLM]
    D --> E[OpenAI API]
    B --> F[Vector Store<br/>RAG]
```

## Frontend

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Bundler**: Vite
- **State**: React hooks (useState, useCallback, useMemo)
- **Routing**: Client-side state (page switching)
- **Port**: 8443

## Backend

- **Runtime**: Node.js
- **Framework**: Express
- **Port**: 3001

### Routes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/health | Kiểm tra trạng thái |
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |
| GET | /api/users/me | Thông tin người dùng |
| PUT | /api/users/me | Cập nhật hồ sơ |
| GET | /api/transactions | Danh sách giao dịch |
| POST | /api/transactions | Tạo giao dịch mới |
| POST | /api/chat | Gửi tin nhắn AI |
| GET | /api/chat/:id/history | Lịch sử chat |

## Database

- **Engine**: PostgreSQL 16
- **ORM**: Prisma
- **Port**: 5432

## AI Service

- **Language**: Python
- **LLM**: OpenAI GPT-4 (tùy chọn)
- **RAG**: Vector embedding + similarity search
- **Tools**: Weather, SQL, Web Search (mở rộng)

```mermaid
flowchart TD
    A[User Question] --> B[Prompt Builder]
    B --> C[System Prompt]
    B --> D[Chat History]
    B --> E[User Message]
    C --> F[LLM]
    D --> F
    E --> F
    F --> G{Cần tool?}
    G -->|Yes| H[Execute Tool]
    H --> I[Append Result]
    I --> F
    G -->|No| J[Return Response]
```

## Docker

```mermaid
flowchart TD
    A[docker-compose] --> B[frontend:8443]
    A --> C[backend:3001]
    A --> D[db:5432]
    C --> D
```

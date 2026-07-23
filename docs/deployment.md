# Deployment

## Yêu cầu

- Node.js >= 20
- npm
- Docker (cho PostgreSQL)

## Cài đặt lần đầu

```bash
# 1. Cài dependencies Frontend
cd frontend
npm install

# 2. Cài dependencies Backend
cd ../backend
npm install

# 3. Khởi chạy PostgreSQL
docker run -d \
  --name fincalc-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fincalc \
  -p 5432:5432 \
  -v fincalc-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# 4. Tạo .env cho backend
cat > backend/.env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fincalc"
JWT_SECRET=fincalc-jwt-secret-2026
FRONTEND_URL=http://localhost:8443
EOF

# 5. Tạo bảng + seed data
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

## Chạy hàng ngày

```bash
# Terminal 1 — Khởi PostgreSQL (nếu chưa chạy)
docker start fincalc-db

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:8443

# Terminal 3 — Backend
cd backend
npm run dev
# → http://localhost:3001
```

## Docker Compose (tùy chọn)

```bash
# Khởi chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả
docker-compose down
```

## Kiểm tra

```bash
# Health check
curl http://localhost:3001/api/health
# → {"status":"ok","timestamp":"..."}

# Đăng nhập (seed user)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenvana@email.com","password":"password123"}'
# → { token: "eyJ...", user: { name: "Nguyễn Văn A" } }

# Xem giao dịch (dùng token từ login)
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer <token>"
# → { data: [...8 records...], total: 8 }
```

## Database Management

### Prisma Scripts

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Tạo migration mới
npm run db:migrate

# Push schema trực tiếp (không tạo migration)
npm run db:push

# Seed data
npm run db:seed

# Reset database (xóa + tạo lại + seed)
npm run db:reset
```

### Xem Prisma Studio (GUI)

```bash
cd backend
npx prisma studio
# → http://localhost:5555
```

## Dừng services

```bash
# Dừng backend & frontend (Ctrl+C trong terminal)

# Dừng PostgreSQL
docker stop fincalc-db

# Xóa PostgreSQL data (bắt đầu lại từ đầu)
docker rm -f fincalc-db
docker volume rm fincalc-pgdata
```

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 8443 | http://localhost:8443 |
| Backend (Express) | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | postgresql://localhost:5432/fincalc |

## Seed Accounts

| Email | Password | Name |
|-------|----------|------|
| nguyenvana@email.com | password123 | Nguyễn Văn A |
| tranthib@email.com | password123 | Trần Thị B |

## Database Schema

### Bảng chính

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin người dùng |
| `bank_accounts` | Thẻ/tài khoản ngân hàng |
| `user_sessions` | Phiên đăng nhập & refresh tokens |
| `transactions` | Giao dịch tài chính |
| `conversations` | Cuộc trò chuyện AI |
| `messages` | Tin nhắn trong cuộc trò chuyện |
| `chat_history` | Lịch sử chat (flat query) |

### Xem schema

```bash
cd backend
cat prisma/schema.prisma
```

## Troubleshooting

### Container đã tồn tại

```bash
# Kiểm tra container
docker ps -a | grep fincalc

# Start lại
docker start fincalc-db

# Hoặc xóa rồi chạy mới
docker rm -f fincalc-db
docker run -d \
  --name fincalc-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fincalc \
  -p 5432:5432 \
  -v fincalc-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Port 5432 đã sử dụng

```bash
# Kiểm tra process sử dụng port
lsof -i :5432

# Hoặc dùng port khác
docker run -d \
  --name fincalc-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fincalc \
  -p 5433:5432 \
  -v fincalc-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Database không kết nối được

```bash
# Kiểm tra container đang chạy
docker ps | grep fincalc

# Kiểm tra logs
docker logs fincalc-db

# Test kết nối
psql -h localhost -p 5432 -U postgres -d fincalc
```

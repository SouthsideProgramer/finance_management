# FinCalc — Ứng dụng quản lý tài chính

Ứng dụng web quản lý tài chính cá nhân, kèm chatbot AI hỗ trợ tương tác và truy vấn thông minh. Dự án gồm frontend React, backend Express, dịch vụ AI nhỏ bằng Python và Prisma để quản lý cơ sở dữ liệu PostgreSQL.

**Tổng quan quy trình phát triển (theo code trong repository):**

- Bước 1 — Ý tưởng & thiết kế: xác định tính năng chính (dashboard, phân tích, lịch sử giao dịch, AI chat, xác thực người dùng).
- Bước 2 — Thiết lập môi trường: tạo workspace frontend (Vite + React + TypeScript + Tailwind) và backend (Node.js + Express, định nghĩa API routes).
- Bước 3 — Database: định nghĩa schema với Prisma, tạo migration và seed dữ liệu mẫu (xem `backend/prisma` và `database/`).
- Bước 4 — Xây dựng backend: cài đặt routes và controllers (auth, users, transactions, chat, bank-accounts, sessions). Thiết lập CORS, error handler và route health check (`/api/health`).
- Bước 5 — Xây dựng frontend: xây dựng layout, pages (`Dashboard`, `Analytics`, `History`, `Settings`, `AIChat`, `Auth`) và component tái sử dụng (chart, navbar, dark toggle...). Kết nối với API thông qua service `frontend/src/services/api.ts`.
- Bước 6 — Tích hợp AI: đặt thư mục `ai/` để chứa logic gọi LLM (hiện là placeholder `ai/llm.py`) và module RAG nếu cần.
- Bước 7 — Chạy thử & deploy: chạy dev servers cục bộ (Vite & node), hoặc dùng Docker / docker-compose để chạy tất cả service; deploy frontend lên Vercel và backend/AI theo lựa chọn (Cloud Run, VPS, Heroku, hoặc container service).
- Bước 8 — Hoàn thiện: thêm test, cải thiện UI/UX, bảo mật, và tối ưu hoá hiệu năng.

## Cài đặt nhanh (Development)

1) Frontend

```bash
cd frontend
npm install
npm run dev
```

Trang dev mặc định dùng Vite; truy cập qua preview panel (port thường là 8443 trong môi trường dev của bạn).

2) Backend

```bash
cd backend
npm install
npm run dev
```

- Script `dev` dùng `node --watch src/server.js` (auto-restart khi file thay đổi).
- Server expose các route chính: `/api/auth`, `/api/users`, `/api/transactions`, `/api/chat`, `/api/bank-accounts`, `/api/sessions`.

3) Database (Prisma + PostgreSQL)

```bash
cd backend
npm run db:generate   # npx prisma generate
npm run db:migrate    # npx prisma migrate dev
npm run db:seed       # node prisma/seed.js
```

Hoặc dùng `docker-compose up` để dựng toàn bộ stack (nếu đã cấu hình trong `docker/` và `docker-compose.yml`).

4) AI service

- Thư mục `ai/` chứa mã Python gọi LLM. Hiện `ai/llm.py` là placeholder; bạn cần tích hợp provider (OpenAI, Anthropic, hoặc model nội bộ) và thực hiện pipeline RAG nếu muốn truy vấn dựa trên vector store.

## Các điểm quan trọng từ code hiện tại

- Backend: `backend/src/server.js` cấu hình CORS có whitelist origin, middleware JSON, error handler, và định nghĩa health check.
- Frontend: `frontend/src/App.tsx` chứa điều hướng chính, quản lý state auth, dark mode, và các page components.
- AI: `ai/llm.py` là điểm tích hợp LLM — cần triển khai thực tế.
- Prisma & database: folder `prisma/` và `database/` giữ schema và migration; dùng các script `db:*` trong `backend/package.json`.

## Triển khai (gợi ý)

- Frontend: deploy lên Vercel (hoặc Netlify) bằng cách kết nối repo GitHub.
- Backend: deploy bằng container (Cloud Run / Docker) hoặc server Node truyền thống; nhớ set biến môi trường (`DATABASE_URL`, `JWT_SECRET`, ...).
- AI service: nếu dùng Python riêng, có thể triển khai dưới dạng Cloud Function/Cloud Run hoặc cùng container với backend.

## Cấu trúc thư mục (tóm tắt)

```
frontend/   # React + Vite app
backend/    # Express API, prisma, migrations, seed
ai/         # Python LLM / RAG utils
database/   # SQL schema + helpers
docker/     # Dockerfiles
docs/       # Tài liệu thiết kế
```

## Làm tiếp (gợi ý cải tiến)

- Hoàn thiện tích hợp LLM trong `ai/llm.py` và test RAG pipeline.
- Thêm unit/integration tests cho backend và frontend.
- Tối ưu hoá bảo mật (rate limit, input validation, hardening JWT handling).
- Tự động hoá CI/CD để chạy migration và deploy khi push lên main.

---

Nếu bạn muốn, tôi có thể:
- lưu nội dung README này vào file và commit giúp bạn;
- hoặc tách thành README tiếng Việt + README tiếng Anh;
- hoặc mở rộng phần hướng dẫn deploy chi tiết cho Vercel / Docker / Cloud Run.

Bạn muốn tôi làm bước nào tiếp theo? 


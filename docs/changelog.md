# Changelog

## [1.0.0] - 2026-07-23

### Added
- Dashboard với 5 chế độ tính toán (Lãi kép, Lãi đơn, Gửi góp, Vay EMI, Mục tiêu)
- Biểu đồ SVG trực quan với tooltip và animated line
- Chuyển đổi đơn vị thời gian (Năm / Quý / Tháng)
- Trang Phân tích đầu tư với multi-scenario comparison
- Biểu đồ Donut cơ cấu dòng tiền
- Gợi ý từ AI giữa các kịch bản
- Trang Nhật ký dòng tiền với tìm kiếm và lọc
- Trang Cài đặt (Cá nhân, Giao diện, Quyền riêng tư, Mặc định)
- AI Chatbox với gợi ý nhanh
- Dark mode (Sáng / Tối / Hệ thống)
- Animated number transitions
- Responsive design (desktop, tablet, mobile)

### Project Structure
- Refactor từ 1 file App.tsx (1450+ dòng) → modular structure
- Tách types, utils, hooks, components, pages
- Thêm backend (Express), AI service (Python), database (PostgreSQL + Prisma)
- Docker Compose cho toàn bộ services

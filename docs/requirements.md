# Yêu cầu hệ thống FinCalc

## Chức năng

### Dashboard
- Tính toán tài chính: Lãi kép, Lãi đơn, Gửi góp (SIP), Vay EMI, Mục tiêu
- Biểu đồ trực quan tăng trưởng theo thời gian
- Chuyển đổi đơn vị thời gian (Năm / Quý / Tháng)
- Sao chép kết quả tính toán

### Phân tích đầu tư
- So sánh nhiều kịch bản đầu tư song song
- Biểu đồ đa đường (multi-line chart)
- Biểu đồ Donut cơ cấu dòng tiền
- Tùy chỉnh lạm phát, thuế, thời gian phân tích
- Gợi ý từ AI giữa các kịch bản

### Nhật ký dòng tiền
- Hiển thị lịch sử giao dịch (nạp / rút)
- Tìm kiếm và lọc theo loại giao dịch
- Xuất CSV

### Trợ lý AI Chatbot
- Tư vấn kế hoạch tiết kiệm, vay, đầu tư
- Gợi ý phân bổ tài chính
- Lưu lịch sử hội thoại

### Quản lý tài khoản
- Cập nhật thông tin cá nhân (tên, email, avatar)
- Đổi giao diện (Sáng / Tối / Hệ thống)
- Ẩn/hiện số dư mặc định
- Đặt giá trị mặc định cho calculator

## Phi chức năng

- **Responsive**: Hỗ trợ desktop, tablet, mobile
- **Dark mode**: Tự động theo hệ thống hoặc chuyển thủ công
- **Bảo mật**: JWT authentication, ẩn số dư, mask số thẻ
- **Hiệu suất**: Animated number transitions, lazy rendering
- **Ngôn ngữ**: Giao diện tiếng Việt
- **Thời gian phản hồi**: < 2s cho các phép tính, < 5s cho AI response

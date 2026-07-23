-- FinCalc Seed Data
-- Password hashes are bcrypt hash of "password123"

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, name, email, password_hash, theme, show_balance_default) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nguyễn Văn A', 'nguyenvana@email.com', '$2b$10$placeholder_hash_001', 'light', FALSE),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Trần Thị B',   'tranthib@email.com',   '$2b$10$placeholder_hash_002', 'dark',  TRUE);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
INSERT INTO transactions (id, user_id, type, amount, description, quarter, status, created_at) VALUES
('TXN-0812', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit',  20000000, 'Chuyển khoản định kỳ',     'Q2-2026', 'completed', '2026-06-28'),
('TXN-0811', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'withdraw',  5000000, 'Rút tiêu dùng',            'Q2-2026', 'completed', '2026-06-25'),
('TXN-0810', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit',  12500000, 'Lãi kép cuối tháng',       'Q2-2026', 'completed', '2026-06-20'),
('TXN-0809', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit',  10000000, 'Gửi góp định kỳ',          'Q2-2026', 'completed', '2026-06-15'),
('TXN-0808', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'withdraw', 15000000, 'Rút tiết kiệm',            'Q2-2026', 'pending',   '2026-06-10'),
('TXN-0807', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit',   8000000, 'Thu nhập đầu tư',          'Q2-2026', 'completed', '2026-06-05'),
('TXN-0806', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit',  20000000, 'Chuyển khoản định kỳ',     'Q2-2026', 'completed', '2026-06-01'),
('TXN-0805', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'withdraw',  2000000, 'Thanh toán phí quản lý',   'Q1-2026', 'completed', '2026-05-28');

-- ============================================================
-- CONVERSATIONS
-- ============================================================
INSERT INTO conversations (id, user_id, title, created_at) VALUES
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kế hoạch tiết kiệm 5 năm',        '2026-06-20 10:00:00+07'),
('c2d3e4f5-b6c7-8901-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'So sánh lãi kép với gửi góp',      '2026-06-22 14:30:00+07');

-- ============================================================
-- MESSAGES
-- ============================================================
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'assistant', 'Xin chào! Tôi có thể giúp bạn lên kế hoạch tiết kiệm. Bạn muốn bắt đầu từ đâu?', '2026-06-20 10:00:00+07'),
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'user',      'Làm sao để tiết kiệm 100 triệu trong 5 năm?',                                   '2026-06-20 10:01:00+07'),
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'assistant', 'Để tích lũy 100 triệu trong 5 năm, bạn cần gửi khoảng 1.5 triệu/tháng với lãi suất 8%/năm.', '2026-06-20 10:01:30+07'),

('c2d3e4f5-b6c7-8901-defa-234567890123', 'user',      'So sánh lãi kép với gửi góp hàng tháng',                                        '2026-06-22 14:30:00+07'),
('c2d3e4f5-b6c7-8901-defa-234567890123', 'assistant', 'Lãi kép tốt hơn khi bạn có số tiền lớn ban đầu. Gửi góp phù hợp nếu bạn muốn phân bổ dần.', '2026-06-22 14:30:30+07');

-- ============================================================
-- CHAT_HISTORY (mirror of messages for flat queries)
-- ============================================================
INSERT INTO chat_history (user_id, role, content, created_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'assistant', 'Xin chào! Tôi có thể giúp bạn lên kế hoạch tiết kiệm.', '2026-06-20 10:00:00+07'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'user',      'Làm sao để tiết kiệm 100 triệu trong 5 năm?',            '2026-06-20 10:01:00+07'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'assistant', 'Bạn cần gửi khoảng 1.5 triệu/tháng với lãi suất 8%/năm.', '2026-06-20 10:01:30+07'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'user',      'So sánh lãi kép với gửi góp hàng tháng',                 '2026-06-22 14:30:00+07'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'assistant', 'Lãi kép tốt hơn khi có số tiền lớn ban đầu.',             '2026-06-22 14:30:30+07');

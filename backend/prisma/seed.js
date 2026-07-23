import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean
  await prisma.chatHistory.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.userSession.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // Users
  const userA = await prisma.user.create({
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      passwordHash,
      theme: 'light',
      showBalanceDefault: false,
    },
  })

  const userB = await prisma.user.create({
    data: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      fullName: 'Trần Thị B',
      email: 'tranthib@email.com',
      passwordHash,
      theme: 'dark',
      showBalanceDefault: true,
    },
  })

  console.log(`Created users: ${userA.fullName}, ${userB.fullName}`)

  // Bank Accounts
  const bankAccounts = await prisma.bankAccount.createMany({
    data: [
      { userId: userA.id, bankName: 'Vietcombank', maskedCardNumber: '9704 •••• •••• 5678', expDate: '12/28', isPrimary: true },
      { userId: userA.id, bankName: 'Techcombank', maskedCardNumber: '9704 •••• •••• 1234', expDate: '06/27', isPrimary: false },
      { userId: userB.id, bankName: 'MB Bank',     maskedCardNumber: '9704 •••• •••• 9012', expDate: '03/29', isPrimary: true },
    ],
  })
  console.log(`Created ${bankAccounts.count} bank accounts`)

  // Transactions
  const txns = await prisma.transaction.createMany({
    data: [
      { userId: userA.id, type: 'deposit',  amount: 20000000n, description: 'Chuyển khoản định kỳ',   quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-28') },
      { userId: userA.id, type: 'withdraw', amount: 5000000n,  description: 'Rút tiêu dùng',          quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-25') },
      { userId: userA.id, type: 'deposit',  amount: 12500000n, description: 'Lãi kép cuối tháng',     quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-20') },
      { userId: userA.id, type: 'deposit',  amount: 10000000n, description: 'Gửi góp định kỳ',        quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-15') },
      { userId: userA.id, type: 'withdraw', amount: 15000000n, description: 'Rút tiết kiệm',          quarter: 'Q2-2026', status: 'pending',   createdAt: new Date('2026-06-10') },
      { userId: userA.id, type: 'deposit',  amount: 8000000n,  description: 'Thu nhập đầu tư',        quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-05') },
      { userId: userA.id, type: 'deposit',  amount: 20000000n, description: 'Chuyển khoản định kỳ',   quarter: 'Q2-2026', status: 'completed', createdAt: new Date('2026-06-01') },
      { userId: userA.id, type: 'withdraw', amount: 2000000n,  description: 'Thanh toán phí quản lý', quarter: 'Q1-2026', status: 'completed', createdAt: new Date('2026-05-28') },
    ],
  })
  console.log(`Created ${txns.count} transactions`)

  // Conversations + Messages
  const conv1 = await prisma.conversation.create({
    data: {
      id: 'c1d2e3f4-a5b6-7890-cdef-123456789012',
      userId: userA.id,
      title: 'Kế hoạch tiết kiệm 5 năm',
    },
  })

  const conv2 = await prisma.conversation.create({
    data: {
      id: 'c2d3e4f5-b6c7-8901-defa-234567890123',
      userId: userA.id,
      title: 'So sánh lãi kép với gửi góp',
    },
  })

  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, role: 'assistant', content: 'Xin chào! Tôi có thể giúp bạn lên kế hoạch tiết kiệm. Bạn muốn bắt đầu từ đâu?' },
      { conversationId: conv1.id, role: 'user',      content: 'Làm sao để tiết kiệm 100 triệu trong 5 năm?' },
      { conversationId: conv1.id, role: 'assistant', content: 'Để tích lũy 100 triệu trong 5 năm, bạn cần gửi khoảng 1.5 triệu/tháng với lãi suất 8%/năm.' },
      { conversationId: conv2.id, role: 'user',      content: 'So sánh lãi kép với gửi góp hàng tháng' },
      { conversationId: conv2.id, role: 'assistant', content: 'Lãi kép tốt hơn khi bạn có số tiền lớn ban đầu. Gửi góp phù hợp nếu bạn muốn phân bổ dần.' },
    ],
  })

  console.log('Created 2 conversations with messages')
  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

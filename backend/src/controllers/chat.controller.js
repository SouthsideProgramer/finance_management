import prisma from '../config/database.js'

export async function sendMessage(req, res) {
  try {
    const { message, conversationId } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Create or reuse conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: req.userId },
      })
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: req.userId,
          title: message.trim().slice(0, 80),
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim(),
      },
    })

    // Generate AI reply (placeholder — replace with real LLM call)
    const reply = generateReply(message.trim())

    // Save assistant reply
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    // Mirror to chat_history
    await prisma.chatHistory.createMany({
      data: [
        { userId: req.userId, role: 'user', content: message.trim() },
        { userId: req.userId, role: 'assistant', content: reply },
      ],
    })

    res.json({
      conversationId: conversation.id,
      reply: { role: 'assistant', content: reply },
    })
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

export async function getHistory(req, res) {
  try {
    const { conversationId } = req.params

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: req.userId },
    })

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true, createdAt: true },
    })

    res.json({ messages })
  } catch (err) {
    console.error('Get history error:', err)
    res.status(500).json({ error: 'Failed to get history' })
  }
}

export async function listConversations(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    })

    res.json({ conversations })
  } catch (err) {
    console.error('List conversations error:', err)
    res.status(500).json({ error: 'Failed to list conversations' })
  }
}

// ── Placeholder AI reply (replace with LLM integration) ─────
function generateReply(userMessage) {
  const lower = userMessage.toLowerCase()

  if (lower.includes('vay')) {
    return 'Nếu mục tiêu là giảm áp lực lãi vay, ưu tiên chọn kỳ hạn ngắn hơn, giữ tỷ lệ nợ dưới 30% thu nhập và ưu tiên trả trước phần dư nợ có lãi cao.'
  }
  if (lower.includes('đầu tư') || lower.includes('gửi')) {
    return 'Một cách tối ưu là giữ 60% vào khoản có lãi ổn định, 30% vào danh mục tăng trưởng và 10% dành cho dự phòng khẩn cấp.'
  }
  if (lower.includes('tiết kiệm') || lower.includes('mục tiêu')) {
    return 'Để đạt mục tiêu tiết kiệm, hãy phân bổ 3 tầng tiền: nhu cầu ngắn hạn (50%), mục tiêu trung hạn (30%) và dự phòng (20%).'
  }

  return 'Tôi đề xuất bạn bắt đầu bằng mục tiêu rõ ràng, phân bổ 3 tầng tiền: nhu cầu ngắn hạn, mục tiêu trung hạn và dự phòng. Bạn có muốn tôi tính toán cụ thể không?'
}

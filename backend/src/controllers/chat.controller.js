import prisma from '../config/database.js'
import { chat } from '../services/ai.service.js'

export async function sendMessage(req, res) {
  try {
    const { message, conversationId } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

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

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim(),
      },
    })

    // Load recent chat history for context (last 20 messages)
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
      take: 20,
    })

    let reply
    try {
      const result = await chat(history)
      reply = result.content
    } catch (aiErr) {
      console.error('AI service error:', aiErr.message)
      reply = 'Xin lỗi, tôi gặp sự cố kết nối với AI. Vui lòng thử lại sau.'
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

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

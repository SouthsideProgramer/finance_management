import { useState, useEffect } from 'react'
import { chatAPI, type ChatMessage, type Conversation } from '@/services/api'

interface AIChatPageProps {
  guestMode?: boolean
}

export function AIChatPage({ guestMode }: AIChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const suggestions = [
    'Gợi ý cách chia tiền giữa tiết kiệm và đầu tư',
    'So sánh lãi kép với gửi góp hàng tháng',
    'Tôi muốn tối ưu khoản vay ngắn hạn',
  ]

  // Load conversations
  useEffect(() => {
    if (guestMode) return
    chatAPI.listConversations().then(setConversations).catch(() => {})
  }, [guestMode])

  // Load history when conversation changes
  useEffect(() => {
    if (!activeConversationId || guestMode) return
    setLoading(true)
    chatAPI.getHistory(activeConversationId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeConversationId, guestMode])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return

    // Optimistic update
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const result = await chatAPI.send(trimmed, activeConversationId || undefined)

      // Update conversation ID if new
      if (!activeConversationId) {
        setActiveConversationId(result.conversationId)
        // Refresh conversations list
        chatAPI.listConversations().then(setConversations).catch(() => {})
      }

      // Add assistant reply
      setMessages(prev => [...prev, result.reply])
    } catch {
      // Fallback mock reply
      const reply: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại sau.',
      }
      setMessages(prev => [...prev, reply])
    } finally {
      setSending(false)
    }
  }

  function handleNewChat() {
    setActiveConversationId(null)
    setMessages([])
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id)
  }

  if (guestMode) {
    return (
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="card card-panel" style={{ padding: 24 }}>
            <div className="section-title mb-4">🤖 Trợ lý tài chính</div>
            <div className="text-[13px] leading-6" style={{ color: 'var(--ink-3)' }}>
              Đăng nhập để sử dụng AI chatbot hỗ trợ kế hoạch tài chính cá nhân.
            </div>
          </div>
        </div>
        <div className="card chat-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div className="text-center">
            <div className="text-[48px] mb-4">🔒</div>
            <div className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>Chế độ khách</div>
            <div className="text-[13px] mt-2" style={{ color: 'var(--ink-4)' }}>Đăng nhập để trò chuyện với AI trợ lý tài chính</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-4">
        <div className="card card-panel" style={{ padding: 24 }}>
          <div className="section-title mb-4">🤖 Trợ lý tài chính</div>
          <div className="text-[13px] leading-6" style={{ color: 'var(--ink-3)' }}>
            Hỏi về kế hoạch tiết kiệm, vay, đầu tư và cách tối ưu dòng tiền mỗi ngày.
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} className="chat-suggestion">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations list */}
        <div className="card card-panel" style={{ padding: 24 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-4)' }}>Cuộc trò chuyện</div>
            <button onClick={handleNewChat} className="text-[11px] font-medium px-2 py-1 rounded-lg cursor-pointer border-none" style={{ background: '#4F46E5', color: 'white' }}>+ Mới</button>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="text-[12px] text-center py-4" style={{ color: 'var(--ink-4)' }}>Chưa có cuộc trò chuyện nào</div>
            )}
            {conversations.map(c => (
              <button key={c.id} onClick={() => handleSelectConversation(c.id)}
                className="w-full text-left p-2.5 rounded-xl text-[12px] cursor-pointer border-none transition-all"
                style={{
                  background: activeConversationId === c.id ? 'rgba(79,70,229,0.08)' : 'transparent',
                  color: activeConversationId === c.id ? '#4F46E5' : 'var(--ink-3)',
                  fontWeight: activeConversationId === c.id ? 600 : 400,
                }}>
                <div className="truncate font-medium">{c.title || 'Cuộc trò chuyện mới'}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--ink-4)' }}>
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')} · {c._count?.messages || 0} tin nhắn
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card chat-panel">
        <div className="chat-header">
          <div>
            <div className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--ink)' }}>AI Chatbox</div>
            <div className="text-[13px] mt-1" style={{ color: 'var(--ink-4)' }}>Tư vấn theo tình huống tài chính của bạn</div>
          </div>
          <div className="chat-status">Đang hoạt động</div>
        </div>

        <div className="chat-window">
          {messages.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-[40px] mb-3">💬</div>
                <div className="text-[14px] font-medium" style={{ color: 'var(--ink)' }}>Bắt đầu cuộc trò chuyện</div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--ink-4)' }}>Nhập câu hỏi hoặc chọn gợi ý bên trái</div>
              </div>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-[13px]" style={{ color: 'var(--ink-4)' }}>Đang tải tin nhắn...</div>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
              <div className="chat-bubble">
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="chat-message chat-assistant">
              <div className="chat-bubble" style={{ opacity: 0.6 }}>
                Đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !sending) handleSend() }}
            placeholder="Nhập câu hỏi của bạn..."
            className="chat-input"
            disabled={sending}
          />
          <button onClick={handleSend} className="chat-send-button" disabled={sending}>
            {sending ? '...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  )
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `Bạn là FinCalc — trợ lý tài chính cá nhân thông minh, hỗ trợ tiếng Việt.

Phạm vi tư vấn:
- Tiết kiệm: phân bổ thu nhập, quỹ dự phòng, lãi kép
- Đầu tư: phân bổ danh mục, rủi ro, lợi nhuận kỳ vọng
- Vay/cho vay: tính EMI, so sánh lãi suất, chiến lược trả nợ
- Phân tích tài chính: dòng tiền, tỷ lệ tài chính, lập kế hoạch

Nguyên tắc:
- Luôn trả lời bằng tiếng Việt, thân thiện và dễ hiểu
- Đưa ra số liệu cụ thể khi có thể (tỷ lệ %, số tiền mẫu)
- Nếu thiếu thông tin, đặt câu hỏi làm rõ thay vì đoán mò
- Không đưa lời khuyên đầu tư cam kết lợi nhuận
- Luôn cảnh báo rủi ro khi liên quan đến đầu tư`

export async function chat(messages, options = {}) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY
  const model = options.model || "inclusionai/ling-3.0-flash:free"

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ]

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://finance-management-three-self.vercel.app',
      'X-Title': 'FinCalc Financial Assistant',
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('OpenRouter API error:', res.status, errBody)
    throw new Error(`OpenRouter API error: ${res.status}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenRouter')
  }

  return { role: 'assistant', content }
}

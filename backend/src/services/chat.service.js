export async function saveMessage(chatId, message) {
  // TODO: implement chat persistence
  return { id: Date.now(), chatId, ...message, createdAt: new Date() }
}

export async function getChatHistory(chatId) {
  // TODO: implement chat history retrieval
  return []
}

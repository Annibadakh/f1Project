import api from './api';

class ChatbotService {
  async sendMessage(message) {
    try {
      const response = await api.post('/chatbot/chat', { message });
      const data = response.data;

      console.log("[ChatbotService] API Response:", data);

      return {
        userMessage: message,
        botResponse: data.reply || data.message || "⚠️ No reply received.",
        success: data.success ?? true,
        data: data.data ?? null,
        suggestions: data.suggestions ?? [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
      return {
        userMessage: message,
        botResponse: "❌ Something went wrong. Please try again.",
        success: false,
        timestamp: new Date().toISOString(),
        suggestions: []
      };
    }
  }

  async getChatHistory() {
    const response = await api.get('/chatbot/history');
    return response.data;
  }
}

export default new ChatbotService();

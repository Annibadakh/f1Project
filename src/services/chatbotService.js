import api from './api';

class ChatbotService {
  async sendMessage(message) {
    const response = await api.post('/chatbot/chat', { message });
    return response.data;
  }

  async getChatHistory() {
    const response = await api.get('/chatbot/history');
    return response.data;
  }
}

export default new ChatbotService();

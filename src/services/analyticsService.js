import api from './api';

class AnalyticsService {
  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }

  async getTrends(months = 6) {
    const response = await api.get('/analytics/trends', { params: { months } });
    return response.data;
  }

  async getTopComponents(days = 30) {
    const response = await api.get('/analytics/top-components', { params: { days } });
    return response.data;
  }

  async getHealthScore() {
    const response = await api.get('/analytics/health-score');
    return response.data;
  }

  async getUserActivity(days = 30) {
    const response = await api.get('/analytics/user-activity', { params: { days } });
    return response.data;
  }
}

export default new AnalyticsService();

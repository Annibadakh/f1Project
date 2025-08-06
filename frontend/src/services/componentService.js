import api from './api';

class ComponentService {
  async getComponents(filters = {}) {
    const response = await api.get('/components', { params: filters });
    return response.data;
  }

  async getComponent(id) {
    const response = await api.get(`/components/${id}`);
    return response.data;
  }

  async createComponent(componentData) {
    const response = await api.post('/components', componentData);
    return response.data.component;
  }

  async updateComponent(id, componentData) {
    const response = await api.put(`/components/${id}`, componentData);
    return response.data.component;
  }

  async deleteComponent(id) {
    await api.delete(`/components/${id}`);
  }

  async inwardInventory(id, data) {
    const response = await api.post(`/components/${id}/inward`, data);
    return response.data;
  }

  async outwardInventory(id, data) {
    const response = await api.post(`/components/${id}/outward`, data);
    return response.data;
  }

  async adjustInventory(id, data) {
    const response = await api.post(`/components/${id}/adjust`, data);
    return response.data;
  }

  async getComponentLogs(id, filters = {}) {
    const response = await api.get(`/components/${id}/logs`, { params: filters });
    return response.data;
  }

  async getCategories() {
    const response = await api.get('/components/categories/list');
    return response.data;
  }

  async getLocations() {
    const response = await api.get('/components/locations/list');
    return response.data;
  }
}

export default new ComponentService();

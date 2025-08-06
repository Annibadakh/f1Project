import api from './api';

class ExportService {
  async exportComponents(format = 'csv', includeEmpty = false) {
    const response = await api.get('/export/components', {
      params: { format, includeEmpty },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `components-${Date.now()}.${format}`);
  }

  async exportLogs(format = 'csv', days = 30, action) {
    const response = await api.get('/export/logs', {
      params: { format, days, action },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `inventory-logs-${Date.now()}.${format}`);
  }

  async exportLowStock(format = 'csv') {
    const response = await api.get('/export/low-stock', {
      params: { format },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `low-stock-report-${Date.now()}.${format}`);
  }

  async exportStaleStock(format = 'csv', days = 90) {
    const response = await api.get('/export/stale-stock', {
      params: { format, days },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `stale-stock-report-${Date.now()}.${format}`);
  }

  async exportValuation(format = 'csv') {
    const response = await api.get('/export/valuation', {
      params: { format },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `inventory-valuation-${Date.now()}.${format}`);
  }

  async exportUsers(format = 'csv') {
    const response = await api.get('/export/users', {
      params: { format },
      responseType: 'blob'
    });
    
    this.downloadFile(response.data, `users-${Date.now()}.${format}`);
  }

  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new ExportService();

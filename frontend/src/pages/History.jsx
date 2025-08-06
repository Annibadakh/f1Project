import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import exportService from '../services/exportService';



const History = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNext: false,
    hasPrev: false
  });

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'inward', label: 'Inward' },
    { value: 'outward', label: 'Outward' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' }
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: '1', label: 'Last 24 Hours' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' }
  ];

  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage, searchTerm, actionFilter, userFilter, dateFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '50',
        search: searchTerm,
        action: actionFilter === 'all' ? '' : actionFilter,
        user: userFilter === 'all' ? '' : userFilter,
        days: dateFilter === 'all' ? '' : dateFilter
      });

      const response = await api.get(`/export/logs?${params}&format=json`);
      
      // Since we're using the export endpoint, we need to handle the response differently
      // Let's create a proper logs endpoint
      const logsResponse = await api.get('/analytics/logs', { params: Object.fromEntries(params) });
      
      setLogs(logsResponse.data.logs || []);
      setPagination(logsResponse.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalLogs: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      // Fallback: fetch from components logs if analytics endpoint doesn't exist
      try {
        const response = await api.get('/components', { params: { limit: 1000 } });
        const components = response.data.components;
        
        // Get logs for all components (this is a simplified approach)
 const allLogs = [];
         for (const component of components.slice(0, 10)) { // Limit to prevent too many requests
          try {
            const logsResponse = await api.get(`/components/${component._id}/logs`);
            allLogs.push(...logsResponse.data.logs);
          } catch (logError) {
            // Skip if component logs fail
          }
        }
        
        // Filter logs based on search and filters
        let filteredLogs = allLogs;
        
        if (searchTerm) {
          filteredLogs = filteredLogs.filter(log =>
            log.component?.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.component?.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (actionFilter !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
        }
        
        // Sort by date (newest first)
        filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setLogs(filteredLogs);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalLogs: filteredLogs.length,
          hasNext: false,
          hasPrev: false
        });
      } catch (fallbackError) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch history logs'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportService.exportLogs(format, parseInt(dateFilter) || 30, actionFilter === 'all' ? undefined : actionFilter);
      addToast({
        type: 'success',
        title: 'Export Started',
        message: `History export in ${format.toUpperCase()} format has started`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export history'
      });
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'inward':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'outward':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'adjustment':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'created':
        return <Plus className="w-4 h-4 text-indigo-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-yellow-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'inward':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'outward':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'created':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete history of all inventory movements and changes
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {actions.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {logs.length} records
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No history found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || actionFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No inventory movements recorded yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(log.createdAt), 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.component?.component_name || 'Unknown Component'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.component?.part_number} • {log.component?.location_bin}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${
                          log.quantity_changed > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : log.quantity_changed < 0 
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {log.previous_quantity} → {log.new_quantity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        <div className="truncate">{log.reason}</div>
                        {log.project_name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Project: {log.project_name}
                          </div>
                        )}
                        {log.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Notes: {log.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {log.user?.role}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bell, AlertTriangle, Clock, Info, CheckCircle, Trash2, Filter, Search, BookMarked as MarkAsRead } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className={`w-5 h-5 ${priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />;
      case 'stale_stock':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification marked as read'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to mark notification as read'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      addToast({
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to mark all notifications as read'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteNotification(id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete notification'
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filter === 'unread' && notification.isReadByUser) return false;
    if (filter !== 'all' && filter !== 'unread' && notification.type !== filter) return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with system alerts and inventory status
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'low_stock', label: 'Low Stock', count: notifications.filter(n => n.type === 'low_stock').length },
              { key: 'stale_stock', label: 'Stale Stock', count: notifications.filter(n => n.type === 'stale_stock').length },
              { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You\'re all caught up! No new notifications.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-6 ${getPriorityColor(notification.priority)} ${
                !notification.isReadByUser ? 'ring-2 ring-indigo-100 dark:ring-indigo-900/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.isReadByUser && (
                        <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isReadByUser && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Additional Data */}
              {notification.data && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {notification.data.componentId && (
                        <p>Component ID: {notification.data.componentId}</p>
                      )}
                      {notification.data.quantity !== undefined && (
                        <p>Current Quantity: {notification.data.quantity}</p>
                      )}
                      {notification.data.threshold !== undefined && (
                        <p>Threshold: {notification.data.threshold}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notification Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {notifications.filter(n => n.type === 'low_stock').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {notifications.filter(n => n.type === 'stale_stock').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stale Stock</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Bell, AlertTriangle, Clock, Info, CheckCircle, X, Trash2 } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.isReadByUser ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  <div className="flex-1 min-w-0 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isReadByUser && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification._id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!notification.isReadByUser && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full absolute right-2 top-4"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <a
            href="/notifications"
            className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            onClick={onClose}
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import componentService from '../services/componentService';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryModal from '../components/InventoryModal';
import QRCode from 'react-qr-code';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
  Settings,
  QrCode,
  User,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const ComponentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [component, setComponent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryAction, setInventoryAction] = useState('inward');

  useEffect(() => {
    if (id) {
      fetchComponentDetail();
    }
  }, [id]);

  const fetchComponentDetail = async () => {
    try {
      setLoading(true);
      const response = await componentService.getComponent(id);
      setComponent(response.component);
      setLogs(response.logs);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch component details'
      });
      navigate('/components');
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryAction = (action) => {
    setInventoryAction(action);
    setShowInventoryModal(true);
  };

  const handleInventorySubmit = async (data) => {
    if (!component) return;

    try {
      let response;
      if (inventoryAction === 'inward') {
        response = await componentService.inwardInventory(component._id, data);
      } else if (inventoryAction === 'outward') {
        response = await componentService.outwardInventory(component._id, data);
      } else if (inventoryAction === 'adjust') {
        response = await componentService.adjustInventory(component._id, data);
      }

      setComponent(response.component);
      setLogs(prev => [response.log, ...prev]);
      setShowInventoryModal(false);

      addToast({
        type: 'success',
        title: 'Success',
        message: `${inventoryAction.charAt(0).toUpperCase() + inventoryAction.slice(1)} operation completed successfully`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to perform ${inventoryAction} operation`
      });
    }
  };

  const handleDelete = async () => {
    if (!component || !window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      await componentService.deleteComponent(component._id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Component deleted successfully'
      });
      navigate('/components');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete component'
      });
    }
  };

  const getStockStatus = () => {
    if (!component) return { text: '', color: '', bg: '' };

    if (component.quantity === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20'
      };
    }
    if (component.isLowStock) {
      return {
        text: 'Low Stock',
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20'
      };
    }
    return {
      text: 'In Stock',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20'
    };
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

  const canEdit = user?.role === 'Admin' || user?.role === 'Lab Technician';
  const canDelete = user?.role === 'Admin';
  const canInward = user?.role === 'Admin' || user?.role === 'Lab Technician';
  const canOutward = user?.role === 'Admin' || user?.role === 'Engineer' || user?.role === 'Lab Technician';
  const canAdjust = user?.role === 'Admin';

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading component details..." />;
  }

  if (!component) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Component not found</h3>
        <button
          onClick={() => navigate('/components')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to components
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/components')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {component.component_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {component.part_number}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>

          {canEdit && (
            <button
              onClick={() => navigate(`/components/${component._id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Component Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">
                  {component.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </label>
                <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-sm font-medium rounded-full">
                  {component.category}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Manufacturer/Supplier
                </label>
                <p className="text-gray-900 dark:text-white">
                  {component.manufacturer_supplier}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {component.location_bin}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Unit Price
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    ${component.unit_price}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Critical Low Threshold
                </label>
                <p className="text-gray-900 dark:text-white">
                  {component.critical_low_threshold} units
                </p>
              </div>
            </div>

            {component.datasheet_link && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={component.datasheet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Datasheet</span>
                </a>
              </div>
            )}

            {component.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Notes
                </label>
                <p className="text-gray-900 dark:text-white">
                  {component.notes}
                </p>
              </div>
            )}

            {component.tags && component.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {component.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Log
            </h2>
            
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No activity recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)} Operation
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          Quantity: {log.previous_quantity} → {log.new_quantity} 
                          ({log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed})
                        </p>
                        <p>Reason: {log.reason}</p>
                        {log.project_name && (
                          <p>Project: {log.project_name}</p>
                        )}
                        {log.notes && (
                          <p>Notes: {log.notes}</p>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{log.user.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inventory Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Inventory Status
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {component.quantity}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>

            {/* Alerts */}
            {(component.isLowStock || component.isStale) && (
              <div className="mb-6 space-y-2">
                {component.isLowStock && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-300">
                      Low stock alert
                    </span>
                  </div>
                )}
                {component.isStale && (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-orange-800 dark:text-orange-300">
                      Unused for {formatDistanceToNow(new Date(component.last_outward))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {canInward && (
                <button
                  onClick={() => handleInventoryAction('inward')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Stock</span>
                </button>
              )}

              {canOutward && (
                <button
                  onClick={() => handleInventoryAction('outward')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={component.quantity === 0}
                >
                  <Minus className="w-4 h-4" />
                  <span>Remove Stock</span>
                </button>
              )}

              {canAdjust && (
                <button
                  onClick={() => handleInventoryAction('adjust')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Adjust Stock</span>
                </button>
              )}
            </div>
          </div>

          {/* Component Image */}
          {component.image_url && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Component Image
              </h3>
              <img
                src={component.image_url}
                alt={component.component_name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Metadata
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(component.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Updated</span>
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(component.updatedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Outward</span>
                <span className="text-gray-900 dark:text-white">
                  {format(new Date(component.last_outward), 'MMM dd, yyyy')}
                </span>
              </div>
              
              {component.createdBy && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created by</span>
                  <span className="text-gray-900 dark:text-white">
                    {component.createdBy.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code
              </h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCode
                  value={`${window.location.origin}/components/${component._id}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan to view component details
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <InventoryModal
          action={inventoryAction}
          component={component}
          onSubmit={handleInventorySubmit}
          onCancel={() => setShowInventoryModal(false)}
        />
      )}
    </div>
  );
};

export default ComponentDetail;

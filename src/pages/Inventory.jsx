import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import componentService from '../services/componentService';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryModal from '../components/InventoryModal';
import { 
  Plus, 
  Minus, 
  Settings, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Download
} from 'lucide-react';
import exportService from '../services/exportService';

const Inventory = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryAction, setInventoryAction] = useState('inward');
  const [activeTab, setActiveTab] = useState('inward');

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    // Filter components based on search term
    const filtered = components.filter(component =>
      component.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer_supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComponents(filtered);
  }, [components, searchTerm]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await componentService.getComponents({ limit: 100 });
      setComponents(response.components);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch components'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryAction = (component, action) => {
    setSelectedComponent(component);
    setInventoryAction(action);
    setShowInventoryModal(true);
  };

  const handleInventorySubmit = async (data) => {
    if (!selectedComponent) return;

    try {
      let response;
      switch (inventoryAction) {
        case 'inward':
          response = await componentService.inwardInventory(selectedComponent._id, data);
          break;
        case 'outward':
          response = await componentService.outwardInventory(selectedComponent._id, data);
          break;
        case 'adjust':
          response = await componentService.adjustInventory(selectedComponent._id, data);
          break;
      }

      // Update the component in the list
      setComponents(prev => 
        prev.map(comp => 
          comp._id === selectedComponent._id ? response.component : comp
        )
      );

      setShowInventoryModal(false);
      setSelectedComponent(null);
      
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

  const handleExportLogs = async (format) => {
    try {
      await exportService.exportLogs(format, 30);
      addToast({
        type: 'success',
        title: 'Export Started',
        message: `Inventory logs export in ${format.toUpperCase()} format has started`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export logs'
      });
    }
  };

  const canInward = user?.role === 'Admin' || user?.role === 'Lab Technician';
  const canOutward = user?.role === 'Admin' || user?.role === 'Engineer' || user?.role === 'Lab Technician';
  const canAdjust = user?.role === 'Admin';

  const getTabComponents = () => {
    switch (activeTab) {
      case 'inward':
        return filteredComponents;
      case 'outward':
        return filteredComponents.filter(comp => comp.quantity > 0);
      case 'adjust':
        return filteredComponents;
      default:
        return filteredComponents;
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading inventory..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage inward, outward, and stock adjustments
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Logs</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportLogs('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExportLogs('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {canInward && (
              <button
                onClick={() => setActiveTab('inward')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inward'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Inward</span>
                </div>
              </button>
            )}
            {canOutward && (
              <button
                onClick={() => setActiveTab('outward')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'outward'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>Outward</span>
                </div>
              </button>
            )}
            {canAdjust && (
              <button
                onClick={() => setActiveTab('adjust')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'adjust'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Adjust</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Components List */}
        <div className="p-6">
          {getTabComponents().length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No components found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria' : 'No components available for this operation'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Part Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getTabComponents().map((component) => (
                    <tr key={component._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {component.image_url && (
                            <img
                              src={component.image_url}
                              alt={component.component_name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {component.component_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {component.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {component.part_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {component.quantity}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Min: {component.critical_low_threshold}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {component.location_bin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {component.quantity === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            Out of Stock
                          </span>
                        ) : component.isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {activeTab === 'inward' && canInward && (
                            <button
                              onClick={() => handleInventoryAction(component, 'inward')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Stock
                            </button>
                          )}
                          {activeTab === 'outward' && canOutward && (
                            <button
                              onClick={() => handleInventoryAction(component, 'outward')}
                              disabled={component.quantity === 0}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3 h-3 mr-1" />
                              Remove Stock
                            </button>
                          )}
                          {activeTab === 'adjust' && canAdjust && (
                            <button
                              onClick={() => handleInventoryAction(component, 'adjust')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Adjust
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && selectedComponent && (
        <InventoryModal
          action={inventoryAction}
          component={selectedComponent}
          onSubmit={handleInventorySubmit}
          onCancel={() => {
            setShowInventoryModal(false);
            setSelectedComponent(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
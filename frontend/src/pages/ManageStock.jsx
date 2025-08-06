import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import componentService from '../services/componentService';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryModal from '../components/InventoryModal';
import { 
  Search, 
  Package, 
  Plus, 
  Minus, 
  Settings,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

const ManageStock = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryAction, setInventoryAction] = useState('inward');

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    // Filter components based on search term
    const filtered = components.filter(component =>
      component.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer_supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComponents(filtered);
  }, [components, searchTerm]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await componentService.getComponents({ limit: 1000 });
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

  const getStockStatus = (component) => {
    if (component.quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
    }
    if (component.isLowStock) {
      return { text: 'Low Stock', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    }
    return { text: 'In Stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
  };

  const canInward = user?.role === 'Admin' || user?.role === 'Lab Technician';
  const canOutward = user?.role === 'Admin' || user?.role === 'Engineer' || user?.role === 'Lab Technician';
  const canAdjust = user?.role === 'Admin';

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading components..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Stock
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a component to manage its inventory
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Activity className="w-4 h-4" />
            <span>{filteredComponents.length} components</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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

      {/* Components Grid */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No components found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search criteria' : 'No components available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => {
            const stockStatus = getStockStatus(component);
            
            return (
              <div
                key={component._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Component Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {component.component_name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {component.part_number}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                    {component.category}
                  </span>
                </div>

                {/* Stock Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Stock</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {component.quantity}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.text}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Threshold</span>
                    <span className="text-gray-900 dark:text-white">{component.critical_low_threshold}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Location</span>
                    <span className="text-gray-900 dark:text-white">{component.location_bin}</span>
                  </div>
                </div>

                {/* Alerts */}
                {(component.isLowStock || component.quantity === 0) && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs text-yellow-800 dark:text-yellow-300">
                        {component.quantity === 0 ? 'Out of stock' : 'Low stock alert'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {canInward && (
                    <button
                      onClick={() => handleInventoryAction(component, 'inward')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Stock</span>
                    </button>
                  )}

                  {canOutward && (
                    <button
                      onClick={() => handleInventoryAction(component, 'outward')}
                      disabled={component.quantity === 0}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Minus className="w-4 h-4" />
                      <span>Remove Stock</span>
                    </button>
                  )}

                  {canAdjust && (
                    <button
                      onClick={() => handleInventoryAction(component, 'adjust')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Adjust Stock</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default ManageStock;
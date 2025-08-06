import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import componentService from '../services/componentService';
import LoadingSpinner from '../components/LoadingSpinner';
import InventoryModal from '../components/InventoryModal';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Package,
  MapPin,
  DollarSign,
  Download,
  TrendingUp,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import exportService from '../services/exportService';

const LowStock  = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] =useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  useEffect(() => {
    fetchLowStockComponents();
  }, []);

  useEffect(() => {
    // Filter components based on search term
    const filtered = components.filter(component =>
      component.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.manufacturer_supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.location_bin.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComponents(filtered);
  }, [components, searchTerm]);

  const fetchLowStockComponents = async () => {
    try {
      setLoading(true);
      // Fetch components with low stock filter
      const response = await componentService.getComponents({ 
        lowStock: true,
        limit: 1000,
        sortBy: 'quantity',
        sortOrder: 'asc'
      });
      setComponents(response.components);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch low stock components'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (component) => {
    setSelectedComponent(component);
    setShowInventoryModal(true);
  };

  const handleInventorySubmit = async (data) => {
    if (!selectedComponent) return;

    try {
      const response = await componentService.inwardInventory(selectedComponent._id, data);
      
      // Update the component in the list or remove if no longer low stock
      setComponents(prev => 
        prev.map(comp => {
          if (comp._id === selectedComponent._id) {
            const updatedComp = response.component;
            // If component is no longer low stock, it will be filtered out
            return updatedComp;
          }
          return comp;
        }).filter(comp => comp.isLowStock || comp.quantity <= comp.critical_low_threshold)
      );

      setShowInventoryModal(false);
      setSelectedComponent(null);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Stock added successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add stock'
      });
    }
  };

  const handleExport = async (format) => {
    try {
      await exportService.exportLowStock(format);
      addToast({
        type: 'success',
        title: 'Export Started',
        message: `Low stock report export in ${format.toUpperCase()} format has started`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export low stock report'
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors= {
      'ICs': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Resistors': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Capacitors': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Inductors': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'Diodes': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Transistors': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'Connectors': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'Sensors': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
      'Modules': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'PCBs': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
      'Tools': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'Others': 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
    };
    return colors[category] || colors['Others'];
  };

  const canAddStock = user?.role === 'Admin' || user?.role === 'Lab Technician';

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading low stock components..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span>Low Stock Alert</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Components that need immediate attention
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Critical Items
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {components.filter(c => c.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {components.filter(c => c.quantity > 0 && c.quantity <= c.critical_low_threshold).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Estimated Reorder Cost
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${components.reduce((total, comp) => {
                  const reorderQty = Math.max(comp.critical_low_threshold * 2 - comp.quantity, 0);
                  return total + (reorderQty * comp.unit_price);
                }, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search low stock components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Low Stock Components */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-12">
          {components.length === 0 ? (
            <>
              <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Great! No Low Stock Items
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All components are adequately stocked
              </p>
            </>
          ) : (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No components found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shortage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComponents.map((component) => {
                  const shortage = Math.max(0, component.critical_low_threshold - component.quantity);
                  const isOutOfStock = component.quantity === 0;
                  
                  return (
                    <tr key={component._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
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
                              {component.part_number}
                            </div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getCategoryColor(component.category)}`}>
                              {component.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-2xl font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {component.quantity}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {component.critical_low_threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          {shortage > 0 ? `-${shortage}` : '0'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Need: {Math.max(component.critical_low_threshold * 2, component.critical_low_threshold + shortage)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {component.location_bin}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {component.manufacturer_supplier}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${component.unit_price}/unit
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/components/${component._id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          {canAddStock && (
                            <button
                              onClick={() => handleAddStock(component)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                              title="Add stock"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Stock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && selectedComponent && (
        <InventoryModal
          action="inward"
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

export default LowStock;
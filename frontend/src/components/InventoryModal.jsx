import React, { useState } from 'react';
// import { Component } from '../services/componentService';
import { X, Plus, Minus, Settings } from 'lucide-react';



const InventoryModal = ({ action, component, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity: action === 'adjust' ? component.quantity : 1,
    reason: '',
    project_name: '',
    notes: '',
    batch_id: '',
    supplier_info: {
      name: '',
      invoice_number: '',
      purchase_date: '',
      unit_cost: 0
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('supplier_info.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        supplier_info: {
          ...prev.supplier_info,
          [field]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate quantity for outward operations
    if (action === 'outward' && formData.quantity > component.quantity) {
      alert(`Cannot remove ${formData.quantity} items. Only ${component.quantity} available.`);
      return;
    }

    // Prepare data based on action
    const submitData = {
      quantity: formData.quantity,
      reason: formData.reason,
      notes: formData.notes
    };

    if (action === 'outward' && formData.project_name) {
      submitData.project_name = formData.project_name;
    }

    if (action === 'inward') {
      if (formData.batch_id) {
        submitData.batch_id = formData.batch_id;
      }
      
      // Only include supplier info if at least one field is filled
      const supplierInfo = formData.supplier_info;
      if (supplierInfo.name || supplierInfo.invoice_number || supplierInfo.purchase_date || supplierInfo.unit_cost > 0) {
        submitData.supplier_info = supplierInfo;
      }
    }

    onSubmit(submitData);
  };

  const getActionConfig = () => {
    switch (action) {
      case 'inward':
        return {
          title: 'Add Stock',
          icon: <Plus className="w-5 h-5" />,
          color: 'bg-green-600 hover:bg-green-700',
          description: 'Add inventory to this component'
        };
      case 'outward':
        return {
          title: 'Remove Stock',
          icon: <Minus className="w-5 h-5" />,
          color: 'bg-red-600 hover:bg-red-700',
          description: 'Remove inventory from this component'
        };
      case 'adjust':
        return {
          title: 'Adjust Stock',
          icon: <Settings className="w-5 h-5" />,
          color: 'bg-blue-600 hover:bg-blue-700',
          description: 'Adjust the exact quantity of this component'
        };
    }
  };

  const actionConfig = getActionConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg text-white ${actionConfig.color}`}>
              {actionConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {actionConfig.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {actionConfig.description}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Component Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {component.image_url && (
              <img
                src={component.image_url}
                alt={component.component_name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {component.component_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {component.part_number} • Current: {component.quantity} units
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Location: {component.location_bin}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {action === 'adjust' ? 'New Quantity' : 'Quantity'} *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min={action === 'adjust' ? 0 : 1}
              max={action === 'outward' ? component.quantity : undefined}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {action === 'outward' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum available: {component.quantity}
              </p>
            )}
            {action === 'adjust' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current quantity: {component.quantity}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason *
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={
                action === 'inward' 
                  ? 'e.g., New purchase, Return from project'
                  : action === 'outward'
                  ? 'e.g., Used in project, Testing'
                  : 'e.g., Physical count correction, Damaged items'
              }
            />
          </div>

          {/* Project Name (for outward) */}
          {action === 'outward' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., IoT Sensor Project"
              />
            </div>
          )}

          {/* Batch ID (for inward) */}
          {action === 'inward' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch ID
              </label>
              <input
                type="text"
                name="batch_id"
                value={formData.batch_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., BATCH-2024-001"
              />
            </div>
          )}

          {/* Supplier Information (for inward) */}
          {action === 'inward' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Supplier Information (Optional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    name="supplier_info.name"
                    value={formData.supplier_info.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="supplier_info.invoice_number"
                    value={formData.supplier_info.invoice_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="supplier_info.purchase_date"
                    value={formData.supplier_info.purchase_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    name="supplier_info.unit_cost"
                    value={formData.supplier_info.unit_cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Additional notes or comments..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg transition-colors ${actionConfig.color}`}
            >
              {actionConfig.title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
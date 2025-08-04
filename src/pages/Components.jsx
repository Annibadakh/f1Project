import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import componentService from '../services/componentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ComponentCard from '../components/ComponentCard';
import ComponentForm from '../components/ComponentForm';
import ComponentFiltersPanel from '../components/ComponentFiltersPanel';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import exportService from '../services/exportService';

const Components = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComponents: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    location: '',
    lowStock: false,
    stale: false,
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await componentService.getComponents(filters);
      setComponents(response.components);
      setPagination(response.pagination);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch components',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [filters]);

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAddComponent = () => {
    setEditingComponent(null);
    setShowForm(true);
  };

  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setShowForm(true);
  };

  const handleDeleteComponent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      await componentService.deleteComponent(id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Component deleted successfully',
      });
      fetchComponents();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete component',
      });
    }
  };

  const handleFormSubmit = async (componentData) => {
    try {
      if (editingComponent) {
        await componentService.updateComponent(editingComponent._id, componentData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Component updated successfully',
        });
      } else {
        await componentService.createComponent(componentData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Component created successfully',
        });
      }
      setShowForm(false);
      setEditingComponent(null);
      fetchComponents();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save component',
      });
    }
  };

  const handleExport = async (format) => {
    try {
      await exportService.exportComponents(format, true);
      addToast({
        type: 'success',
        title: 'Export Started',
        message: `Components export in ${format.toUpperCase()} format has started`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export components',
      });
    }
  };

  const canAddEdit = user?.role === 'Admin' || user?.role === 'Lab Technician';
  const canDelete = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Components
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your electronics components inventory
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

          {canAddEdit && (
            <button
              onClick={handleAddComponent}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Component</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search components..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Quick Filters */}
            <button
              onClick={() => handleFilterChange({ lowStock: !filters.lowStock })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.lowStock
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock</span>
            </button>

            <button
              onClick={() => handleFilterChange({ stale: !filters.stale })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.stale
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Stale</span>
            </button>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <ComponentFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {components.length} of {pagination.totalComponents} components
        </span>
        <div className="flex items-center space-x-4">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="component_name">Name</option>
            <option value="quantity">Quantity</option>
            <option value="unit_price">Price</option>
            <option value="category">Category</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Components List */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading components..." />
      ) : components.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No components found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filters.search || filters.category !== 'all' || filters.lowStock || filters.stale
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first component'}
          </p>
          {canAddEdit && (
            <button
              onClick={handleAddComponent}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Component</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Components Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {components.map((component) => (
              <ComponentCard
                key={component._id}
                component={component}
                viewMode={viewMode}
                onEdit={canAddEdit ? handleEditComponent : undefined}
                onDelete={canDelete ? handleDeleteComponent : undefined}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Component Form Modal */}
      {showForm && (
        <ComponentForm
          component={editingComponent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingComponent(null);
          }}
        />
      )}
    </div>
  );
};

export default Components;

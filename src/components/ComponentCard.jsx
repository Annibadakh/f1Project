import React from 'react';
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  DollarSign,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ComponentCard = ({
  component,
  viewMode,
  onEdit,
  onDelete
}) => {
  const getCategoryColor = (category) => {
    const colors = {
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

  const getStockStatus = () => {
    if (component.quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
    }
    if (component.isLowStock) {
      return { text: 'Low Stock', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    }
    return { text: 'In Stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
  };

  const stockStatus = getStockStatus();

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            {/* Component Info */}
            <div className="md:col-span-2">
              <div className="flex items-start space-x-3">
                {component.image_url && (
                  <img
                    src={component.image_url}
                    alt={component.component_name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {component.component_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {component.part_number}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getCategoryColor(component.category)}`}>
                    {component.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {component.quantity}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {component.location_bin}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${component.unit_price}
              </span>
            </div>

            {/* Supplier */}
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {component.manufacturer_supplier}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <a
              href={`/components/${component._id}`}
              className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </a>
            {component.datasheet_link && (
              <a
                href={component.datasheet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="View datasheet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(component)}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit component"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(component._id)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete component"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-4 flex items-center space-x-4">
          {component.isLowStock && (
            <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Low stock alert</span>
            </div>
          )}
          {component.isStale && (
            <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                Unused for {formatDistanceToNow(new Date(component.last_outward))}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {component.image_url && (
        <div className="h-48 bg-gray-100 dark:bg-gray-700">
          <img
            src={component.image_url}
            alt={component.component_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {component.component_name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {component.part_number}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(component.category)}`}>
            {component.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {component.description}
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Quantity</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {component.quantity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {component.location_bin}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ${component.unit_price}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(component.isLowStock || component.isStale) && (
          <div className="mb-4 space-y-1">
            {component.isLowStock && (
              <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">Low stock</span>
              </div>
            )}
            {component.isStale && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Stale stock</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <a
              href={`/components/${component._id}`}
              className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </a>
            {component.datasheet_link && (
              <a
                href={component.datasheet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="View datasheet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(component)}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(component._id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;

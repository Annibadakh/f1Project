import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpDown, 
  Bell, 
  Users, 
  BarChart3,
  Settings,
  HistoryIcon,
  Plus,
  AlertTriangle
} from 'lucide-react';

const Navigation = () => {
  const { user } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Lab Technician', 'Researcher', 'Engineer']
    },
    {
      name: 'Components',
      href: '/components',
      icon: Package,
      roles: ['Admin', 'Lab Technician', 'Researcher', 'Engineer']
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: ArrowUpDown,
      roles: ['Admin', 'Lab Technician', 'Engineer']
    },
    {
      name: 'Add Component',
      href: '/add-component',
      icon: Plus,
      roles: ['Admin', 'Lab Technician']
    },
    {
      name: 'Manage Stock',
      href: '/manage-stock',
      icon: ArrowUpDown,
      roles: ['Admin', 'Lab Technician', 'Engineer']
    },
    {
      name: 'Low Stock',
      href: '/low-stock',
      icon: AlertTriangle,
      roles: ['Admin', 'Lab Technician', 'Researcher', 'Engineer']
    },
    {
      name: 'History',
      href: '/history',
      icon: HistoryIcon,
      roles: ['Admin', 'Lab Technician', 'Researcher', 'Engineer']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['Admin', 'Lab Technician', 'Researcher', 'Engineer']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['Admin']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
<nav
  className="mt-6 px-4 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
  [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-400
  [&::-webkit-scrollbar-track]:bg-transparent"
>
      <ul className="space-y-2">
        {filteredItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 border-r-2 border-indigo-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {user?.role === 'Admin' || user?.role === 'Lab Technician' ? (
              <NavLink
                to="/components?action=add"
                className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Add Component
              </NavLink>
            ) : null}
            {user?.role === 'Admin' || user?.role === 'Engineer' || user?.role === 'Lab Technician' ? (
              <NavLink
                to="/inventory?tab=outward"
                className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Record Outward
              </NavLink>
            ) : null}
            {/* <NavLink
              to="/components?filter=lowStock"
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Low Stock Items
            </NavLink> */}
          </div>
        </div>
      </div>

      <div className="mt-8 px-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center mb-2">
            <BarChart3 className="w-5 h-5 mr-2" />
            <h3 className="font-medium">System Status</h3>
          </div>
          <p className="text-indigo-100 text-sm">
            All systems operational
          </p>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
            <span className="text-xs text-indigo-100">Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
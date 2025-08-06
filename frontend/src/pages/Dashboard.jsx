import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';

// import  { DashboardStats, TrendsData, HealthScore } from '../services/analyticsService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Package, 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  IndianRupee,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboard, trends, health] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getTrends(6),
          analyticsService.getHealthScore()
        ]);
        
        setDashboardData(dashboard);
        setTrendsData(trends);
        setHealthScore(health);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading dashboard..." />;
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  const { summary, lowStockComponents, staleComponents, categoryStats } = dashboardData;

  // Prepare chart data
  const categoryChartData = {
    labels: categoryStats.map(cat => cat._id),
    datasets: [
      {
        data: categoryStats.map(cat => cat.count),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
          '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
        ],
        borderWidth: 0,
      }
    ]
  };

  const trendsChartData = trendsData ? {
    labels: trendsData.monthlyTrends.map(trend => 
      `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`
    ),
    datasets: [
      {
        label: 'Inward',
        data: trendsData.monthlyTrends.map(trend => trend.inward),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Outward',
        data: trendsData.monthlyTrends.map(trend => trend.outward),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  } : null;

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening in your lab inventory today
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Components
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalComponents.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
              
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalInventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.lowStockCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Stale Items
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.staleComponentsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Score */}
      {healthScore && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory Health Score
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreBackground(healthScore.healthScore)}`}>
              <span className={getHealthScoreColor(healthScore.healthScore)}>
                {healthScore.healthScore}/100
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {healthScore.details.lowStockScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stock Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {healthScore.details.staleStockScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Freshness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {healthScore.details.activityScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Activity</div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
            <ul className="space-y-1">
              {healthScore.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Components by Category
          </h2>
          <div className="h-64">
            <Doughnut 
              data={categoryChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Inventory Trends */}
        {trendsChartData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Inventory Trends (6 Months)
            </h2>
            <div className="h-64">
              <Line 
                data={trendsChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Alert Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Low Stock Alert
              </h2>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="p-6">
            {lowStockComponents.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No low stock items
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockComponents.slice(0, 5).map((component) => (
                  <div key={component._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {component.component_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {component.part_number} • {component.location_bin}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        {component.quantity} / {component.critical_low_threshold}
                      </div>
                    </div>
                  </div>
                ))}
                {lowStockComponents.length > 5 && (
                  <div className="text-center pt-2">
                    <a href="/components?filter=lowStock" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                      View all {lowStockComponents.length} low stock items
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stale Stock Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Stale Stock (90+ days)
              </h2>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-6">
            {staleComponents.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No stale items
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {staleComponents.slice(0, 5).map((component) => (
                  <div key={component._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {component.component_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {component.part_number} • {component.location_bin}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {Math.floor((new Date().getTime() - new Date(component.last_outward).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                ))}
                {staleComponents.length > 5 && (
                  <div className="text-center pt-2">
                    <a href="/components?filter=stale" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                      View all {staleComponents.length} stale items
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Inward (30 days)
            </h2>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {summary.recentInward}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Transactions in the last 30 days
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Outward (30 days)
            </h2>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {summary.recentOutward}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Transactions in the last 30 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
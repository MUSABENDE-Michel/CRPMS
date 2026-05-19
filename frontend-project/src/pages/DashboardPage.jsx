import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';
import { SkeletonLoader } from '../components/UI';
import {
  TrendingUp, TrendingDown, DollarSign, Car, Wrench, Clock,
  CheckCircle, AlertCircle, CreditCard, Users, Calendar,
  Download, RefreshCw, Eye, MoreHorizontal, ArrowUpRight,
  ArrowDownRight, Activity, PieChart as PieChartIcon,
  BarChart3, LineChart as LineChartIcon, Wallet
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';

const DashboardPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, statusRes, serviceRes, activityRes] = await Promise.all([
        dashboardAPI.getDashboardSummary(),
        dashboardAPI.getMonthlyRevenueData(),
        dashboardAPI.getPaymentStatusData(),
        dashboardAPI.getServiceCategoryData(),
        dashboardAPI.getActivityLog(1, 10),
      ]);

      setSummary(summaryRes.data.data);
      setMonthlyData(monthlyRes.data.data || []);
      setPaymentStatus(statusRes.data.data || {});
      setServiceData(serviceRes.data.data || []);
      setActivities(activityRes.data.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const chartColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  const paymentStatusData = paymentStatus ? [
    { name: 'Paid', value: paymentStatus.Paid || 0, color: '#10b981' },
    { name: 'Partial', value: paymentStatus.Partial || 0, color: '#f59e0b' },
    { name: 'Unpaid', value: paymentStatus.Unpaid || 0, color: '#ef4444' },
  ] : [];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, subtitle, trend, trendValue, color = 'primary' }) => {
    const trendColors = {
      up: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      down: 'text-red-600 bg-red-100 dark:bg-red-900/30'
    };
    
    return (
      <div className="card hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </div>
    );
  };

  // Activity Item Component
  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (action, entity) => {
      const icons = {
        CREATE: <CheckCircle className="w-4 h-4 text-green-500" />,
        UPDATE: <RefreshCw className="w-4 h-4 text-blue-500" />,
        DELETE: <AlertCircle className="w-4 h-4 text-red-500" />,
        LOGIN: <Users className="w-4 h-4 text-purple-500" />,
        LOGOUT: <Users className="w-4 h-4 text-orange-500" />,
      };
      return icons[action] || <Activity className="w-4 h-4 text-slate-500" />;
    };

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
        <div className="flex-shrink-0">
          {getActivityIcon(activity.action, activity.entity)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {activity.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{activity.adminId?.username}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">{formatDateTime(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} type="card" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={5} type="table" />
          <SkeletonLoader count={5} type="table" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back! Here's what's happening with your workshop today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Last updated</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {formatDateTime(lastUpdated)}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Car}
          label="Cars Serviced Today"
          value={summary?.carsServicedToday || 0}
          trend="up"
          trendValue="+12% from yesterday"
          color="primary"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Payments"
          value={summary?.pendingPaymentsCount || 0}
          subtitle={`Total Pending: ${formatCurrency(summary?.pendingAmount || 0)}`}
          trend="down"
          trendValue="-5% from yesterday"
          color="warning"
        />
        <StatCard
          icon={DollarSign}
          label="Daily Revenue"
          value={formatCurrency(summary?.dailyRevenue || 0)}
          trend="up"
          trendValue="+8% from yesterday"
          color="success"
        />
        <StatCard
          icon={Wallet}
          label="Pending Amount"
          value={formatCurrency(summary?.pendingAmount || 0)}
          subtitle="Awaiting collection"
          color="danger"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Cars</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalCars || 0}</p>
          </div>
          <Car className="w-8 h-8 text-primary-400 opacity-50" />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Services</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalServices || 0}</p>
          </div>
          <Wrench className="w-8 h-8 text-secondary-400 opacity-50" />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collection Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">94%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Service Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(45000)}</p>
          </div>
          <CreditCard className="w-8 h-8 text-purple-400 opacity-50" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monthly revenue overview for {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  selectedPeriod === 'month' 
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPeriod('quarter')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  selectedPeriod === 'quarter' 
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Distribution of payment status across all services
              </p>
            </div>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} services`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services Bar Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Services</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Most requested services this month
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={90} />
                <Tooltip formatter={(value) => [`${value} services`, 'Count']} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Latest system actions and updates
              </p>
            </div>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No recent activities</div>
            ) : (
              activities.map((activity) => (
                <ActivityItem key={activity._id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">This Month's Revenue</p>
              <p className="text-2xl font-bold">+35%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-blue-100 text-xs mt-2">Compared to last month</p>
        </div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Customer Satisfaction</p>
              <p className="text-2xl font-bold">98%</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-purple-100 text-xs mt-2">Based on service feedback</p>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">On-Time Delivery</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-green-100 text-xs mt-2">Services completed on time</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

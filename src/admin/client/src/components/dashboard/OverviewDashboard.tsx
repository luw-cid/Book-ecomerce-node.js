import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DollarSign, ShoppingCart, Users, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = import.meta.env.VITE_API_URL;

interface OverviewStats {
  totalRevenue: string;
  revenueGrowth: number;
  booksSold: number;
  booksSoldGrowth: number;
  activeUsers: number;
  totalUsers: number;
  activeUsersGrowth: number;
  conversionRate: number;
  conversionRateGrowth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders?: number;
}

interface OrderData {
  label: string;
  orders: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  books: string;
  amount: string;
  status: string;
}

export function OverviewDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderPeriod, setOrderPeriod] = useState<string>('week');

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchOrdersData(orderPeriod);
  }, [orderPeriod]);

  const fetchOrdersData = async (period: string) => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const ordersRes = await axios.get(`${API_URL}/dashboard/weekly-orders?period=${period}`, { headers });

      if (ordersRes.data.success) {
        setOrderData(ordersRes.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching orders data:', error);
      toast.error(error.response?.data?.message || 'Failed to load orders data');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all data in parallel (except orders which is handled separately)
      const [statsRes, revenueRes, recentRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/overview`, { headers }),
        axios.get(`${API_URL}/dashboard/revenue-trend?period=6months`, { headers }),
        axios.get(`${API_URL}/dashboard/recent-orders?limit=5`, { headers })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.data);
      }

      if (recentRes.data.success) {
        setRecentOrders(recentRes.data.orders);
      }

      // Fetch initial orders data
      await fetchOrdersData(orderPeriod);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4d2e]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl mb-1">Dashboard Overview</h2>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your bookstore today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl">{stats ? formatCurrency(parseFloat(stats.totalRevenue)) : formatCurrency(0)}</p>
              <p className="text-sm text-[#1a4d2e] mt-2">
                {stats && stats.revenueGrowth >= 0 ? '+' : ''}
                {stats ? stats.revenueGrowth.toFixed(1) : '0'}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#1a4d2e]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Books Sold</p>
              <p className="text-3xl">{stats ? stats.booksSold.toLocaleString() : '0'}</p>
              <p className="text-sm text-[#1a4d2e] mt-2">
                {stats && stats.booksSoldGrowth >= 0 ? '+' : ''}
                {stats ? stats.booksSoldGrowth.toFixed(1) : '0'}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#1a4d2e]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Readers</p>
              <p className="text-3xl">{stats ? stats.activeUsers.toLocaleString() : '0'}</p>
              <p className="text-sm text-[#1a4d2e] mt-2">
                {stats ? `${stats.activeUsers.toLocaleString()} / ${stats.totalUsers.toLocaleString()}` : '0 / 0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1a4d2e]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl">{stats ? stats.conversionRate.toFixed(1) : '0.0'}%</p>
              <p className="text-sm text-[#1a4d2e] mt-2">
                {stats && stats.conversionRateGrowth >= 0 ? '+' : ''}
                {stats ? stats.conversionRateGrowth.toFixed(1) : '0'}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#1a4d2e]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#1a4d2e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No revenue data available
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl">
              {orderPeriod === 'week' ? 'Weekly Orders' : 
               orderPeriod === 'month' ? 'Monthly Orders (by Week)' : 
               'Quarterly Orders (by Month)'}
            </h3>
            <Select value={orderPeriod} onValueChange={setOrderPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {orderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#1a4d2e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No order data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl mb-4">Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm sm:text-base">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm sm:text-base">Customer</th>
                  <th className="text-left py-3 px-4 text-sm sm:text-base">Books</th>
                  <th className="text-left py-3 px-4 text-sm sm:text-base">Amount</th>
                  <th className="text-left py-3 px-4 text-sm sm:text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm sm:text-base">{order.id}</td>
                    <td className="py-3 px-4 text-sm sm:text-base">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{order.books}</td>
                    <td className="py-3 px-4 text-sm sm:text-base">{order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent orders
          </div>
        )}
      </Card>
    </div>
  );
}

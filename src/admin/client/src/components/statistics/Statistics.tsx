import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = import.meta.env.VITE_API_URL;

interface RevenueData {
  month: string;
  revenue: number;
  books: number;
  orders: number;
  avgOrder: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  name: string;
  author: string;
  sold: number;
  revenue: string;
}

interface InventoryData {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export function Statistics() {
  const [period, setPeriod] = useState('year');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Map period to API format
      let apiPeriod = 'year';
      if (period === '7days') apiPeriod = 'week';
      else if (period === '30days') apiPeriod = 'month';
      else if (period === '90days') apiPeriod = 'quarter';
      else if (period === 'year') apiPeriod = 'year';

      const response = await axios.get(
        `${API_URL}/dashboard/advanced-stats?period=${apiPeriod}`,
        { headers }
      );

      if (response.data.success) {
        setRevenueData(response.data.data.revenueData || []);
        setCategoryData(response.data.data.categoryData || []);
        setTopProducts(response.data.data.topProducts || []);
        setInventoryData(response.data.data.inventoryData || []);
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error(error.response?.data?.message || 'Failed to load statistics');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Statistics & Reports</h2>
          <p className="text-gray-600">Detailed analytics and performance metrics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Statistics */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Revenue Report</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue (₫)') return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1a4d2e" strokeWidth={2} name="Revenue (₫)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#52b788" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No revenue data available
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales by Category */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Sales by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No category data available
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Top Performing Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.author}</p>
                    <p className="text-sm text-gray-500 mt-1">{product.sold} units sold</p>
                  </div>
                  <p className="font-semibold">{product.revenue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No product data available
            </div>
          )}
        </Card>
      </div>

      {/* Inventory Report */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Inventory Status Report</h3>
        {inventoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inStock" fill="#1a4d2e" name="In Stock" />
              <Bar dataKey="lowStock" fill="#f59e0b" name="Low Stock" />
              <Bar dataKey="outOfStock" fill="#ef4444" name="Out of Stock" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No inventory data available
          </div>
        )}
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Monthly Performance Metrics</h3>
        {revenueData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-left py-3 px-4">Revenue</th>
                  <th className="text-left py-3 px-4">Orders</th>
                  <th className="text-left py-3 px-4">Avg Order Value</th>
                  <th className="text-left py-3 px-4">Growth</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => {
                  const growth = index > 0 
                    ? ((item.revenue - revenueData[index - 1].revenue) / revenueData[index - 1].revenue * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={item.month} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.month}</td>
                      <td className="py-3 px-4">{formatCurrency(item.revenue)}</td>
                      <td className="py-3 px-4">{item.orders}</td>
                      <td className="py-3 px-4">{formatCurrency(item.avgOrder)}</td>
                      <td className="py-3 px-4">
                        <span className={parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No metrics data available
          </div>
        )}
      </Card>
    </div>
  );
}

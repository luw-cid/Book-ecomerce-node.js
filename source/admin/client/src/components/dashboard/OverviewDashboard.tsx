import { Card } from '../ui/card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 18500 },
  { month: 'Feb', revenue: 21000 },
  { month: 'Mar', revenue: 24500 },
  { month: 'Apr', revenue: 28000 },
  { month: 'May', revenue: 32500 },
  { month: 'Jun', revenue: 35000 },
];

const orderData = [
  { day: 'Mon', orders: 78 },
  { day: 'Tue', orders: 92 },
  { day: 'Wed', orders: 85 },
  { day: 'Thu', orders: 103 },
  { day: 'Fri', orders: 95 },
  { day: 'Sat', orders: 124 },
  { day: 'Sun', orders: 98 },
];

const recentOrders = [
  { id: '#ORD-1234', customer: 'John Doe', books: 'Atomic Habits, 1984', amount: '$44.98', status: 'Processing' },
  { id: '#ORD-1235', customer: 'Jane Smith', books: 'The Great Gatsby', amount: '$15.99', status: 'Shipped' },
  { id: '#ORD-1236', customer: 'Mike Johnson', books: 'Harry Potter Collection (3 books)', amount: '$68.97', status: 'Processing' },
  { id: '#ORD-1237', customer: 'Sarah Williams', books: 'Pride and Prejudice, To Kill a Mockingbird', amount: '$27.98', status: 'Delivered' },
  { id: '#ORD-1238', customer: 'Tom Brown', books: 'Educated, The Midnight Library', amount: '$44.98', status: 'Processing' },
];

export function OverviewDashboard() {
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
              <p className="text-3xl">$159,500</p>
              <p className="text-sm text-[#1a4d2e] mt-2">+16.8% from last month</p>
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
              <p className="text-3xl">2,847</p>
              <p className="text-sm text-[#1a4d2e] mt-2">+18.5% from last month</p>
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
              <p className="text-3xl">1,342</p>
              <p className="text-sm text-[#1a4d2e] mt-2">+22.4% from last month</p>
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
              <p className="text-3xl">3.2%</p>
              <p className="text-sm text-[#1a4d2e] mt-2">+0.5% from last month</p>
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#1a4d2e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Weekly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#1a4d2e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl mb-4">Recent Orders</h3>
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
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

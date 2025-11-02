import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 18500, books: 892, avgOrder: 20.74 },
  { month: 'Feb', revenue: 21000, books: 1045, avgOrder: 20.10 },
  { month: 'Mar', revenue: 24500, books: 1234, avgOrder: 19.85 },
  { month: 'Apr', revenue: 28000, books: 1398, avgOrder: 20.03 },
  { month: 'May', revenue: 32500, books: 1567, avgOrder: 20.74 },
  { month: 'Jun', revenue: 35000, books: 1789, avgOrder: 19.56 },
];

const categoryData = [
  { name: 'Fiction', value: 35, color: '#1a4d2e' },
  { name: 'Non-Fiction', value: 25, color: '#2d6a4f' },
  { name: 'Self-Help', value: 15, color: '#52b788' },
  { name: 'Biography', value: 12, color: '#74c69d' },
  { name: 'Science Fiction', value: 13, color: '#95d5b2' },
];

const topProducts = [
  { name: 'Atomic Habits', author: 'James Clear', sold: 487, revenue: '$13,621.13' },
  { name: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', sold: 356, revenue: '$8,168.44' },
  { name: 'The Midnight Library', author: 'Matt Haig', sold: 298, revenue: '$8,040.02' },
  { name: 'Educated', author: 'Tara Westover', sold: 267, revenue: '$4,799.33' },
  { name: '1984', author: 'George Orwell', sold: 245, revenue: '$4,162.55' },
];

const inventoryData = [
  { category: 'Fiction', inStock: 1245, lowStock: 45, outOfStock: 8 },
  { category: 'Non-Fiction', inStock: 978, lowStock: 32, outOfStock: 5 },
  { category: 'Self-Help', inStock: 567, lowStock: 18, outOfStock: 3 },
  { category: 'Biography', inStock: 432, lowStock: 12, outOfStock: 2 },
  { category: 'Science Fiction', inStock: 789, lowStock: 25, outOfStock: 4 },
];

export function Statistics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Statistics & Reports</h2>
          <p className="text-gray-600">Detailed analytics and performance metrics</p>
        </div>
        <Select defaultValue="30days">
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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1a4d2e" strokeWidth={2} name="Revenue ($)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#52b788" strokeWidth={2} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales by Category */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Sales by Category</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div>
                  <p>{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sold} units sold</p>
                </div>
                <p>{product.revenue}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inventory Report */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Inventory Status Report</h3>
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
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Monthly Performance Metrics</h3>
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
                    <td className="py-3 px-4">${item.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">{item.orders}</td>
                    <td className="py-3 px-4">${item.avgOrder.toFixed(2)}</td>
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
      </Card>
    </div>
  );
}

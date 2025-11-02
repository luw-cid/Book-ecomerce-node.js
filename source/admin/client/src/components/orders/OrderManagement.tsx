import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Eye } from 'lucide-react';
import { OrderDetail } from './OrderDetail';

const mockOrders = [
  { id: '#ORD-1234', customer: 'John Doe', email: 'john@example.com', items: 3, total: '$44.98', status: 'Processing', date: '2025-10-18' },
  { id: '#ORD-1235', customer: 'Jane Smith', email: 'jane@example.com', items: 1, total: '$15.99', status: 'Shipped', date: '2025-10-17' },
  { id: '#ORD-1236', customer: 'Mike Johnson', email: 'mike@example.com', items: 5, total: '$89.95', status: 'Processing', date: '2025-10-17' },
  { id: '#ORD-1237', customer: 'Sarah Williams', email: 'sarah@example.com', items: 2, total: '$27.98', status: 'Delivered', date: '2025-10-16' },
  { id: '#ORD-1238', customer: 'Tom Brown', email: 'tom@example.com', items: 4, total: '$64.96', status: 'Processing', date: '2025-10-16' },
  { id: '#ORD-1239', customer: 'Emily Davis', email: 'emily@example.com', items: 6, total: '$102.94', status: 'Cancelled', date: '2025-10-15' },
  { id: '#ORD-1240', customer: 'David Wilson', email: 'david@example.com', items: 3, total: '$51.97', status: 'Shipped', date: '2025-10-15' },
  { id: '#ORD-1241', customer: 'Lisa Anderson', email: 'lisa@example.com', items: 7, total: '$143.93', status: 'Delivered', date: '2025-10-14' },
];

export function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = mockOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl mb-1">Order Management</h2>
        <p className="text-gray-600 text-sm sm:text-base">View and manage all customer orders</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search orders by ID or customer..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-sm sm:text-base">Order ID</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Customer</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Items</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Total Amount</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Status</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Order Date</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm sm:text-base">{order.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm sm:text-base">{order.customer}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{order.items} books</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{order.total}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm sm:text-base">{order.date}</td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
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

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Package, User, CreditCard, MapPin } from 'lucide-react';

const orderItems = [
  { name: 'Atomic Habits', author: 'James Clear', sku: 'ISBN-9780735211292', quantity: 1, price: '$27.99', total: '$27.99' },
  { name: '1984', author: 'George Orwell', sku: 'ISBN-9780451524935', quantity: 1, price: '$16.99', total: '$16.99' },
];

const statusHistory = [
  { date: '2025-10-18 10:30 AM', status: 'Order Placed', description: 'Order has been received' },
  { date: '2025-10-18 11:45 AM', status: 'Payment Confirmed', description: 'Payment processed successfully' },
  { date: '2025-10-18 02:15 PM', status: 'Processing', description: 'Order is being prepared' },
];

interface OrderDetailProps {
  order: any;
  onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Order Details: {order.id}</h2>
          <p className="text-gray-600">Placed on {order.date}</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue={order.status}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Book Title</th>
                    <th className="text-left py-3 px-4">Author</th>
                    <th className="text-left py-3 px-4">ISBN</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.author}</td>
                      <td className="py-3 px-4 text-gray-600">{item.sku}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.price}</td>
                      <td className="py-3 px-4">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>$44.98</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Total:</span>
                    <span>{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Transaction History</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <div>
                  <p>Payment Method</p>
                  <p className="text-sm text-gray-600">Credit Card ending in 4242</p>
                </div>
                <div className="text-right">
                  <p>{order.total}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl mb-4">Status History</h3>
            <div className="space-y-4">
              {statusHistory.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-[#1a4d2e] rounded-full"></div>
                    {index < statusHistory.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p>{item.status}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Customer Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p>{order.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Shipping Address</h3>
            </div>
            <div className="space-y-1">
              <p>{order.customer}</p>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">Apartment 4B</p>
              <p className="text-gray-600">New York, NY 10001</p>
              <p className="text-gray-600">United States</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Billing Address</h3>
            </div>
            <p className="text-gray-600 text-sm">Same as shipping address</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, User, MapPin, ShoppingCart, CreditCard } from 'lucide-react';

const customerOrders = [
  { id: '#ORD-1234', date: '2025-10-18', total: '$245.00', status: 'Delivered' },
  { id: '#ORD-1189', date: '2025-09-25', total: '$120.50', status: 'Delivered' },
  { id: '#ORD-1145', date: '2025-08-15', total: '$389.99', status: 'Delivered' },
  { id: '#ORD-1098', date: '2025-07-10', total: '$95.00', status: 'Delivered' },
];

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
}

export function CustomerDetail({ customer, onBack }: CustomerDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">{customer.name}</h2>
          <p className="text-gray-600">Customer since {customer.joinDate}</p>
        </div>
        <Badge variant={customer.status === 'VIP' ? 'default' : 'secondary'}>
          {customer.status}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#1a4d2e]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl">{customer.orders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#1a4d2e]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl">{customer.totalSpent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#1a4d2e]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-2xl">$103.75</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a4d2e]/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#1a4d2e]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loyalty Points</p>
              <p className="text-2xl">850</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-xl mb-4">Order History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{order.id}</td>
                      <td className="py-3 px-4">{order.date}</td>
                      <td className="py-3 px-4">{order.total}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
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

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Contact Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p>{customer.phone}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl">Default Address</h3>
            </div>
            <div className="space-y-1">
              <p>{customer.name}</p>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">Apartment 4B</p>
              <p className="text-gray-600">New York, NY 10001</p>
              <p className="text-gray-600">United States</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl mb-4">Customer Notes</h3>
            <p className="text-gray-600 text-sm">
              Preferred contact method: Email. Usually orders electronics and accessories.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

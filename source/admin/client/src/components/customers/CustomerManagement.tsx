import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Eye } from 'lucide-react';
import { CustomerDetail } from './CustomerDetail';

const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 (555) 123-4567', orders: 12, totalSpent: '$1,245.00', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 (555) 234-5678', orders: 8, totalSpent: '$890.50', status: 'Active', joinDate: '2024-02-20' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 (555) 345-6789', orders: 15, totalSpent: '$2,100.00', status: 'Active', joinDate: '2023-11-10' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 (555) 456-7890', orders: 5, totalSpent: '$450.00', status: 'Active', joinDate: '2024-03-05' },
  { id: 5, name: 'Tom Brown', email: 'tom@example.com', phone: '+1 (555) 567-8901', orders: 20, totalSpent: '$3,200.00', status: 'VIP', joinDate: '2023-08-12' },
  { id: 6, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 (555) 678-9012', orders: 3, totalSpent: '$210.00', status: 'Active', joinDate: '2024-05-18' },
];

export function CustomerManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl mb-1">Customer Management</h2>
        <p className="text-gray-600 text-sm sm:text-base">View and manage customer information</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search customers by name or email..." 
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
                <th className="text-left py-3 px-4 text-sm sm:text-base">Customer Name</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Email</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Phone</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Total Orders</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Total Spent</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Status</th>
                <th className="text-left py-3 px-4 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm sm:text-base">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{customer.email}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{customer.phone}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{customer.orders}</td>
                  <td className="py-3 px-4 text-sm sm:text-base">{customer.totalSpent}</td>
                  <td className="py-3 px-4">
                    <Badge variant={customer.status === 'VIP' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">View</span>
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

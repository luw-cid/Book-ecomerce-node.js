import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Eye, Loader2, Filter } from 'lucide-react';
import { OrderDetail } from './OrderDetail';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = 'http://localhost:4000';

interface User {
  _id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  // Fetch orders from API
  useEffect(() => {
    fetchOrders(true);
  }, [statusFilter]);

  // Fetch when search term or page changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(true);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for pagination
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsPaginating(true);
      }
      const token = getToken();
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API_URL}/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.totalOrders);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Đã thay đổi logic tìm kiếm: chỉ thực hiện khi nhấn nút Search hoặc Enter

  // Client-side filtering removed - now handled by server

  const getStatusLabel = (status: string) => {
    return status; // Return status as-is since we're now using proper case
  };

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">Order Management</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          View and manage all customer orders • {totalOrders} orders
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input 
              placeholder="Search by order number, customer name, or status..." 
              className="pl-10 pr-24"
              value={pendingSearchTerm}
              onChange={(e) => setPendingSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearchTerm(pendingSearchTerm);
                  setCurrentPage(1);
                }
              }}
            />
              <Button
                className="ml-4 absolute right-1 top-1/2 -translate-y-1/2 px-4"
                size="sm"
                onClick={() => {
                  setSearchTerm(pendingSearchTerm);
                  setCurrentPage(1);
                }}
              >
                Search
              </Button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Status:</span>
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('')}
              className="text-xs sm:text-sm"
            >
              All
            </Button>
            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className="text-xs sm:text-sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter
                ? 'Try changing your filters or search terms'
                : 'New orders will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className={isPaginating ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
                <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.user?.fullName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{order.items.length} items</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(order.total || 0)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`whitespace-nowrap ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="hover:bg-green-50 hover:text-green-600 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Total: {totalOrders} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isPaginating}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isPaginating}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isPaginating}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Eye, Loader2, TrendingUp } from 'lucide-react';
import { CustomerDetail } from './CustomerDetail';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = 'http://localhost:4000';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  loyalty: {
    points: number;
    lifetimePoints: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    lastEarnedAt?: string;
    lastRedeemedAt?: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function CustomerManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  // Fetch when search term or page changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers(currentPage, true);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for pagination
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  const fetchCustomers = async (page = 1, showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsPaginating(true);
    }

    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API_URL}/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCustomers(response.data.customers || []);
        setTotalCustomers(response.data.pagination.total || 0);
        setTotalPages(response.data.pagination.totalPages || 1);
        setCurrentPage(response.data.pagination.page || 1);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error(error.response?.data?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Client-side filtering removed - now handled by server

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} onUpdate={() => fetchCustomers(currentPage, false)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4d2e]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl mb-1">Customer Management</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          View and manage customer information • {totalCustomers} customers
        </p>
      </div>

      <Card className="p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, email, or phone..." 
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
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Try changing your search terms'
                : 'New customers will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className={isPaginating ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <img 
                                src={customer.avatar} 
                                alt={customer.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center text-sm font-medium">
                                {customer.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">{customer.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.phoneNumber || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="font-semibold text-green-600">{customer.loyalty?.points?.toLocaleString() || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
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
            {customers.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Total: {totalCustomers} customers
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

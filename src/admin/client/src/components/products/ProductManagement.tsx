import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Search, Edit, Trash2, Upload, Download, Loader2 } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ImportProductsDialog } from './ImportProductsDialog';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = import.meta.env.VITE_API_URL;

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface Product {
  _id: string;
  name: string;
  author?: string;
  publisher?: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: Category[] | Category | string[] | string; // Support both array and single value
  images: string[];
  tags?: string[];
  isActive: boolean;
  isNewProduct?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
}

export function ProductManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  // Fetch products from API
  const fetchProducts = async (page = 1, search = '', showLoader = true) => {
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
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(search && { search })
      });
      
      const response = await axios.get(`${API_URL}/products?${params}`, {
        headers: { Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.page || 1);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  };

  // Fetch when search term or page changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(currentPage, searchTerm, true);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for pagination
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        const token = getToken();
        const response = await axios.delete(
          `${API_URL}/products/${productToDelete._id}`,
          {
            headers: { Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          toast.success('Book deleted successfully!');
          // Refresh products list
          fetchProducts(currentPage, searchTerm);
        }
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      } finally {
        setShowDeleteDialog(false);
        setProductToDelete(null);
      }
    }
  };

  const handleImportJSON = async (importedProducts: any[]) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/products/import`,
        { products: importedProducts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      if (response.data.success) {
        const imported = response.data.results?.success?.length || 0;
        toast.success(`Successfully imported ${imported} product(s)!`);
        // Refresh products list
        fetchProducts(currentPage, searchTerm);
      }
    } catch (error: any) {
      console.error('Error importing products:', error);
      toast.error(error.response?.data?.message || 'Failed to import products');
    }
  };

  const handleImportExcel = async (file: File) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/products/import-excel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (response.data.success) {
        const imported = response.data.results?.success?.length || 0;
        toast.success(`Successfully imported ${imported} product(s)!`);
        // Refresh products list
        fetchProducts(currentPage, searchTerm);
      }
    } catch (error: any) {
      console.error('Error importing products from Excel:', error);
      toast.error(error.response?.data?.message || 'Failed to import products from Excel');
    }
  };

  const handleExportProducts = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/products/export`, {
        headers: { Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Successfully exported products!`);
    } catch (error: any) {
      console.error('Error exporting products:', error);
      toast.error(error.response?.data?.message || 'Failed to export products');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
    // Refresh products list
    fetchProducts(currentPage, searchTerm);
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

  if (showForm) {
    return (
      <ProductForm 
        product={selectedProduct} 
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl mb-1">Book Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage your book inventory and listings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportProducts}
            className="border-[#1a4d2e] text-[#1a4d2e] hover:bg-green-50 flex-1 sm:flex-none"
            size="sm"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download Products</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImportDialog(true)}
            className="border-[#1a4d2e] text-[#1a4d2e] hover:bg-green-50 flex-1 sm:flex-none"
            size="sm"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Import Products</span>
          </Button>
          <Button 
            onClick={handleAddNew} 
            className="bg-[#1a4d2e] hover:bg-[#2d6a4f] flex-1 sm:flex-none" 
            size="sm"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search books by title or author..." 
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4d2e]" />
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className={isPaginating ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Title</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Author</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Publisher</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Price</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Stock</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Category</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Status</th>
                    <th className="text-left py-3 px-4 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm sm:text-base">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{product.author || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm sm:text-base">{product.publisher || '-'}</td>
                    <td className="py-3 px-4 text-sm sm:text-base">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      <span className={product.stock === 0 ? 'text-red-600' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {product.category && Array.isArray(product.category) && product.category.length > 0
                        ? product.category.map((cat: any) => typeof cat === 'object' ? cat.name : cat).join(', ')
                        : product.category && typeof product.category === 'object' && 'name' in product.category
                        ? (product.category as any).name
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={product.isActive ? 'default' : 'secondary'} 
                        className="text-xs sm:text-sm"
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 sm:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Total: {totalProducts} products
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
      </Card>

      <ImportProductsDialog 
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportJSON={handleImportJSON}
        onImportExcel={handleImportExcel}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        itemName={productToDelete?.name}
      />
    </div>
  );
}

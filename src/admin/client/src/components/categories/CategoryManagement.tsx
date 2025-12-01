import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Plus, Search, Edit, Trash2, FolderOpen, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount?: number;
  isActive?: boolean;
}

const API_URL = 'http://localhost:4000';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]); // Initial categories can be fetched from an API
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  const fetchCategories = async (page = 1, showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsPaginating(true);
    }
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await axios.get(`${API_URL}/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}`, },
      });

      if (response.data.success) {
        setCategories(response.data.categories || []);
        setTotalCategories(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.page || 1);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  };

  // Fetch when search term or page changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCategories(currentPage, true);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for pagination
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image || '',
    });
    setShowDialog(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
    });
    setShowDialog(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/categories/${categoryToDelete._id}`, {
          headers: { Authorization: `Bearer ${token}`, },
        });

        if (response.data.success) {
          setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
          toast.success('Category deleted successfully!');
        }
      } catch (error: any) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      } finally {
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();

      if (selectedCategory) {
        // Update existing category
        const response = await axios.put(`${API_URL}/categories/${selectedCategory._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.data.success) {
          toast.success('Category updated successfully!');
          fetchCategories();
        }
      } else {
        // Create new category
        const response = await axios.post(`${API_URL}/categories`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.data.success) {
          toast.success('Category created successfully!');
          fetchCategories();
        }
      }
      
      setShowDialog(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file hình ảnh (.jpg, .jpeg, .png, .gif, .webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const token = getToken();
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await axios.post(
        `${API_URL}/categories/upload-image`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Update form data with uploaded image URL
        setFormData({
          ...formData,
          image: `${API_URL}${response.data.imageUrl}`,
        });
        toast.success('Upload hình ảnh thành công!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi upload hình ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: '',
    });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Category Management</h2>
          <p className="text-gray-600">Manage your book categories and classifications</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by category name" 
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

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4 transition-opacity duration-200 ${isPaginating ? 'opacity-50' : ''}`}>
          {categories.map((category) => (
            <Card key={category._id} className="p-4 hover:shadow-md transition-shadow">
              {/* Category Image */}
              {category.image && (
                <div className="mb-3">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a4d2e]/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-[#1a4d2e]" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {category.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-500">
                  {category.productCount || 0} books
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No categories found</p>
          </div>
        )}

        {/* Pagination */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Total: {totalCategories} categories
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Science Fiction"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g., science-fiction"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">
                  URL-friendly version of the name (auto-generated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category Image</Label>
                
                {/* Image Upload Section */}
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label 
                      htmlFor="image-upload" 
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        isUploading 
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                          : 'border-[#1a4d2e] hover:bg-[#1a4d2e]/5'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {isUploading ? 'Uploading...' : 'Upload from device'}
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>

                  {/* OR Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or enter URL</span>
                    </div>
                  </div>

                  {/* URL Input */}
                  <Input
                    id="image"
                    type="url"
                    placeholder="e.g., https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    Upload image from device or enter image URL
                  </p>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative mt-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Invalid+URL';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1a4d2e] hover:bg-[#2d6a4f]"
              >
                {selectedCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        itemName={categoryToDelete?.name}
      />
    </div>
  );
}

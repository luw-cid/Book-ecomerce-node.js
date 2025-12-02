import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { TiptapEditor } from './TiptapEditor';

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
  pages?: number;
  publicationDate?: string | Date;
  bookLanguage?: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: Category[] | Category | string[] | string; // Support both array and single value
  images: string[];
  tags?: string[];
  isActive: boolean;
  // Backend field names
  newProduct?: boolean;
  isBestseller?: boolean;
  // Frontend field names (for backward compatibility)
  isNewProduct?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [author, setAuthor] = useState(product?.author || '');
  const [publisher, setPublisher] = useState(product?.publisher || '');
  const [pages, setPages] = useState(product?.pages || 0);
  const [publicationDate, setPublicationDate] = useState(() => {
    if (!product?.publicationDate) return '';
    const date = new Date(product.publicationDate);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [language, setLanguage] = useState(product?.bookLanguage || 'English');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [categoryIds, setCategoryIds] = useState<string[]>(() => {
    if (!product?.category) return [];
    // Handle array of categories
    if (Array.isArray(product.category)) {
      return product.category.map(cat => 
        typeof cat === 'object' && cat ? cat._id : (typeof cat === 'string' ? cat : '')
      ).filter(Boolean);
    }
    // Handle single category (convert to array)
    const singleId = typeof product.category === 'object' && '_id' in product.category 
      ? product.category._id 
      : (typeof product.category === 'string' ? product.category : '');
    return singleId ? [singleId] : [];
  });
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  // Backend returns 'newProduct' but we use 'isNewProduct' in state for consistency
  const [isNewProduct, setIsNewProduct] = useState(product?.newProduct || product?.isNewProduct || false);
  // Backend returns 'isBestseller' but we use 'isBestSeller' in state for consistency
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestseller || product?.isBestSeller || false);
  const [isFlashSale, setIsFlashSale] = useState(product?.isFlashSale || false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!author.trim()) {
      toast.error('Author is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (categoryIds.length === 0) {
      toast.error('At least one category is required');
      return;
    }
    if (imageUrls.length === 0) {
      toast.error('At least one image URL is required');
      return;
    }

    setIsLoading(true);

    const productData = {
      name: name.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      pages: pages > 0 ? Number(pages) : undefined,
      publicationDate: publicationDate ? new Date(publicationDate) : undefined,
      bookLanguage: language.trim() || undefined,
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice > 0 ? Number(originalPrice) : undefined,
      stock: Number(stock),
      category: categoryIds, // Array of category IDs
      images: imageUrls,
      tags,
      isActive,
      newProduct: isNewProduct, // Backend expects 'newProduct' not 'isNewProduct'
      isBestseller: isBestSeller, // Backend expects 'isBestseller' not 'isBestSeller'
      isFlashSale
    };

    try {
      const token = getToken();
      
      if (product?._id) {
        // Update existing product
        const response = await axios.put(
          `${API_URL}/products/${product._id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        if (response.data.success) {
          toast.success('Product updated successfully!');
          onSuccess();
        }
      } else {
        // Create new product
        const response = await axios.post(
          `${API_URL}/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        if (response.data.success) {
          toast.success('Product created successfully!');
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Products</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Fill in the details below to {product ? 'update' : 'create'} a product
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Book Title *</Label>
                <Input
                  id="name"
                  placeholder="Enter book title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    placeholder="Enter publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pages">Number of Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="Enter number of pages"
                    value={pages || ''}
                    onChange={(e) => setPages(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="publicationDate">Publication Date</Label>
                  <Input
                    id="publicationDate"
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    placeholder="e.g., English, Vietnamese"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <TiptapEditor
                  content={description}
                  onChange={setDescription}
                />
                {!description?.trim() && (
                  <p className="text-xs text-red-500 mt-1">Description is required</p>
                )}
              </div>

              <div>
                <Label>Categories * (Select at least one)</Label>
                {isFetchingCategories ? (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading categories...</span>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500">No categories available</p>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${cat._id}`}
                            checked={categoryIds.includes(cat._id)}
                            onCheckedChange={(checked: any) => {
                              if (checked) {
                                setCategoryIds([...categoryIds, cat._id]);
                              } else {
                                setCategoryIds(categoryIds.filter(id => id !== cat._id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${cat._id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {cat.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {categoryIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categoryIds.map(id => {
                      const cat = categories.find(c => c._id === id);
                      return cat ? (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {cat.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Product Images</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <Button type="button" onClick={handleAddImage}>
                  <Upload className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Tags</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add Tag
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Product Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isNewProduct">New Product</Label>
                <Switch
                  id="isNewProduct"
                  checked={isNewProduct}
                  onCheckedChange={setIsNewProduct}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isBestSeller">Bestseller</Label>
                <Switch
                  id="isBestSeller"
                  checked={isBestSeller}
                  onCheckedChange={setIsBestSeller}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFlashSale">Flash Sale</Label>
                <Switch
                  id="isFlashSale"
                  checked={isFlashSale}
                  onCheckedChange={setIsFlashSale}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="bg-[#1a4d2e] hover:bg-[#2d6a4f] w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{product ? 'Update Product' : 'Create Product'}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

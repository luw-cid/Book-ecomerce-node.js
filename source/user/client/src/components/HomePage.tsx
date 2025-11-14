import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { HeroSection } from "./HeroSection";
import { CategorySection } from "./CategorySection";
import { ProductSection } from "./ProductSection";
import { BookCard, type Book } from "./BookCard";
import { ShoppingCart, type CartItem } from "./ShoppingCart";
import { Footer } from "./Footer";
// import { sampleBooks } from "../data/books";
import { Button } from "./ui/button";
import { Filter, DollarSign, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import type { PageType } from "../App";
import { convertUSDtoVND, formatVND } from "../utils/currency";

interface HomePageProps {
  onNavigate: (page: PageType, data?: any) => void;
  cartItems: CartItem[];
  onAddToCart: (book: Book) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onToggleWishlist: (bookId: string) => void;
  wishlist: Set<string>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAuthenticated?: boolean;
}

export function HomePage({
  onNavigate,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onToggleWishlist,
  wishlist,
  searchQuery,
  onSearchChange,
  isAuthenticated = false
}: HomePageProps) {
  // ============= STATE =============
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [bestsellerBooks, setBestsellerBooks] = useState<Book[]>([]);
  const [flashSaleBooks, setFlashSaleBooks] = useState<Book[]>([]);
  const [categoryBooks, setCategoryBooks] = useState<Record<string, Book[]>>({});
  const [categories, setCategories] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating" | "name-az" | "name-za">("featured");

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // ============= PAGINATION STATE CHO CATEGORIES =============
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const BOOKS_PER_CATEGORY_PAGE = 4; // 4 sách/trang cho mỗi category

  // ============= COMPUTED VALUES =============
  const minPrice = useMemo(() => {
    if (allBooks.length === 0) return 0;
    return Math.min(...allBooks.map(book => book.price));
  }, [allBooks]);

  const maxPrice = useMemo(() => {
    if (allBooks.length === 0) return 50;
    return Math.max(...allBooks.map(book => book.price));
  }, [allBooks]);

  // Update price range khi books thay đổi
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  // ============= HELPER: MAP BACKEND DATA → FRONTEND DATA =============
  const mapProductToBook = (product: any): Book => {
    console.log('🔍 Product category:', product.category); // 👈 Thêm dòng này
    const priceVND = product.price;

    const originalPrice = product.discount
      ? priceVND / (1 - product.discount.percentage / 100)
      : undefined;

    return {
      id: product._id,
      title: product.name,
      author: product.author || product.tags?.[0] || 'Unknown Author',
      price: priceVND,
      originalPrice,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 0,
      category: product.category?.name || product.category || 'Uncategorized',
      brand: product.publisher || product.tags?.[1] || 'Unknown Brand',
      coverImage: product.images?.[0] || '/placeholder-book.jpg',
      variants: [
        {
          id: product._id,
          name: 'Standard Edition',
          price: priceVND,
          originalPrice,
          stock: product.stock,
          sku: product._id
        }
      ],
      isNew: product.newProduct,
      isBestseller: product.isBestseller,
      isFlashSale: product.isFlashSale,
      flashSaleEndTime: product.flashSaleEndTime
        ? new Date(product.flashSaleEndTime).toISOString()
        : undefined
    };
  };

  // ============= FETCH DATA KHI COMPONENT MOUNT =============
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        setError(null);

        // 1. Fetch categories trước
        const categoriesRes = await axios.get('http://localhost:3000/categories', {
          headers: { "Content-Type": "application/json" }
        });

        // Backend trả về { success: true, count: N, categories: [...] }
        const categoriesData = (categoriesRes.data as any).categories || [];
        const activeCategories = categoriesData
          .filter((cat: any) => cat.isActive)
          .map((cat: any) => cat.name);
        // Lấy TẤT CẢ categories (không giới hạn số lượng)

        setCategories(activeCategories);
        // Initialize category pages (tất cả bắt đầu từ page 1)
        const initialPages: Record<string, number> = {};
        activeCategories.forEach((cat: string) => {
          initialPages[cat] = 1;
        });
        setCategoryPages(initialPages);

        // 2. Gọi API song song cho New, Bestseller, Flash Sale
        const [newRes, bestsellerRes, flashSaleRes] = await Promise.all([
          axios.get('http://localhost:3000/products/new', {
            params: { limit: 8 },
            headers: { "Content-Type": "application/json" }
          }),
          axios.get('http://localhost:3000/products/bestseller', {
            params: { limit: 8 },
            headers: { "Content-Type": "application/json" }
          }),
          axios.get('http://localhost:3000/products/flash-sale', {
            params: { limit: 8 },
            headers: { "Content-Type": "application/json" }
          })
        ]);

        // Map backend products sang frontend books
        const newBooksData = (newRes.data as any[]).map(mapProductToBook);
        const bestsellerData = (bestsellerRes.data as any[]).map(mapProductToBook);
        const flashSaleData = (flashSaleRes.data as any[]).map(mapProductToBook);

        setNewBooks(newBooksData);
        setBestsellerBooks(bestsellerData);
        setFlashSaleBooks(flashSaleData);

        // 3. Fetch products cho mỗi category
        const categoryBooksData: Record<string, Book[]> = {};
        const categoryTotalsData: Record<string, number> = {};

        await Promise.all(
          activeCategories.map(async (categoryName: string) => {
            try {
              const res = await axios.get('http://localhost:3000/products', {
                params: {
                  category: categoryName,
                  page: 1, // Load page 1 ban đầu
                  limit: BOOKS_PER_CATEGORY_PAGE
                },
                headers: { "Content-Type": "application/json" }
              });
              const data = res.data as { products?: any[]; total?: number };
              categoryBooksData[categoryName] = (data.products || []).map(mapProductToBook);
              categoryTotalsData[categoryName] = data.total || 0;
            } catch (err) {
              console.error(`Error loading ${categoryName} books:`, err);
              categoryBooksData[categoryName] = [];
              categoryTotalsData[categoryName] = 0;
            }
          })
        );

        setCategoryBooks(categoryBooksData);
        setCategoryTotals(categoryTotalsData);

        // Gộp tất cả books để filter
        const combined = [
          ...newBooksData,
          ...bestsellerData,
          ...flashSaleData,
          ...Object.values(categoryBooksData).flat()
        ];
        // Loại bỏ duplicate bằng Map
        const uniqueBooks = Array.from(
          new Map(combined.map(book => [book.id, book])).values()
        );
        setAllBooks(uniqueBooks);
        // 👇 EXTRACT BRANDS
        const brands = new Set<string>();
        uniqueBooks.forEach(book => {
          if (book.brand && book.brand !== 'Unknown Brand') {
            brands.add(book.brand);
          }
        });
        setAvailableBrands(Array.from(brands).sort());
      } catch (err: any) {
        console.error('❌ Error loading initial data:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load books. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency = chỉ chạy 1 lần khi mount

  // ============= HANDLE CATEGORY PAGE CHANGE =============
  const handleCategoryPageChange = async (categoryName: string, newPage: number) => {
    try {
      const res = await axios.get('http://localhost:3000/products', {
        params: {
          category: categoryName,
          page: newPage,
          limit: BOOKS_PER_CATEGORY_PAGE
        },
        headers: { "Content-Type": "application/json" }
      });
      const data = res.data as { products?: any[]; total?: number };
      const books = (data.products || []).map(mapProductToBook);

      // Update category books và page
      setCategoryBooks(prev => ({
        ...prev,
        [categoryName]: books
      }));

      setCategoryPages(prev => ({
        ...prev,
        [categoryName]: newPage
      }));

      // Scroll đến section đó
      document.getElementById(`category-${categoryName}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (err) {
      console.error(`Error loading page ${newPage} for ${categoryName}:`, err);
    }
  };

  // ============= FETCH KHI SEARCH HOẶC FILTER =============
  useEffect(() => {
    // Nếu không có filter thì không cần fetch
    if (!searchQuery && !selectedCategory) {
      return;
    }

    const loadFilteredBooks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/products', {
          params: {
            search: searchQuery || undefined,
            category: selectedCategory || undefined,
            sortBy: sortBy,
          },
          headers: { "Content-Type": "application/json" }
        });

        const data = response.data as { products?: any[] };
        const books = (data.products || []).map(mapProductToBook);
        setAllBooks(books);
      } catch (err: any) {
        console.error('❌ Error loading filtered books:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load books.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: Chờ 300ms sau khi user ngừng gõ mới search
    const timeoutId = setTimeout(() => {
      loadFilteredBooks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy]);

  // ============= FILTER & SORT BOOKS (CLIENT-SIDE) =============
  const filteredBooks = useMemo(() => {
    let books = allBooks;
    // 👇 FILTER BY PRICE RANGE
    books = books.filter(book =>
      book.price >= priceRange[0] && book.price <= priceRange[1]
    );

    // 👇 FILTER BY BRANDS
    if (selectedBrands.length > 0) {
      books = books.filter(book => book.brand && selectedBrands.includes(book.brand));
    }
    // Sort books
    switch (sortBy) {
      case "price-low":
        books = [...books].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        books = [...books].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        books = [...books].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "name-az":
        books = [...books].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-za":
        books = [...books].sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Featured: ưu tiên bestseller trước
        books = [...books].sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return 0;
        });
    }

    return books;
  }, [allBooks, sortBy, priceRange, selectedBrands]);

  // ============= EVENT HANDLERS =============
  const handleCategorySelect = (category: string) => {
    // Navigate đến CategoryPage với category đã chọn
    onNavigate('category', { category });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    onSearchChange("");
    setPriceRange([minPrice, maxPrice]);
  };

  // const handleBookClick = (bookId: string) => {
  //   onNavigate("product-detail", { bookId });
  // };

  // ============= COMPUTED VALUES =============
  const hasActiveFilters =
    selectedCategory ||
    searchQuery ||
    selectedBrands.length > 0 ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice;

  const showProductSections = !searchQuery && !selectedCategory && !hasActiveFilters;


  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        {/* 👇 THÊM ERROR MESSAGE */}
        {error && (
          <div className="container mx-auto px-4 py-4">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 👇 THÊM LOADING OVERLAY */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading books...</p>
            </div>
          </div>
        )}

        {/* 4-Season Price Filter Section */}
        <section className="py-12 bg-gradient-to-r from-rose-50/60 via-emerald-50/60 via-amber-50/60 to-sky-50/60">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-rose-400 via-emerald-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                  Find Your Perfect Book
                </h2>
                <p className="text-muted-foreground">
                  Filter by price range to discover books that fit your budget
                </p>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Spring Price Range */}
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${priceRange[0] <= 10 && priceRange[1] >= 10
                        ? 'border-rose-300 bg-rose-50/70 shadow-lg'
                        : 'border-rose-100 bg-rose-50/30 hover:border-rose-200'
                        }`}
                      onClick={() => setPriceRange([0, 360000])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">🌸</span>
                        </div>
                        <h3 className="font-semibold text-rose-700 mb-1">Spring Reads</h3>
                        <p className="text-sm text-rose-600 mb-2">{formatVND(0)} - {formatVND(360000)}</p>
                        <p className="text-xs text-gray-500">Budget-friendly picks</p>
                      </div>
                    </div>

                    {/* Summer Price Range */}
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${priceRange[0] <= 15 && priceRange[1] >= 17.99
                        ? 'border-emerald-300 bg-emerald-50/70 shadow-lg'
                        : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-200'
                        }`}
                      onClick={() => setPriceRange([360000, 432000])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">☀️</span>
                        </div>
                        <h3 className="font-semibold text-emerald-700 mb-1">Summer Vibes</h3>
                        <p className="text-sm text-emerald-600 mb-2">{formatVND(360000)} - {formatVND(432000)}</p>
                        <p className="text-xs text-gray-500">Popular choices</p>
                      </div>
                    </div>

                    {/* Autumn Price Range */}
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${priceRange[0] <= 18 && priceRange[1] >= 19.99
                        ? 'border-amber-300 bg-amber-50/70 shadow-lg'
                        : 'border-amber-100 bg-amber-50/30 hover:border-amber-200'
                        }`}
                      onClick={() => setPriceRange([432000, 480000])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">🍂</span>
                        </div>
                        <h3 className="font-semibold text-amber-700 mb-1">Autumn Tales</h3>
                        <p className="text-sm text-amber-600 mb-2">{formatVND(432000)} - {formatVND(480000)}</p>
                        <p className="text-xs text-gray-500">Premium selection</p>
                      </div>
                    </div>

                    {/* Winter Price Range */}
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${priceRange[1] >= 20
                        ? 'border-sky-300 bg-sky-50/70 shadow-lg'
                        : 'border-sky-100 bg-sky-50/30 hover:border-sky-200'
                        }`}
                      onClick={() => setPriceRange([480000, maxPrice])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">❄️</span>
                        </div>
                        <h3 className="font-semibold text-sky-700 mb-1">Winter Classics</h3>
                        <p className="text-sm text-sky-600 mb-2">{formatVND(480000)}+</p>
                        <p className="text-xs text-gray-500">Luxury editions</p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Price Range Slider */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Custom Range</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                          {formatVND(priceRange[0])} - {formatVND(priceRange[1])}
                        </span>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="px-3">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        max={maxPrice}
                        min={minPrice}
                        step={0.99}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{formatVND(minPrice)}</span>
                        <span>{formatVND(maxPrice)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <CategorySection onNavigate={onNavigate} />

        {/* Product Sections - only show when not searching/filtering */}
        {showProductSections && (
          <>
            {/* New Products Section */}
            {newBooks.length > 0 && (
              <ProductSection
                title="New Arrivals"
                subtitle="Fresh releases and latest additions to our collection"
                books={newBooks}
                type="new"
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                // onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => onNavigate('category', { category: '' })}
                onNavigate={onNavigate}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Bestsellers Section */}
            {bestsellerBooks.length > 0 && (
              <ProductSection
                title="Bestsellers"
                subtitle="Popular picks loved by thousands of readers"
                books={bestsellerBooks}
                type="bestseller"
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                // onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => onNavigate('category', { category: '' })}
                onNavigate={onNavigate}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Flash Sales Section */}
            {flashSaleBooks.length > 0 && (
              <ProductSection
                title="Flash Sale"
                subtitle="Limited time offers - grab them while you can!"
                books={flashSaleBooks}
                type="flash-sale"
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                // onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => onNavigate('category', { category: '' })}
                onNavigate={onNavigate}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Category Sections */}
            {categories.map((categoryName, index) => {
              const books = categoryBooks[categoryName] || [];
              const currentPage = categoryPages[categoryName] || 1;
              const totalBooks = categoryTotals[categoryName] || 0;
              const totalPages = Math.ceil(totalBooks / BOOKS_PER_CATEGORY_PAGE);

              if (books.length === 0) return null;

              // Định nghĩa màu sắc cho từng category (4 mùa)
              const categoryColors = [
                'spring',    // Category 1: Pink/Rose
                'summer',    // Category 2: Green/Emerald
                'autumn',    // Category 3: Orange/Amber
                'winter'     // Category 4: Blue/Sky
              ];

              const colorTheme = categoryColors[index % 4];

              return (
                <div key={categoryName} id={`category-${categoryName}`}>
                  <ProductSection
                    title={categoryName}
                    subtitle={`Explore our collection of ${categoryName.toLowerCase()} books (Page ${currentPage}/${totalPages})`}
                    books={books}
                    type={colorTheme as any}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    wishlist={wishlist}
                    onViewAll={() => handleCategorySelect(categoryName)}
                    onNavigate={onNavigate}
                    isAuthenticated={isAuthenticated}
                  />

                  {/* Pagination Controls cho Category */}
                  {totalPages >= 1 && (
                    <div className="container mx-auto px-4 pb-8">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCategoryPageChange(categoryName, currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-2"
                        >
                          Previous
                        </Button>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleCategoryPageChange(categoryName, pageNum)}
                              className={currentPage === pageNum ? "bg-gradient-to-r from-winter to-summer" : ""}
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCategoryPageChange(categoryName, currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="border-2"
                        >
                          Next
                        </Button>
                      </div>

                      <div className="text-center mt-3 text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * BOOKS_PER_CATEGORY_PAGE) + 1} - {Math.min(currentPage * BOOKS_PER_CATEGORY_PAGE, totalBooks)} of {totalBooks} books
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Filtered Books Section - only show when searching/filtering */}
        {(searchQuery || selectedCategory || hasActiveFilters) && (
          <section id="books-section" className="py-16 bg-white">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-3xl md:text-4xl mb-2">
                    {selectedCategory ? `${selectedCategory} Books` :
                      searchQuery ? 'Search Results' :
                        'Filtered Books'}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredBooks.length} books found
                    {searchQuery && ` for "${searchQuery}"`}
                    {(priceRange[0] > minPrice || priceRange[1] < maxPrice) &&
                      ` in ${formatVND(priceRange[0])} - ${formatVND(priceRange[1])} range`}
                  </p>

                  {/* Active Brand Filters */}
                  {selectedBrands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedBrands.map(brand => (
                        <Badge
                          key={brand}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                        >
                          {brand} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Brand Filter */}
                    {availableBrands.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Brand:</span>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !selectedBrands.includes(e.target.value)) {
                              setSelectedBrands([...selectedBrands, e.target.value]);
                            }
                          }}
                          className="bg-background border border-border rounded px-3 py-2 text-sm"
                        >
                          <option value="">Add Brand</option>
                          {availableBrands.filter(brand => !selectedBrands.includes(brand)).map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Sort Options */}
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-background border border-border rounded px-3 py-2 text-sm"
                      >
                        <option value="featured">Featured</option>
                        <option value="name-az">Name: A to Z</option>
                        <option value="name-za">Name: Z to A</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Books Grid */}
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => onNavigate?.('product-detail', { bookId: book.id })}
                      className="cursor-pointer"
                    >
                      <BookCard
                        book={book}
                        onAddToCart={(payload) => onAddToCart(payload.book)}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={wishlist.has(book.id)}
                        onNavigate={onNavigate}
                        isAuthenticated={isAuthenticated}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl mb-2">No books found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters}>
                    Browse All Books
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        trigger={<div />}
        onNavigateToCart={() => onNavigate("cart")}
      />
    </div>
  );
}
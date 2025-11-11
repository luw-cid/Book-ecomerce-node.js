import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { BookCard, type Book } from "./BookCard";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Filter, DollarSign, X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { PageType } from "../App";
import { formatCurrency } from "../utils/formatCurrency";

interface CategoryPageProps {
  category: string;
  onNavigate: (page: PageType, data?: any) => void;
  onAddToCart: (book: Book) => void;
  onToggleWishlist: (bookId: string) => void;
  wishlist: Set<string>;
  searchQuery?: string;
}

const BOOKS_PER_PAGE = 12;

export function CategoryPage({
  category,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  searchQuery = ""
}: CategoryPageProps) {
  // ============= DATA STATE =============
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBooks, setTotalBooks] = useState(0);

  // ============= FILTER STATE =============
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating" | "newest">("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Get min and max prices from books in this category
  // const categoryBooks = sampleBooks.filter(book =>
  //   category === "" || book.category.toLowerCase() === category.toLowerCase()
  // );

  // const minPrice = Math.min(...categoryBooks.map(book => book.price));
  // const maxPrice = Math.max(...categoryBooks.map(book => book.price));
  // ============= MAP BACKEND → FRONTEND =============
  const mapProductToBook = (product: any): Book => {
    const originalPrice = product.originalPrice ?? (
      product.discount
        ? product.price / (1 - product.discount.percentage / 100)
        : undefined
    );

    return {
      id: product._id,
      title: product.name,
      author: product.author || product.tags?.[0] || 'Unknown Author',
      description: product.description,
      price: product.price,
      originalPrice,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 0,
      category: product.category?.name || product.category || 'Uncategorized',
      brand: product.publisher || 'Unknown Brand',
      coverImage: product.images?.[0] || '/placeholder-book.jpg',
      variants: [
        {
          id: product._id,
          name: 'Standard Edition',
          price: product.price,
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
  // ============= DEBOUNCED PRICE RANGE =============
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 50]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  // ============= FETCH MIN/MAX PRICE =============
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const params: any = {};
        if (category && category !== "") params.category = category;

        const response = await axios.get('http://localhost:3000/products/price-range', {
          params,
          headers: { "Content-Type": "application/json" }
        });

        setMinPrice(response.data.minPrice || 0);
        setMaxPrice(response.data.maxPrice || 100);
        setPriceRange([response.data.minPrice || 0, response.data.maxPrice || 100]);
      } catch (err) {
        console.warn('Failed to fetch price range:', err);
      }
    };

    fetchPriceRange();
  }, [category]);



  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500); // Chờ 500ms sau khi user dừng kéo

    return () => clearTimeout(timer);
  }, [priceRange]);
  // ============= FETCH DATA =============
  useEffect(() => {
    let cancelled = false;

    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Tạo query params từ filters
        const params: any = {
          page: currentPage,
          limit: BOOKS_PER_PAGE,
          minPrice: debouncedPriceRange[0],
          maxPrice: debouncedPriceRange[1]
        };
        // 2. Thêm category nếu không phải "All Books"
        if (category && category !== "") {
          params.category = category;
        }

        // 3. Thêm search query nếu có
        if (searchQuery) {
          params.search = searchQuery;
        }

        // 4. Map sortBy frontend → backend
        switch (sortBy) {
          case "price-low":
            params.sortBy = "price";
            params.sortOrder = "asc";
            break;
          case "price-high":
            params.sortBy = "price";
            params.sortOrder = "desc";
            break;
          case "rating":
            params.sortBy = "rating";
            params.sortOrder = "desc";
            break;
          case "newest":
            params.sortBy = "createdAt";
            params.sortOrder = "desc";
            break;
          default:
            // featured: backend tự xử lý
            break;
        }

        // 5. Gọi API
        const response = await axios.get('http://localhost:3000/products', {
          params,
          headers: { "Content-Type": "application/json" }
        });

        // 6. Transform data
        if (!cancelled) {
          const data: any = response.data;
          const productsArray = data.products || data;
          const mappedBooks = (Array.isArray(productsArray) ? productsArray : []).map(mapProductToBook);

          setBooks(mappedBooks);
          setTotalBooks(data.total || mappedBooks.length);
        }
      } catch (err: any) {
        console.error('❌ Error fetching books:', err);
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load books.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBooks();

    // Cleanup: hủy request nếu component unmount trước khi fetch xong
    return () => { cancelled = true; };
  }, [category, currentPage, sortBy, debouncedPriceRange, searchQuery]);

  // Filter and search books (backend đã filter)
  // const filteredBooks = useMemo(() => {
  //   let books = categoryBooks;

  //   // Apply search query if provided
  //   if (searchQuery) {
  //     books = books.filter(book =>
  //       book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       book.author.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Filter by price range
  //   books = books.filter(book => book.price >= priceRange[0] && book.price <= priceRange[1]);

  //   // Sort books
  //   switch (sortBy) {
  //     case "price-low":
  //       books = [...books].sort((a, b) => a.price - b.price);
  //       break;
  //     case "price-high":
  //       books = [...books].sort((a, b) => b.price - a.price);
  //       break;
  //     case "rating":
  //       books = [...books].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  //       break;
  //     case "newest":
  //       books = [...books].sort((a, b) => {
  //         if (a.isNew && !b.isNew) return -1;
  //         if (!a.isNew && b.isNew) return 1;
  //         // if (a.newProduct && !b.newProduct) return -1;
  //         // if (!a.newProduct && b.newProduct) return 1;
  //         return 0;
  //       });
  //       break;
  //     default:
  //       // Featured (prioritize bestsellers and flash sales)
  //       books = [...books].sort((a, b) => {
  //         if (a.isBestseller && !b.isBestseller) return -1;
  //         if (!a.isBestseller && b.isBestseller) return 1;
  //         if (a.isFlashSale && !b.isFlashSale) return -1;
  //         if (!a.isFlashSale && b.isFlashSale) return 1;
  //         return 0;
  //       });
  //   }

  //   return books;
  // }, [categoryBooks, searchQuery, sortBy, priceRange]);

  // Calculate pagination
  // const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  // const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  // const endIndex = startIndex + BOOKS_PER_PAGE;
  // const currentBooks = filteredBooks.slice(startIndex, endIndex);



  // ============= PAGINATION =============
  const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, searchQuery]);

  // ============= LOADING STATE =============
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-winter mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading books...</p>
        </div>
      </div>
    );
  }

  // ============= ERROR STATE =============
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const getCategoryDisplayName = (cat: string) => {
    if (!cat) return "All Books";
    return cat;
  };

  const getCategoryIcon = (cat: string) => {
    const iconMap: { [key: string]: string } = {
      "Fiction": "📚",
      "Romance": "💕",
      "Biography": "👤",
      "Self-Help": "⚡",
      "Science Fiction": "🚀",
      "Mystery": "🔍",
      "Fantasy": "🗡️"
    };
    return iconMap[cat] || "📖";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className={currentPage === i ? "bg-winter text-white hover:bg-winter/90" : "hover:bg-winter-light"}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spring-light/20 via-summer-light/20 via-autumn-light/20 to-winter-light/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-winter via-spring to-summer py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("home")}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">{getCategoryIcon(category)}</span>
              <h1 className="text-4xl md:text-5xl text-white drop-shadow-lg">
                {getCategoryDisplayName(category)}
              </h1>
            </div>

            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto drop-shadow-md">
              {category === "" ? "Explore our complete collection of books" : `Discover amazing ${category.toLowerCase()} books`}
            </p>

            <div className="flex items-center justify-center gap-6 text-white/80">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {/* {filteredBooks.length} books found */}
                {totalBooks} books found
              </Badge>
              {currentPage > 1 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Page {currentPage} of {totalPages}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="border-2 hover:bg-winter-light"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Price Filter
              <Filter className="h-4 w-4 ml-2" />
            </Button>

            {/* Clear Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Price Filter Card */}
        {showPriceFilter && (
          <Card className="mb-8 border-2 border-winter-light">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3>Price Range</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPriceFilter(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={0.99}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Books Grid */}
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {/* {currentBooks.map((book) => ( */}
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={(payload) => onAddToCart(payload.book)}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={wishlist.has(book.id)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-winter-light cursor-pointer"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-winter-light cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl opacity-20 mb-4">📚</div>
            <h3 className="text-2xl mb-2">No books found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
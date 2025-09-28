import React, { useState, useMemo } from "react";
import { BookCard, Book } from "./BookCard";
import { Footer } from "./Footer";
import { sampleBooks } from "../data/books";
import { Button } from "./ui/button";
import { Filter, DollarSign, X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { PageType } from "../App";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating" | "newest">("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  
  // Get min and max prices from books in this category
  const categoryBooks = sampleBooks.filter(book => 
    category === "" || book.category.toLowerCase() === category.toLowerCase()
  );
  
  const minPrice = Math.min(...categoryBooks.map(book => book.price));
  const maxPrice = Math.max(...categoryBooks.map(book => book.price));

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let books = categoryBooks;

    // Apply search query if provided
    if (searchQuery) {
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    books = books.filter(book => book.price >= priceRange[0] && book.price <= priceRange[1]);

    // Sort books
    switch (sortBy) {
      case "price-low":
        books = [...books].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        books = [...books].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        books = [...books].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        books = [...books].sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
      default:
        // Featured (prioritize bestsellers and flash sales)
        books = [...books].sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          if (a.isFlashSale && !b.isFlashSale) return -1;
          if (!a.isFlashSale && b.isFlashSale) return 1;
          return 0;
        });
    }

    return books;
  }, [categoryBooks, searchQuery, sortBy, priceRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, searchQuery]);

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
                {filteredBooks.length} books found
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
                    <span>${priceRange[0].toFixed(2)}</span>
                    <span>${priceRange[1].toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Books Grid */}
        {currentBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={onAddToCart}
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
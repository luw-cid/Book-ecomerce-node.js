import React, { useState, useMemo } from "react";
import { HeroSection } from "./HeroSection";
import { CategorySection } from "./CategorySection";
import { ProductSection } from "./ProductSection";
import { BookCard, Book } from "./BookCard";
import { ShoppingCart, CartItem } from "./ShoppingCart";
import { Footer } from "./Footer";
import { sampleBooks } from "../data/books";
import { Button } from "./ui/button";
import { Filter, DollarSign, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import type { PageType } from "../App";

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
  onSearchChange
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating" | "name-az" | "name-za">("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  
  // Get min and max prices from books
  const minPrice = Math.min(...sampleBooks.map(book => book.price));
  const maxPrice = Math.max(...sampleBooks.map(book => book.price));

  // Get unique brands for filtering
  const availableBrands = useMemo(() => {
    const brands = new Set(sampleBooks.map(book => book.brand));
    return Array.from(brands).sort();
  }, []);

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let books = sampleBooks;

    // Filter by search query
    if (searchQuery) {
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      books = books.filter(book => book.category === selectedCategory);
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      books = books.filter(book => selectedBrands.includes(book.brand));
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
      case "name-az":
        books = [...books].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-za":
        books = [...books].sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Featured (keep original order, but prioritize bestsellers)
        books = [...books].sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return 0;
        });
    }

    return books;
  }, [searchQuery, selectedCategory, selectedBrands, sortBy, priceRange]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Scroll to books section
    const booksSection = document.getElementById('books-section');
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrands([]);
    onSearchChange("");
    setPriceRange([minPrice, maxPrice]);
  };

  const hasActiveFilters = selectedCategory || selectedBrands.length > 0 || searchQuery || priceRange[0] > minPrice || priceRange[1] < maxPrice;

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleBookClick = (bookId: string) => {
    onNavigate("product", { bookId });
  };

  // Get different book categories
  const newBooks = sampleBooks.filter(book => book.isNew);
  const bestsellerBooks = sampleBooks.filter(book => book.isBestseller);
  const flashSaleBooks = sampleBooks.filter(book => book.isFlashSale);

  const showProductSections = !searchQuery && !selectedCategory && !hasActiveFilters;

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        priceRange[0] <= 10 && priceRange[1] >= 10 
                          ? 'border-rose-300 bg-rose-50/70 shadow-lg' 
                          : 'border-rose-100 bg-rose-50/30 hover:border-rose-200'
                      }`}
                      onClick={() => setPriceRange([0, 14.99])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">🌸</span>
                        </div>
                        <h3 className="font-semibold text-rose-700 mb-1">Spring Reads</h3>
                        <p className="text-sm text-rose-600 mb-2">$0 - $14.99</p>
                        <p className="text-xs text-gray-500">Budget-friendly picks</p>
                      </div>
                    </div>

                    {/* Summer Price Range */}
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        priceRange[0] <= 15 && priceRange[1] >= 17.99 
                          ? 'border-emerald-300 bg-emerald-50/70 shadow-lg' 
                          : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-200'
                      }`}
                      onClick={() => setPriceRange([15, 17.99])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">☀️</span>
                        </div>
                        <h3 className="font-semibold text-emerald-700 mb-1">Summer Vibes</h3>
                        <p className="text-sm text-emerald-600 mb-2">$15 - $17.99</p>
                        <p className="text-xs text-gray-500">Popular choices</p>
                      </div>
                    </div>

                    {/* Autumn Price Range */}
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        priceRange[0] <= 18 && priceRange[1] >= 19.99 
                          ? 'border-amber-300 bg-amber-50/70 shadow-lg' 
                          : 'border-amber-100 bg-amber-50/30 hover:border-amber-200'
                      }`}
                      onClick={() => setPriceRange([18, 19.99])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">🍂</span>
                        </div>
                        <h3 className="font-semibold text-amber-700 mb-1">Autumn Tales</h3>
                        <p className="text-sm text-amber-600 mb-2">$18 - $19.99</p>
                        <p className="text-xs text-gray-500">Premium selection</p>
                      </div>
                    </div>

                    {/* Winter Price Range */}
                    <div 
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        priceRange[1] >= 20 
                          ? 'border-sky-300 bg-sky-50/70 shadow-lg' 
                          : 'border-sky-100 bg-sky-50/30 hover:border-sky-200'
                      }`}
                      onClick={() => setPriceRange([20, maxPrice])}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-white font-bold">❄️</span>
                        </div>
                        <h3 className="font-semibold text-sky-700 mb-1">Winter Classics</h3>
                        <p className="text-sm text-sky-600 mb-2">$20+</p>
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
                          ${priceRange[0]} - ${priceRange[1]}
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
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        min={minPrice}
                        step={0.99}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>${minPrice}</span>
                        <span>${maxPrice}</span>
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
                onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => handleCategorySelect("")}
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
                onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => handleCategorySelect("")}
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
                onBookClick={handleBookClick}
                wishlist={wishlist}
                onViewAll={() => handleCategorySelect("")}
              />
            )}
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
                     ` in ${priceRange[0]} - ${priceRange[1]} range`}
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
                    <div key={book.id} onClick={() => handleBookClick(book.id)} className="cursor-pointer">
                      <BookCard
                        book={book}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={wishlist.has(book.id)}
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
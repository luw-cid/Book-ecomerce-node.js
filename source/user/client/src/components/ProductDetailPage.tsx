import { useState } from "react";
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, ThumbsUp, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { BookCard, type Book } from "./BookCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { sampleBooks } from "../data/books";
import { getReviewsForBook, getRatingDistribution } from "../data/reviews";
import type { PageType } from "../App";

interface ProductDetailPageProps {
  bookId: string;
  onNavigate: (page: PageType, data?: any) => void;
  onAddToCart: (book: Book) => void;
  onToggleWishlist: (bookId: string) => void;
  isInWishlist: boolean;
}

export function ProductDetailPage({ 
  bookId, 
  onNavigate, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist 
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");

  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) {
    return <div>Book not found</div>;
  }

  const relatedBooks = sampleBooks
    .filter(b => b.category === book.category && b.id !== book.id)
    .slice(0, 4);

  const reviews = getReviewsForBook(bookId);
  const ratingDistribution = getRatingDistribution(bookId);
  const totalReviews = reviews.length;

  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getSeasonalColor = (season?: string) => {
    switch (season) {
      case 'spring': return 'border-l-spring bg-spring-light/30';
      case 'summer': return 'border-l-summer bg-summer-light/30';
      case 'autumn': return 'border-l-autumn bg-autumn-light/30';
      case 'winter': return 'border-l-winter bg-winter-light/30';
      default: return 'border-l-gray-300 bg-gray-50/30';
    }
  };

  const getSeasonalBadge = (season?: string) => {
    switch (season) {
      case 'spring': return 'bg-spring/20 text-spring-foreground border-spring/30';
      case 'summer': return 'bg-summer/20 text-summer-foreground border-summer/30';
      case 'autumn': return 'bg-autumn/20 text-autumn-foreground border-autumn/30';
      case 'winter': return 'bg-winter/20 text-winter-foreground border-winter/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleBuyNow = () => {
    onAddToCart(book);
    onNavigate("cart");
  };

  return (
    <div className="min-h-screen">
      {/* Back to Books Navigation */}
      <div className="border-b bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Books</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Book Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={book.coverImage}
                alt={`${book.title} cover`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Share Options */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleWishlist(book.id)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            {/* Title and Author */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {book.isNew && <Badge className="bg-spring text-spring-foreground">NEW</Badge>}
                {book.isBestseller && <Badge className="bg-autumn text-autumn-foreground">BESTSELLER</Badge>}
                <Badge className="bg-summer/20 text-summer-foreground border-summer/30" variant="outline">{book.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(book.rating)}
              </div>
              <span className="font-semibold">{book.rating}</span>
              <span className="text-gray-500">({book.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-winter to-summer bg-clip-text text-transparent">
                ${book.price.toFixed(2)}
              </span>
              {book.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${book.originalPrice.toFixed(2)}
                </span>
              )}
              {book.originalPrice && (
                <Badge className="bg-spring text-spring-foreground">
                  {Math.round((1 - book.price / book.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      onAddToCart(book);
                    }
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-summer to-winter text-white hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 h-12 border-autumn text-autumn-foreground hover:bg-autumn-light"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-spring" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-summer" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 text-winter" />
                <span>30-day returns</span>
              </div>
            </div>

            <Separator />

            {/* Book Details Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4 space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div><strong>Publisher:</strong> Random House</div>
                    <div><strong>Publication Date:</strong> January 2023</div>
                    <div><strong>Language:</strong> English</div>
                    <div><strong>Pages:</strong> 320</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>ISBN-10:</strong> 1234567890</div>
                    <div><strong>ISBN-13:</strong> 978-1234567890</div>
                    <div><strong>Dimensions:</strong> 6 x 9 inches</div>
                    <div><strong>Weight:</strong> 1.2 lbs</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-6">
                  {/* Reviews Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Customer Reviews</h3>
                      <p className="text-muted-foreground">{totalReviews} reviews • Average {book.rating} stars</p>
                    </div>
                    <Button className="bg-gradient-to-r from-spring via-summer via-autumn to-winter text-white hover:opacity-90">
                      Write a Review
                    </Button>
                  </div>

                  {/* Rating Overview */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900 mb-2">{book.rating}</div>
                          <div className="flex justify-center mb-2">
                            {renderStars(book.rating, "h-6 w-6")}
                          </div>
                          <p className="text-gray-600">Based on {totalReviews} reviews</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-3">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center space-x-3">
                              <span className="w-8 text-sm font-medium">{star} ★</span>
                              <Progress 
                                value={totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0} 
                                className="flex-1 h-2"
                              />
                              <span className="w-8 text-sm text-gray-600">{ratingDistribution[star]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card 
                        key={review.id} 
                        className={`border-l-4 ${getSeasonalColor(review.season)} bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <CardContent className="p-6">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + parseInt(review.id.slice(1)) * 100000}?w=40&h=40&fit=crop&crop=face`} />
                                <AvatarFallback className={getSeasonalBadge(review.season)}>
                                  {review.customerName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">{review.customerName}</span>
                                  {review.verified && (
                                    <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  {review.season && (
                                    <Badge variant="outline" className={`text-xs ${getSeasonalBadge(review.season)}`}>
                                      {review.season}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">{review.title}</h4>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>

                          {/* Review Actions */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Helpful ({review.helpful})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                              Reply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Load More Reviews */}
                  {reviews.length > 0 && (
                    <div className="text-center">
                      <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                        Load More Reviews
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <BookCard
                  key={relatedBook.id}
                  book={relatedBook}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
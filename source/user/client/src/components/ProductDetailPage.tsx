import { useState, useEffect } from "react";
import io, { Socket } from 'socket.io-client';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, ThumbsUp, CheckCircle, Package, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { BookCard, type Book } from "./BookCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import axios from "axios";
// import { getReviewsForBook, getRatingDistribution } from "../data/reviews";
import type { PageType } from "../App";
import { formatCurrency } from "../utils/formatCurrency";
import { ReviewForm } from './ReviewForm';

interface ProductDetailPageProps {
  bookId: string;
  onNavigate: (page: PageType, data?: any) => void;
  onAddToCart: (book: Book) => void;
  onToggleWishlist: (bookId: string) => void;
  isInWishlist: boolean;
  isAuthenticated?: boolean;
}

interface Review {
  _id: string;
  customerName: string;
  title: string;
  comment: string;
  rating: number | null;
  helpful: number;
  verified: boolean;
  season?: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export function ProductDetailPage({
  bookId,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  isAuthenticated = false
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [sold, setSold] = useState<number>(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalRatings: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // ============= PAGINATION STATE =============
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const REVIEWS_PER_PAGE = 3;

  // Map backend product → frontend Book (copied/adapted from HomePage)
  const mapProductToBook = (product: any): Book => {
    const originalPrice = product.discount
      ? product.price / (1 - product.discount.percentage / 100)
      : undefined;

    return {
      id: product._id,
      title: product.name,
      author: product.author || product.tags?.[0] || 'Unknown Author',
      price: product.price,
      originalPrice,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 0,
      category: product.category?.name || 'Uncategorized',
      publisher: product.publisher || product.tags?.[1] || 'Unknown Publisher',
      pages: product.pages,
      publicationDate: product.publicationDate
        ? new Date(product.publicationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : undefined,
      language: product.bookLanguage || 'English',
      coverImage: product.images?.[0] || '/placeholder-book.jpg',
      images: product.images || [product.images?.[0] || '/placeholder-book.jpg'],
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
      description: product.description,
      isBestseller: product.isBestseller,
      isFlashSale: product.isFlashSale,
      flashSaleEndTime: product.flashSaleEndTime
        ? new Date(product.flashSaleEndTime).toISOString()
        : undefined
    };
  };

  // ============= FETCH REVIEWS =============
  const fetchReviews = async (page: number = currentPage) => {
    try {
      const res = await axios.get(`http://localhost:3000/reviews/${bookId}`, {
        params: {
          page,
          limit: REVIEWS_PER_PAGE
        }
      });
      const data = res.data as { reviews: Review[]; stats: ReviewStats; total?: number };
      // Filter: Chỉ hiển thị reviews có comment (không hiển thị rating-only)
      const actualReviews = data.reviews.filter(r => r.comment && r.comment.trim().length > 0);
      setReviews(actualReviews);
      setReviewStats(data.stats);

      // Calculate total pages
      if (data.total) {
        setTotalPages(Math.ceil(data.total / REVIEWS_PER_PAGE));
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  // ============= HANDLE PAGE CHANGE =============
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchReviews(newPage);
    // Scroll to reviews section
    document.querySelector('[data-reviews-section]')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3000/products/${bookId}`, {
          headers: { "Content-Type": "application/json" }
        });
        const mapped = mapProductToBook(res.data);
        if (!cancelled) {
          setBook(mapped);
          // Lưu stock và sold từ product data
          setStock(res.data.stock || 0);
          setSold(res.data.sold || 0);
        }

        // Fetch reviews 
        await fetchReviews(1);
        setCurrentPage(1);

        // fetch related products by category
        if (mapped.category) {
          try {
            const relRes = await axios.get('http://localhost:3000/products', {
              params: { category: mapped.category, limit: 8 },
              headers: { "Content-Type": "application/json" }
            });
            const rawData: any = relRes.data;
            const productsArray = rawData.products || rawData;
            const related = (Array.isArray(productsArray) ? productsArray : [])
              .map(mapProductToBook)
              .filter((b: Book) => b.id !== mapped.id)
              .slice(0, 4);
            if (!cancelled) setRelatedBooks(related);
          } catch (relErr) {
            // non-fatal: don't block main product render
            console.warn('Failed to load related products', relErr);
          }
        }
      } catch (err: any) {
        console.error('❌ Error loading product detail:', err);
        if (err.response?.data?.message) setError(err.response.data.message);
        else setError('Failed to load product.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [bookId]);

  // ============= WEBSOCKET SETUP ============= ← THÊM MỚI
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      newSocket.emit('joinProduct', bookId);
    });

    // Real-time: New review added
    newSocket.on('newReview', (review: Review) => {
      console.log('📩 New review received:', review);
      // Refresh first page to show new review
      if (currentPage === 1) {
        fetchReviews(1);
      }
    });

    // Real-time: Rating updated
    newSocket.on('ratingUpdated', () => {
      console.log('⭐ Rating updated');
      fetchReviews(currentPage); // Refresh stats
    });

    // Real-time: Review marked helpful
    newSocket.on('reviewHelpful', ({ reviewId, helpful }: { reviewId: string; helpful: number }) => {
      setReviews(prev =>
        prev.map(r => (r._id === reviewId ? { ...r, helpful } : r))
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveProduct', bookId);
      newSocket.disconnect();
    };
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="min-h-screen flex items-center justify-center">Book not found</div>;
  }

  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    const safeRating = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(safeRating)
          ? "fill-yellow-400 text-yellow-400"
          : "text-gray-300"
          }`}
      />
    ));
  };

  // ============= HANDLE HELPFUL ============= ← THÊM
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await axios.post(`http://localhost:3000/reviews/${reviewId}/helpful`);
      // WebSocket sẽ tự động update
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const handleBuyNow = () => {
    onAddToCart(book);
    onNavigate("cart");
  };

  const allImages = book?.images && book.images.length > 0
    ? book.images
    : [book?.coverImage || '/placeholder-book.jpg'];

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
          {/* Image Gallery - FIXED LAYOUT */}
          <div className="space-y-4">
            {/* Main Image - LỚN Ở TRÊN */}
            <div className="w-full max-w-lg mx-auto aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
              <ImageWithFallback
                src={allImages[selectedImageIndex]}
                alt={`${book.title} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>

            {/* Thumbnail Gallery - NHỎ Ở DƯỚI */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 flex-wrap">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`
    w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all
    ${selectedImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                        : 'border-gray-300 hover:border-blue-300 opacity-70 hover:opacity-100'
                      }
          `}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${book.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share Options */}
            <div className="flex justify-center space-x-4 pt-2">
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
                {renderStars(book.rating || 0)}
              </div>
              <span className="font-semibold">{book.rating || 0}</span>
              <span className="text-gray-500">({(book.reviewCount || 0).toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-winter to-summer bg-clip-text text-transparent">
                {formatCurrency(book.price)}
              </span>
              {book.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(book.originalPrice)}
                </span>
              )}
              {book.originalPrice && (
                <Badge className="bg-spring text-spring-foreground">
                  {Math.round((1 - book.price / book.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Stock and Sold Info */}
            <div className="flex items-center gap-6 py-4 border-t border-b">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stock > 0 ? `${stock.toLocaleString()} books` : 'Out of stock'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Sold</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {sold.toLocaleString()} books
                  </p>
                </div>
              </div>
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
                <div className="prose max-w-none text-gray-700">
                  {book.description ? (
                    <div
                      className="product-description"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">No description available.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Author:</strong>
                    <span className="text-gray-900">{book.author || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Publisher:</strong>
                    <span className="text-gray-900">{book.publisher || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Category:</strong>
                    <span className="text-gray-900">{book.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Pages:</strong>
                    <span className="text-gray-900">{book.pages || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Publication Date:</strong>
                    <span className="text-gray-900">{book.publicationDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <strong className="text-gray-700">Language:</strong>
                    <span className="text-gray-900">{book.language || 'N/A'}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-6" data-reviews-section>
                  {/* Reviews Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Customer Reviews</h3>
                      <p className="text-muted-foreground">
                        {reviewStats.totalReviews} reviews • Average {reviewStats.averageRating} stars
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-gradient-to-r from-spring via-summer via-autumn to-winter text-white hover:opacity-90"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <ReviewForm
                      productId={bookId}
                      isAuthenticated={isAuthenticated}
                      onReviewSubmitted={() => {
                        setShowReviewForm(false);
                        fetchReviews(1);
                        setCurrentPage(1);
                      }}
                    />
                  )}

                  {/* Rating Overview */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.averageRating.toFixed(1)}</div>
                          <div className="flex justify-center mb-2">
                            {renderStars(reviewStats.averageRating, "h-6 w-6")}

                          </div>
                          <p className="text-gray-600">Based on {reviewStats.totalReviews} reviews</p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-3">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center space-x-3">
                              <span className="w-8 text-sm font-medium">{star} ★</span>
                              <Progress
                                value={reviewStats.totalReviews > 0 ? (reviewStats.distribution[star] / reviewStats.totalReviews) * 100 : 0}
                                className="flex-1 h-2"
                              />
                              <span className="w-8 text-sm text-gray-600">{reviewStats.distribution[star]}</span>
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
                        key={review._id}
                        className="border-l-4 border-primary bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
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
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {review.rating && renderStars(review.rating)}
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Title - Hiển thị nếu có */}
                          {review.title && (
                            <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
                          )}

                          <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                          {/* Review Actions */}
                          <div className="flex items-center space-x-4 pt-4 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkHelpful(review._id)}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first, last, current, and adjacent pages
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1;

                          const showEllipsis =
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return <span key={page} className="px-2 text-gray-500">...</span>;
                          }
                          if (!showPage) return null;

                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={currentPage === page ? "bg-primary" : ""}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}

                  {reviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No reviews yet. Be the first to review this book!</p>
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
                  onAddToCart={(payload) => onAddToCart(payload.book)}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={false}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Heart, Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PageType } from "../App";
import axios from "axios";
import { formatVND } from "../utils/currency";

export interface BookVariant {
  id: string;
  name?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  brand?: string;
  coverImage?: string;
  variants?: BookVariant[];
  isNew?: boolean;
  isBestseller?: boolean;
  isFlashSale?: boolean;
  flashSaleEndTime?: string; // ISO string
}

interface BookCardProps {
  book: Book;
  onAddToCart?: (payload: { book: Book; variantId?: string }) => void;
  onToggleWishlist?: (bookId: string) => void;
  isInWishlist?: boolean;
  onNavigate?: (page: PageType, data?: any) => void;
  isAuthenticated?: boolean;
}

const API_URL = 'http://localhost:3000';

export function BookCard({
  book,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  onNavigate,
  isAuthenticated = false,
}: BookCardProps) {
  // Add to cart states
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Countdown for flash sale
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(() => {
    if (!book.isFlashSale || !book.flashSaleEndTime) return null;
    const diff = Date.parse(book.flashSaleEndTime) - Date.now();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (!book.isFlashSale || !book.flashSaleEndTime) return;
    const tick = () => {
      const diff = Date.parse(book.flashSaleEndTime!) - Date.now();
      const left = diff > 0 ? diff : 0;
      setTimeLeftMs(left);
      // <-- DEBUG LOG: xem giá trị mỗi giây
      // console.log("BookCard debug:", {
      //   id: book.id,
      //   isFlashSale: book.isFlashSale,
      //   flashSaleEndTime: book.flashSaleEndTime,
      //   parsed: Date.parse(book.flashSaleEndTime),
      //   timeLeftMs: left,
      // });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [book.isFlashSale, book.flashSaleEndTime]);

  const formattedCountdown = useMemo(() => {
    if (!timeLeftMs || timeLeftMs <= 0) return null;
    const total = Math.floor(timeLeftMs / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeftMs]);

  const discountPercent = useMemo(() => {
    if (!book.originalPrice || book.originalPrice <= book.price) return null;
    return Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
  }, [book.originalPrice, book.price]);

  const rating = book.rating ?? 0;
  const reviewCount = book.reviewCount ?? 0;

  const renderStars = (r: number) => {
    const full = Math.floor(r);
    return (
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < full ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="sr-only">{r.toFixed(1)} out of 5</span>
      </div>
    );
  };

  // Navigation
  const handleCardClick = () => onNavigate?.("product-detail", { bookId: book.id });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Add to cart picks first available variant (if any)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsAddingToCart(true);
    setAddedToCart(false);

    try {
      // Optional: Sync with backend only if authenticated
      // Guest users can still add to cart without login
      if (isAuthenticated) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        // Try to sync with backend, but don't block if it fails
        try {
          await axios.post(
            `${API_URL}/cart/items`,
            {
              productId: book.id,
              quantity: 1,
              variantId: book.variants && book.variants.length > 0 ? book.variants[0].id : undefined
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } catch (backendError) {
          // Backend sync failed, but continue with local cart update
          console.warn('Backend cart sync failed, using local cart only:', backendError);
        }
      }

      // Always update local state (works for both guest and authenticated users)
      const variantId = book.variants && book.variants.length > 0 ? book.variants[0].id : undefined;
      onAddToCart?.({ book, variantId });

      // Show success feedback
      setAddedToCart(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      // Don't show error to user, just update local cart
      const variantId = book.variants && book.variants.length > 0 ? book.variants[0].id : undefined;
      onAddToCart?.({ book, variantId });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(book.id);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      aria-label={`Open details for ${book.title}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={book.coverImage ?? ""}
          alt={`${book.title} cover`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {book.isFlashSale && (
            <Badge className="bg-rose-300 text-rose-800 text-xs px-2 py-1 rounded">FLASH SALE</Badge>
          )}
          {book.isNew && <Badge className="bg-blue-300 text-blue-800 text-xs px-2 py-1 rounded">NEW</Badge>}
          {book.isBestseller && (
            <Badge className="bg-indigo-300 text-indigo-800 text-xs px-2 py-1 rounded">BESTSELLER</Badge>
          )}
          {discountPercent && (
            <Badge className="bg-emerald-300 text-emerald-800 text-xs px-2 py-1 rounded">
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white z-20"
          onClick={handleWishlist}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>

        {/* Add to cart overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <Button
            onClick={handleAddToCart}
            className={`${addedToCart
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white text-black hover:bg-gray-100'
              } transition-all duration-300`}
            aria-label={`Add ${book.title} to cart`}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : addedToCart ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>

        {/* Countdown */}
        {formattedCountdown && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
            Ends in {formattedCountdown}
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <div>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{book.title}</h3>
            {book.author && <p className="text-muted-foreground text-xs">{book.author}</p>}
          </div>

          <div className="flex items-center space-x-2">
            {renderStars(rating)}
            <span className="text-sm text-muted-foreground ml-1">({reviewCount})</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{formatVND(book.price)}</span>
              {book.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatVND(book.originalPrice)}
                </span>
              )}
            </div>
            <Badge className="text-xs px-2 py-1">{book.category ?? "Uncategorized"}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
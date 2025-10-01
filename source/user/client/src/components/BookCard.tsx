import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PageType } from "../App";

export interface BookVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  brand: string; // Publisher/Brand for filtering
  coverImage: string;
  variants: BookVariant[];
  isNew?: boolean;
  isBestseller?: boolean;
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
}

interface BookCardProps {
  book: Book;
  onAddToCart: (book: Book) => void;
  onToggleWishlist: (bookId: string) => void;
  isInWishlist: boolean;
  onNavigate?: (page: PageType, data?: any) => void; // 👈 thêm dòng này
}

export function BookCard({ book, onAddToCart, onToggleWishlist, isInWishlist }: BookCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden">
        <ImageWithFallback
          src={book.coverImage}
          alt={`${book.title} cover`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {book.isFlashSale && (
            <Badge className="bg-rose-300 text-rose-800 animate-pulse">FLASH SALE</Badge>
          )}
          {book.isNew && (
            <Badge className="bg-blue-300 text-blue-800">NEW</Badge>
          )}
          {book.isBestseller && (
            <Badge className="bg-indigo-300 text-indigo-800">BESTSELLER</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => onToggleWishlist(book.id)}
        >
          <Heart 
            className={`h-4 w-4 ${
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </Button>

        {/* Quick add to cart overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <Button 
            onClick={() => onAddToCart(book)}
            className="bg-white text-black hover:bg-gray-100"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
            <p className="text-muted-foreground">{book.author}</p>
          </div>

          <div className="flex items-center space-x-1">
            {renderStars(book.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              ({book.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">${book.price.toFixed(2)}</span>
              {book.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${book.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
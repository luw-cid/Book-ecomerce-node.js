import axios from "axios";
import { useState, useEffect } from "react";
import { Clock, Flame, Star, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { BookCard, type Book } from "./BookCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import type { PageType } from "../App";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  books: Book[];
  type: "new" | "bestseller" | "flash-sale";
  onAddToCart: (book: Book) => void;
  onToggleWishlist: (bookId: string) => void;
  // onBookClick: (bookId: string) => void;
  wishlist: Set<string>;
  onViewAll?: () => void;
  onNavigate?: (page: PageType, data?: any) => void;
  isAuthenticated?: boolean;
}

export function ProductSection({
  title,
  subtitle,
  books,
  type,
  onAddToCart,
  onToggleWishlist,
  // onBookClick,
  onNavigate,
  wishlist,
  onViewAll,
  isAuthenticated = false
}: ProductSectionProps) {
  const [timeLeft, setTimeLeft] = useState("");

  // Countdown timer for flash sales
  useEffect(() => {
    if (type === "flash-sale") {
      // Tìm book đầu tiên có flashSaleEndTime
      const firstFlashSale = books.find(b => b.isFlashSale && b.flashSaleEndTime);
      if (!firstFlashSale?.flashSaleEndTime) {
        setTimeLeft("00:00:00");
        return;
      }
      const endTimeStr = firstFlashSale.flashSaleEndTime!;
      const timer = setInterval(() => {
        const endTime = new Date(endTimeStr);
        const now = new Date();
        const difference = endTime.getTime() - now.getTime();

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft("00:00:00");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type, books]);

  const getSectionIcon = () => {
    switch (type) {
      case "new":
        return <Sparkles className="h-6 w-6" />;
      case "bestseller":
        return <TrendingUp className="h-6 w-6" />;
      case "flash-sale":
        return <Flame className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getSectionColors = () => {
    switch (type) {
      case "new":
        return {
          gradient: "from-blue-300 to-sky-400",
          textColor: "text-blue-600",
          bgColor: "bg-blue-50/50",
          borderColor: "border-blue-200"
        };
      case "bestseller":
        return {
          gradient: "from-indigo-300 to-blue-400",
          textColor: "text-indigo-600",
          bgColor: "bg-indigo-50/50",
          borderColor: "border-indigo-200"
        };
      case "flash-sale":
        return {
          gradient: "from-rose-300 to-pink-400",
          textColor: "text-rose-600",
          bgColor: "bg-rose-50/50",
          borderColor: "border-rose-200"
        };
      default:
        return {
          gradient: "from-blue-300 to-blue-400",
          textColor: "text-blue-600",
          bgColor: "bg-blue-50/50",
          borderColor: "border-blue-200"
        };
    }
  };

  const colors = getSectionColors();

  return (
    <section className={`py-16 ${colors.bgColor}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-lg`}>
                {getSectionIcon()}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Flash Sale Timer */}
            {type === "flash-sale" && (
              <Card className={`${colors.borderColor} border-2 inline-block`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className={`h-5 w-5 ${colors.textColor}`} />
                      <span className="font-medium text-gray-900">Sale ends in:</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {timeLeft.split(':').map((unit, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`bg-gradient-to-br ${colors.gradient} text-white px-3 py-2 rounded-lg font-bold text-lg`}>
                            {unit}
                          </div>
                          {index < 2 && <span className="mx-1 font-bold text-gray-600">:</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {onViewAll && (
            <Button
              variant="outline"
              onClick={onViewAll}
              className={`mt-4 lg:mt-0 ${colors.borderColor} ${colors.textColor} hover:bg-white/50`}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.slice(0, 8).map((book) => (
            <div key={book.id} onClick={() => onBookClick(book.id)} className="cursor-pointer">
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

        {/* Additional Info for Flash Sales */}
        {type === "flash-sale" && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-rose-200">
              <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
              <span className="text-rose-700 font-semibold">Limited time offer - up to 50% off!</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
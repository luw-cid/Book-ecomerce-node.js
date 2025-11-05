import { useState, useEffect} from "react";
import axios from "axios";
import { Book, Heart, Users, Zap, Telescope, Shield, ArrowRight, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PageType } from "../App";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CategorySectionProps {
  onNavigate: (page: PageType, data?: any) => void;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Icon mapping - sử dụng tên category từ DB
const categoryIcons: { [key: string]: any } = {
  "Fiction": Book,
  "Romance": Heart,
  "Biography": Users,
  "Self-Help": Zap,
  "Science Fiction": Telescope,
  "Mystery": Shield,
  "Fantasy": Sparkles,
  "Comic": BookOpen,
  "Comics": BookOpen,
  "Tiểu thuyết": Book,
  "Lãng mạn": Heart,
  "Tiểu sử": Users,
  "Tự lực": Zap,
  "Khoa học viễn tưởng": Telescope,
  "Bí ẩn": Shield,
};

// Color mapping - sử dụng tên category từ DB
const categoryColors: { [key: string]: { gradient: string; overlayColor: string } } = {
  "Fiction": {
    gradient: "from-blue-300 to-sky-400",
    overlayColor: "bg-blue-500/40"
  },
  "Romance": {
    gradient: "from-rose-300 to-pink-400",
    overlayColor: "bg-rose-400/40"
  },
  "Biography": {
    gradient: "from-emerald-300 to-teal-400",
    overlayColor: "bg-emerald-500/40"
  },
  "Self-Help": {
    gradient: "from-amber-300 to-yellow-400",
    overlayColor: "bg-amber-400/40"
  },
  "Science Fiction": {
    gradient: "from-violet-300 to-purple-400",
    overlayColor: "bg-violet-500/40"
  },
  "Mystery": {
    gradient: "from-slate-300 to-gray-400",
    overlayColor: "bg-slate-500/40"
  },
  "Fantasy": {
    gradient: "from-purple-300 to-indigo-400",
    overlayColor: "bg-purple-500/40"
  },
  "Comic": {
    gradient: "from-orange-300 to-red-400",
    overlayColor: "bg-orange-500/40"
  },
  "Comics": {
    gradient: "from-orange-300 to-red-400",
    overlayColor: "bg-orange-500/40"
  },
};

const defaultIcon = Book;
const defaultColors = {
  gradient: "from-gray-300 to-gray-400",
  overlayColor: "bg-gray-500/40"
};

export function CategorySection({ onNavigate }: CategorySectionProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy danh sách categories từ API (đã bao gồm productCount từ backend)
      const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);

      if (!categoriesResponse.data.success) {
        throw new Error(categoriesResponse.data.message || 'Failed to load categories');
      }

      const fetchedCategories: CategoryWithCount[] = categoriesResponse.data.categories;
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to load categories. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/50 to-sky-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-blue-400 to-sky-500 bg-clip-text text-transparent">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover your next favorite book by exploring our carefully curated categories. 
            From thrilling mysteries to heartwarming romances, find exactly what you're looking for.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={loadCategories}
              variant="outline"
              className="border-blue-200 hover:border-blue-300 hover:bg-blue-50/50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Categories grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              // Lấy icon và colors dựa trên tên category
              const IconComponent = categoryIcons[category.name] || defaultIcon;
              const colors = categoryColors[category.name] || defaultColors;
              
              return (
                <Card 
                  key={category._id}
                  className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden relative h-64"
                  onClick={() => onNavigate("category", { categoryId: category._id, categorySlug: category.slug })}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <ImageWithFallback
                      src={category.image}
                      alt={`${category.name} books`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay for readability */}
                    <div className={`absolute inset-0 ${colors.overlayColor} backdrop-blur-[0.5px]`}></div>
                    {/* Additional gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  </div>
                  
                  <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Icon with gradient background */}
                      <div className={`w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Content at bottom */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                          {category.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 drop-shadow-lg" />
                      </div>
                      
                      <p className="text-white/90 leading-relaxed text-sm drop-shadow-md line-clamp-2">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                          {category.productCount} {category.productCount === 1 ? 'book' : 'books'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white hover:bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/30"
                        >
                          Explore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No categories found */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No categories available at the moment.</p>
          </div>
        )}

        {/* Call to action */}
        {!loading && !error && categories.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 text-blue-600 px-8 py-3"
              onClick={() => onNavigate("category", {})}
            >
              View All Categories
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
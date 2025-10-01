import { Book, Heart, Users, Zap, Telescope, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PageType } from "../App";

const categories = [
  {
    name: "Fiction",
    icon: Book,
    count: "12,500+ books",
    gradient: "from-blue-300 to-sky-400",
    bgImage: "https://images.unsplash.com/photo-1746913361326-01c3214c7540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwYm9va3MlMjBsaWJyYXJ5fGVufDF8fHx8MTc1NzgyMzkyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Stories that transport you to new worlds",
    color: "text-white",
    overlayColor: "bg-blue-500/40"
  },
  {
    name: "Romance",
    icon: Heart,
    count: "8,200+ books", 
    gradient: "from-rose-300 to-pink-400",
    bgImage: "https://images.unsplash.com/photo-1599276188787-63e64b366e9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwYm9va3MlMjBwaW5rfGVufDF8fHx8MTc1NzgyMzkzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Love stories that warm your heart",
    color: "text-white",
    overlayColor: "bg-rose-400/40"
  },
  {
    name: "Biography",
    icon: Users,
    count: "3,400+ books",
    gradient: "from-emerald-300 to-teal-400",
    bgImage: "https://images.unsplash.com/photo-1587928197638-4f4bf84829e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9ncmFwaHklMjBib29rcyUyMHBvcnRyYWl0c3xlbnwxfHx8fDE3NTc4MjM5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", 
    description: "Real lives, extraordinary stories",
    color: "text-white",
    overlayColor: "bg-emerald-500/40"
  },
  {
    name: "Self-Help",
    icon: Zap,
    count: "5,600+ books",
    gradient: "from-amber-300 to-yellow-400",
    bgImage: "https://images.unsplash.com/photo-1619646286047-c6681c24a695?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwaGVscCUyMGJvb2tzJTIwbW90aXZhdGlvbnxlbnwxfHx8fDE3NTc4MjM5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Transform your life and mindset",
    color: "text-white",
    overlayColor: "bg-amber-400/40"
  },
  {
    name: "Science Fiction",
    icon: Telescope,
    count: "4,800+ books",
    gradient: "from-violet-300 to-purple-400",
    bgImage: "https://images.unsplash.com/photo-1612570328404-fc96e7ba6d18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMHNwYWNlJTIwYm9va3N8ZW58MXx8fHwxNzU3ODIzOTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Explore the future and beyond",
    color: "text-white",
    overlayColor: "bg-violet-500/40"
  },
  {
    name: "Mystery",
    icon: Shield,
    count: "6,700+ books",
    gradient: "from-slate-300 to-gray-400",
    bgImage: "https://images.unsplash.com/photo-1563818072824-ed3d6ff52955?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwYm9va3MlMjBkZXRlY3RpdmV8ZW58MXx8fHwxNzU3ODIzOTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Suspense that keeps you guessing",
    color: "text-white",
    overlayColor: "bg-slate-500/40"
  },
  {
    name: "Fantasy",
    icon: Sparkles,
    count: "4,200+ books",
    gradient: "from-purple-300 to-indigo-400",
    bgImage: "https://images.unsplash.com/photo-1606337740587-3aee763fec8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWVkaWV2YWwlMjBib29rcyUyMG1hZ2ljfGVufDF8fHx8MTc1OTAzNzMyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Magic and adventure await",
    color: "text-white",
    overlayColor: "bg-purple-500/40"
  }
];

interface CategorySectionProps {
  onNavigate: (page: PageType, data?: any) => void;
}

export function CategorySection({ onNavigate }: CategorySectionProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.name}
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden relative h-64"
                onClick={() => onNavigate("category", { category: category.name })}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src={category.bgImage}
                    alt={`${category.name} books`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay for readability */}
                  <div className={`absolute inset-0 ${category.overlayColor} backdrop-blur-[0.5px]`}></div>
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
                    
                    <p className="text-white/90 leading-relaxed text-sm drop-shadow-md">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                        {category.count}
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

        {/* Call to action */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 text-blue-600 px-8 py-3"
            onClick={() => onNavigate("category", { category: "" })}
          >
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
}
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const API_URL = import.meta.env.VITE_API_URL;

interface HeroStats {
  totalBooks: number;
  totalUsers: number;
  averageRating: number;
}

export function HeroSection() {
  const [stats, setStats] = useState<HeroStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/stats/hero`);
        if (response.data?.success && response.data.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load hero stats:", error);
      }
    };

    fetchStats();
  }, []);

  const formatCount = (value: number, suffix: string = "+") => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K${suffix}`;
    }
    return `${value.toLocaleString()}${suffix}`;
  };

  const totalBooksLabel = stats ? formatCount(stats.totalBooks, "+") : "50K+";
  const totalUsersLabel = stats ? formatCount(stats.totalUsers, "+") : "25K+";
  const averageRatingLabel = stats ? `${stats.averageRating.toFixed(1)}★` : "4.8★";

  return (
    <section className="relative bg-gradient-to-r from-blue-100 to-sky-100 text-slate-800">
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover Your Next
                <span className="text-blue-500"> Great Read</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-lg">
                Explore thousands of books from bestselling authors, discover new genres, 
                and build your personal library with BookHaven.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-400 hover:bg-blue-500 text-white">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                Browse Categories
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{totalBooksLabel}</div>
                <div className="text-sm text-slate-500">Books Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{totalUsersLabel}</div>
                <div className="text-sm text-slate-500">Happy Readers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{averageRatingLabel}</div>
                <div className="text-sm text-slate-500">Customer Rating</div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1690179216796-74f4db8e5ae9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib29rc3RvcmV8ZW58MXx8fHwxNzU3Nzg0NTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern bookstore"
                className="rounded-lg shadow-2xl w-full max-w-md mx-auto"
              />
              
              {/* Floating book cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg p-4 shadow-lg hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-10 bg-blue-300 rounded"></div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Best Seller</div>
                    <div className="text-xs text-gray-600">Fiction</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-4 shadow-lg hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-10 bg-sky-300 rounded"></div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">New Release</div>
                    <div className="text-xs text-gray-600">Mystery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
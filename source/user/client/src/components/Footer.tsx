import { BookOpen, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-semibold">BookHaven</span>
            </div>
            <p className="text-gray-400">
              Your trusted destination for discovering, purchasing, and enjoying the world's best books.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Fiction</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Non-Fiction</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mystery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Romance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sci-Fi</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get notified about new releases and special offers.
            </p>
            <div className="space-y-2">
              <div className="flex">
                <Input
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white rounded-r-none"
                />
                <Button className="rounded-l-none">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2025 BookHaven. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
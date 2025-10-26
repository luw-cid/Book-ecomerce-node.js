import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { PaymentPage } from "./components/PaymentPage";
import { ProfilePage } from "./components/ProfilePage";
import { CategoryPage } from "./components/CategoryPage";
import { Book } from "./components/BookCard";
import { CartItem } from "./components/ShoppingCart";

import { useAuth } from "./context/authContext";

export type PageType = "home" | "login" | "register" | "product" | "cart" | "checkout" | "payment" | "profile" | "category";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export default function App() {
  const { user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [pageData, setPageData] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [user, setUser] = useState<User | null>(null);
  // Xử lý callback từ Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        login(userData, token);

        // Xóa query params khỏi URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Chuyển về trang home
        setCurrentPage("home");
      } catch (error) {
        console.error('Error processing Google login callback:', error);
      }
    }
  }, [login]);


  const handleNavigate = (page: PageType, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
  };

  const handleAddToCart = (payload: Book | { book: Book; variantId?: string }) => {
    // Normalize payload: nếu là object có key "book" thì extract book
    const book = "book" in payload ? payload.book : payload;
    const variantId = "variantId" in payload ? payload.variantId : undefined;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.book.id === book.id);
      if (existingItem) {
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { book, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.book.id !== bookId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.book.id === bookId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (bookId: string) => {
    setCartItems(prev => prev.filter(item => item.book.id !== bookId));
  };

  const handleToggleWishlist = (bookId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(bookId)) {
        newWishlist.delete(bookId);
      } else {
        newWishlist.add(bookId);
      }
      return newWishlist;
    });
  };

  const handleCartClick = () => {
    handleNavigate("cart");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogout = () => {
    // setUser(null);
    // setIsAuthenticated(false);
    logout();
    handleNavigate("home");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;
      case "product":
        return (
          <ProductDetailPage
            bookId={pageData?.bookId}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={wishlist.has(pageData?.bookId || "")}
          />
        );
      case "cart":
        return (
          <CartPage
            cartItems={cartItems}
            onNavigate={handleNavigate}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            isAuthenticated={!!user}
            userId={user?.id}
          />
        );
      case "checkout":
        return (
          <CheckoutPage
            cartItems={cartItems}
            onNavigate={handleNavigate}
          />
        );
      case "payment":
        return (
          <PaymentPage
            onNavigate={handleNavigate}
            checkoutData={pageData}
          />
        );
      case "profile":
        return (
          <ProfilePage
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            cartItems={cartItems}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        );
      case "category":
        return (
          <CategoryPage
            category={pageData?.category || ""}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            searchQuery={searchQuery}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spring-light/20 via-summer-light/20 via-autumn-light/20 to-winter-light/20">
      <Header
        cartItemCount={getTotalCartItems()}
        onCartClick={handleCartClick}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onNavigate={handleNavigate}
        isAuthenticated={!!user}
        user={user}
        onLogout={handleLogout}
      />
      {renderCurrentPage()}
    </div>
  );
}
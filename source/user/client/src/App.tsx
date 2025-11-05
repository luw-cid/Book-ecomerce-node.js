import { useState, useEffect } from "react";
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
import { type Book } from "./components/BookCard";
import { type CartItem } from "./components/ShoppingCart";
import axios from "axios";

import { useAuth } from "./context/authContext";

export type PageType = "home" | "login" | "register" | "product-detail" | "cart" | "checkout" | "payment" | "profile" | "category";

const API_URL = 'http://localhost:3000';
const CART_STORAGE_KEY = 'bookstore_cart';
const PAGE_STORAGE_KEY = 'bookstore_current_page'; // ✅ Thêm key cho page
const PAGE_DATA_STORAGE_KEY = 'bookstore_page_data'; // ✅ Thêm key cho page data

export default function App() {
  const { user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
    return (savedPage as PageType) || "home";
  });
  const [pageData, setPageData] = useState<any>(() => {
    const savedData = localStorage.getItem(PAGE_DATA_STORAGE_KEY);
    try {
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      return null;
    }
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCartSyncing, setIsCartSyncing] = useState(false);

    // ✅ Save currentPage to localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, currentPage);
  }, [currentPage]);

    // ✅ Save pageData to localStorage khi thay đổi
  useEffect(() => {
    if (pageData) {
      localStorage.setItem(PAGE_DATA_STORAGE_KEY, JSON.stringify(pageData));
    } else {
      localStorage.removeItem(PAGE_DATA_STORAGE_KEY);
    }
  }, [pageData]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cartItems]);

  // Sync cart with backend when user logs in
  useEffect(() => {
    if (user && !isCartSyncing) {
      syncCartWithBackend();
    }
  }, [user]);

  const syncCartWithBackend = async () => {
    if (!user || isCartSyncing) return;

    setIsCartSyncing(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // 1. Fetch cart from backend
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const backendCart = response.data.cart?.items || [];
      const localCart = cartItems;

      // 2. Merge carts - priority to local cart (newer)
      const mergedCart = [...localCart];
      
      backendCart.forEach((backendItem: any) => {
        const existingIndex = mergedCart.findIndex(
          item => item.book.id === backendItem.productId
        );
        
        if (existingIndex === -1) {
          // Item only in backend, add to merged cart
          // Note: You may need to fetch product details
          // For now, we'll skip items not in local cart
        } else {
          // Item in both, use max quantity
          mergedCart[existingIndex].quantity = Math.max(
            mergedCart[existingIndex].quantity,
            backendItem.quantity
          );
        }
      });

      // 3. Update backend with merged cart
      const syncPromises = mergedCart.map(item =>
        axios.post(
          `${API_URL}/cart/items`,
          {
            productId: item.book.id,
            quantity: item.quantity
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.warn(`Failed to sync item ${item.book.id}:`, err);
        })
      );

      await Promise.all(syncPromises);

      // 4. Update local state
      setCartItems(mergedCart);

      console.log('Cart synced with backend successfully');
    } catch (error: any) {
      console.error('Error syncing cart with backend:', error);
      // Don't block user, continue with local cart
    } finally {
      setIsCartSyncing(false);
    }
  };
  
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (payload: Book | { book: Book; variantId?: string }) => {
    // Normalize payload: nếu là object có key "book" thì extract book
    const book = "book" in payload ? payload.book : payload;

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
    logout();
    // Keep cart in localStorage for guest mode
    // User can continue shopping as guest
    handleNavigate("home");
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;
      case "product-detail":
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
            user={user as any}
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
            isAuthenticated={!!user}
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
        user={user as any}
        onLogout={handleLogout}
      />
      {renderCurrentPage()}
    </div>
  );
}
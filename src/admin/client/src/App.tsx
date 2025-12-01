import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ProductManagement } from './components/products/ProductManagement';
import { CategoryManagement } from './components/categories/CategoryManagement';
import { OrderManagement } from './components/orders/OrderManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { Statistics } from './components/statistics/Statistics';
import { CouponManagement } from './components/coupons/CouponManagement';
import { GeneralSettings } from './components/settings/GeneralSettings';
import { AppearanceSettings } from './components/appearance/AppearanceSettings';
import { Login } from './components/auth/Login';
import { Toaster } from './components/ui/sonner';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const storedAdmin = localStorage.getItem('adminData') || sessionStorage.getItem('adminData');

      if (storedToken && storedAdmin && storedAdmin !== 'undefined') {
        try {
          const adminData: Admin = JSON.parse(storedAdmin);
          setToken(storedToken);
          setAdmin(adminData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing admin data from storage:', error);
          // clear invalid data
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminData');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Handler khi login thanh cong
  const handleLogin = (authToken: string, adminData: Admin) => {
    setToken(authToken);
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  // Handler khi logout
  const handleLogout = () => {
    // Xóa token cà thng tin admin khỏi storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminData');

    // Cập nhật state
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  // Hiển thị loading khi đang check authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] to-[#0d2617]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'overview':
        return <OverviewDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'statistics':
        return <Statistics />;
      case 'coupons':
        return <CouponManagement />;
      case 'settings':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <OverviewDashboard />;
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onLogout={() => setIsAuthenticated(false)} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
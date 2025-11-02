import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Ticket, 
  Settings, 
  Palette,
  FolderOpen,
  X
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen = false, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#1a4d2e] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with close button on mobile */}
        <div className="p-6 border-b border-[#2d6a4f] flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl">Admin Panel</h1>
            <p className="text-sm text-gray-300 mt-1">E-commerce Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-white hover:bg-[#2d6a4f]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-[#2d6a4f] text-white'
                    : 'text-gray-300 hover:bg-[#2d6a4f]/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* User info */}
        <div className="p-4 border-t border-[#2d6a4f]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#2d6a4f] flex items-center justify-center">
              <span>A</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm truncate">Admin User</p>
              <p className="text-xs text-gray-300 truncate">admin@store.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

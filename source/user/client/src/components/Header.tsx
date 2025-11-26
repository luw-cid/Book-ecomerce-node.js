import { Search, ShoppingCart, User, BookOpen, Heart, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import type { PageType } from "../App";

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate?: (page: PageType) => void;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}
function getAvatarBgClass(name?: string) {
  const colors = [
    "bg-emerald-600",
    "bg-purple-600",
    "bg-rose-600",
    "bg-indigo-600",
    "bg-amber-600",
  ];
  if (!name) return colors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  return colors[Math.abs(h) % colors.length];
}
export function Header({ cartItemCount, onCartClick, searchQuery, onSearchChange, onNavigate, isAuthenticated, user, onLogout }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      // đậm hơn một chút: màu pastel hồng đậm hơn
      style={{
        backgroundColor: "rgba(255,192,220,0.98)", // đậm hơn pastel pink
        borderColor: "#FFB3D6",
        boxShadow: "0 1px 0 rgba(255,179,214,0.4) inset",
        backdropFilter: "blur(6px) saturate(120%)",
      }}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-center gap-14">
        {/* Logo - Left Side */}
        <button
          onClick={() => onNavigate?.("home")}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-blue-600">
            BookHaven
          </span>
        </button>

        {/* Centered Search */}
        <div className="flex-1 max-w-5xl">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-muted/50 border-muted focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* User Actions - Right Side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/80 transition-colors">
            <Heart className="h-4 w-4" />
          </Button>

          {/* Authentication Actions */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-spring to-summer text-white">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Your Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate?.("login")}
              className="h-9 w-9 hover:bg-muted/80 transition-colors"
            >
              <User className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={onCartClick} className="relative h-9 w-9 hover:bg-muted/80 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header >
  );
}
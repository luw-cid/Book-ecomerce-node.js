
import { Search, ShoppingCart, User, BookOpen, Heart, LogOut, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "../context/authContext";
import type { PageType} from "../App";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate?: (page: PageType, data?: any) => void;
}

export function Header({ cartItemCount, onCartClick, searchQuery, onSearchChange, onNavigate }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - Left Side */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <BookOpen className="h-6 w-6" />
          <span className="hidden sm:inline-block font-medium">BlueShelf</span>
        </div>

        {/* Centered Navigation & Search */}
        <div className="flex-1 flex items-center justify-center space-x-8 max-w-4xl mx-6">
          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-primary">
              Fiction
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-primary">
              Non-Fiction
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-primary">
              Mystery
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-primary">
              Sci-Fi
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-primary">
              Romance
            </a>
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-muted/50 border-muted focus:bg-background transition-colors"
              />
            </div>
          </div>
        </div>

        {/* User Actions - Right Side */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="hover:bg-muted/80 transition-colors">
            <Heart className="h-4 w-4" />
          </Button>
          
          {/* Authentication Actions */}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-spring to-summer text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Your Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
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
              className="hover:bg-muted/80 transition-colors"
            >
              <User className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" onClick={onCartClick} className="relative hover:bg-muted/80 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
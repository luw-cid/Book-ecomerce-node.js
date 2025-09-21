import { useState } from "react";
import { ArrowLeft, User, Mail, Calendar, Heart, ShoppingBag, Settings, Camera, Edit2, Package, Star, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { BookCard, type Book } from "./BookCard";
import { type CartItem } from "./ShoppingCart";
import { sampleBooks } from "../data/books";
import type { PageType } from "../App";
import type { User as authUser } from "../context/authContext"; 


interface ProfilePageProps {
  user: authUser | null;
  onNavigate: (page: PageType, data?: any) => void;
  onLogout: () => void;
  cartItems: CartItem[];
  wishlist: Set<string>;
  onToggleWishlist: (bookId: string) => void;
  onAddToCart: (book: Book) => void;
}

export function ProfilePage({ 
  user, 
  onNavigate, 
  onLogout, 
  cartItems, 
  wishlist, 
  onToggleWishlist, 
  onAddToCart 
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <Button onClick={() => onNavigate("login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // In a real app, this would update the user data via API
    setIsEditing(false);
  };

  // Mock order history
  const orderHistory = [
    {
      id: "order-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 45.98,
      items: 3,
      books: sampleBooks.slice(0, 2)
    },
    {
      id: "order-002", 
      date: "2024-01-08",
      status: "Shipped", 
      total: 29.99,
      items: 1,
      books: sampleBooks.slice(2, 3)
    }
  ];

  const wishlistBooks = sampleBooks.filter(book => wishlist.has(book.id));
  const memberSince = new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-summer/20 text-summer-foreground border-summer/30';
      case 'Shipped': return 'bg-winter/20 text-winter-foreground border-winter/30';
      case 'Processing': return 'bg-autumn/20 text-autumn-foreground border-autumn/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-spring-light/30 via-summer-light/30 via-autumn-light/30 to-winter-light/30 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-spring to-winter text-white text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-2xl font-bold bg-white"
                        />
                        <Button size="sm" onClick={handleSaveProfile}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-winter to-summer bg-clip-text text-transparent">
                          {user.name}
                        </h1>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="bg-white/80"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-spring">{orderHistory.length}</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-summer">{wishlistBooks.length}</div>
                      <div className="text-sm text-gray-600">Wishlist</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-winter">{cartItems.length}</div>
                      <div className="text-sm text-gray-600">In Cart</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Button className="bg-gradient-to-r from-summer to-winter text-white hover:opacity-90">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={onLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Cart</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Order History */}
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order History</h2>
              {orderHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start browsing to place your first order!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <p className="text-gray-600">
                              {new Date(order.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <p className="font-semibold text-lg mt-1">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600">{order.items} items</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View Details</Button>
                            <Button variant="outline" size="sm">Track Order</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Wishlist</h2>
              {wishlistBooks.length === 0 ? (
                <Card className="p-8 text-center">
                  <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-4">Save books you love to your wishlist!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistBooks.map((book) => (
                    <div key={book.id} onClick={() => onNavigate("product", { bookId: book.id })} className="cursor-pointer">
                      <BookCard
                        book={book}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cart */}
          <TabsContent value="cart" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
              {cartItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-4">Add some books to get started!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">{cartItems.length} items in cart</p>
                    <Button onClick={() => onNavigate("cart")}>View Full Cart</Button>
                  </div>
                  {cartItems.slice(0, 3).map((item) => (
                    <Card key={item.book.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.book.title}</h4>
                          <p className="text-gray-600">{item.book.author}</p>
                          <p className="font-semibold">${item.book.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-center text-gray-600">
                      and {cartItems.length - 3} more items...
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              <div className="grid gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={user.name} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} />
                      </div>
                    </div>
                    <Button>Update Profile</Button>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SMS notifications</span>
                        <input type="checkbox" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Marketing emails</span>
                        <input type="checkbox" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Two-Factor Authentication</Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
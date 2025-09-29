import { Book } from "../components/BookCard";
import { DiscountCode } from "./discountCodes";

export interface OrderItem {
  book: Book;
  variant: string; // variant ID
  variantName: string;
  quantity: number;
  price: number; // price at time of purchase
}

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string | null; // null for guest orders
  guestEmail?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discountCode?: string;
  discountAmount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  currentStatus: OrderStatus['status'];
  statusHistory: OrderStatus[];
  createdAt: string;
  trackingNumber?: string;
}

// Mock orders data
export const orders: Order[] = [
  {
    id: "ORD-001",
    userId: "user_123",
    items: [
      {
        book: {
          id: "1",
          title: "The Silent Patient",
          author: "Alex Michaelides",
          price: 14.99,
          rating: 4.5,
          reviewCount: 12847,
          category: "Mystery",
          brand: "Celadon Books",
          coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          variants: []
        },
        variant: "1-paperback",
        variantName: "Paperback",
        quantity: 2,
        price: 14.99
      }
    ],
    subtotal: 29.98,
    tax: 2.40,
    shipping: 0,
    discountAmount: 0,
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 3.00, // 10% of total
    total: 32.38,
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US"
    },
    paymentMethod: "credit-card",
    currentStatus: "shipped",
    statusHistory: [
      { status: "pending", timestamp: "2024-01-15T10:00:00Z" },
      { status: "confirmed", timestamp: "2024-01-15T10:30:00Z" },
      { status: "processing", timestamp: "2024-01-16T09:00:00Z" },
      { status: "shipped", timestamp: "2024-01-17T14:30:00Z", note: "Shipped via UPS" }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    trackingNumber: "1Z999AA1234567890"
  }
];

export const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'statusHistory' | 'currentStatus'>): Order => {
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    currentStatus: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: new Date().toISOString() }
    ]
  };
  
  orders.push(newOrder);
  return newOrder;
};

export const getOrdersByUser = (userId: string): Order[] => {
  return orders.filter(order => order.userId === userId);
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus['status'], note?: string): boolean => {
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;
  
  order.currentStatus = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note
  });
  
  return true;
};
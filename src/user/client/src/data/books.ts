import type { Book } from "../components/BookCard";

export const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    price: 14.99,
    originalPrice: 18.99,
    rating: 4.5,
    reviewCount: 12847,
    category: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "1-paperback", name: "Paperback", price: 14.99, originalPrice: 18.99, stock: 45, sku: "SP-PB-001" },
      { id: "1-hardcover", name: "Hardcover", price: 24.99, originalPrice: 28.99, stock: 23, sku: "SP-HC-001" },
      { id: "1-ebook", name: "E-book", price: 9.99, stock: 999, sku: "SP-EB-001" }
    ],
    isBestseller: true,
    isFlashSale: true,
    flashSaleEndTime: "2024-01-20T23:59:59"
  },
  {
    id: "2", 
    title: "Dune",
    author: "Frank Herbert",
    price: 16.99,
    rating: 4.8,
    reviewCount: 8934,
    category: "Science Fiction",
    coverImage: "https://images.unsplash.com/photo-1629237213606-4d894c8af292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTUyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "2-paperback", name: "Paperback", price: 16.99, stock: 67, sku: "DN-PB-002" },
      { id: "2-hardcover", name: "Hardcover", price: 27.99, stock: 34, sku: "DN-HC-002" },
      { id: "2-deluxe", name: "Deluxe Edition", price: 45.99, stock: 12, sku: "DN-DX-002" }
    ],
    isBestseller: true
  },
  {
    id: "3",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    price: 13.99,
    originalPrice: 17.99,
    rating: 4.7,
    reviewCount: 15623,
    category: "Fiction",
    brand: "Atria Books",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "3-paperback", name: "Paperback", price: 13.99, originalPrice: 17.99, stock: 89, sku: "EH-PB-003" },
      { id: "3-hardcover", name: "Hardcover", price: 23.99, stock: 23, sku: "EH-HC-003" }
    ],
    isNew: true
  },
  {
    id: "4",
    title: "Educated",
    author: "Tara Westover",
    price: 15.99,
    rating: 4.6,
    reviewCount: 9876,
    category: "Biography",
    coverImage: "https://images.unsplash.com/photo-1755188977089-3bb40306d57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGl0ZXJhdHVyZSUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTc2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "5",
    title: "Atomic Habits",
    author: "James Clear",
    price: 18.99,
    rating: 4.9,
    reviewCount: 23456,
    category: "Self-Help",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "6",
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.4,
    reviewCount: 7834,
    category: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFlashSale: true,
    flashSaleEndTime: "2024-01-20T23:59:59"
  },
  {
    id: "7",
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 14.99,
    rating: 4.3,
    reviewCount: 11234,
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isNew: true
  },
  {
    id: "8",
    title: "The Vanishing Half",
    author: "Brit Bennett",
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviewCount: 9567,
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFlashSale: true,
    flashSaleEndTime: "2024-01-20T23:59:59"
  },
  {
    id: "9",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 17.99,
    rating: 4.7,
    reviewCount: 14567,
    category: "Science Fiction",
    coverImage: "https://images.unsplash.com/photo-1629237213606-4d894c8af292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTUyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isNew: true
  },
  {
    id: "10",
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    price: 15.99,
    rating: 4.2,
    reviewCount: 8765,
    category: "Fantasy",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "11",
    title: "Becoming",
    author: "Michelle Obama",
    price: 19.99,
    rating: 4.8,
    reviewCount: 18234,
    category: "Biography",
    coverImage: "https://images.unsplash.com/photo-1755188977089-3bb40306d57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGl0ZXJhdHVyZSUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTc2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "12",
    title: "The Guest List",
    author: "Lucy Foley",
    price: 13.99,
    originalPrice: 17.99,
    rating: 4.1,
    reviewCount: 6789,
    category: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFlashSale: true,
    flashSaleEndTime: "2024-01-20T23:59:59"
  },
  {
    id: "13",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.6,
    reviewCount: 34567,
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "14",
    title: "The Name of the Rose",
    author: "Umberto Eco",
    price: 18.99,
    rating: 4.3,
    reviewCount: 5678,
    category: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "15",
    title: "The Martian",
    author: "Andy Weir",
    price: 15.99,
    rating: 4.7,
    reviewCount: 28934,
    category: "Science Fiction",
    coverImage: "https://images.unsplash.com/photo-1629237213606-4d894c8af292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTUyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "16",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    price: 17.99,
    rating: 4.5,
    reviewCount: 15623,
    category: "Self-Help",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "17",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    price: 19.99,
    rating: 4.4,
    reviewCount: 12456,
    category: "Biography",
    coverImage: "https://images.unsplash.com/photo-1755188977089-3bb40306d57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGl0ZXJhdHVyZSUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTc2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "18",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 14.99,
    rating: 4.8,
    reviewCount: 45678,
    category: "Fantasy",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "19",
    title: "It Ends with Us",
    author: "Colleen Hoover",
    price: 13.99,
    originalPrice: 16.99,
    rating: 4.2,
    reviewCount: 23789,
    category: "Romance",
    coverImage: "https://images.unsplash.com/photo-1599276188787-63e64b366e9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwYm9va3MlMjBwaW5rfGVufDF8fHx8MTc1NzgyMzkzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isNew: true
  },
  {
    id: "20",
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    price: 15.99,
    rating: 4.1,
    reviewCount: 18934,
    category: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBib29rc3xlbnwxfHx8fDE3NTc3ODU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "21",
    title: "Normal People",
    author: "Sally Rooney",
    price: 16.99,
    rating: 4.0,
    reviewCount: 14567,
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isNew: true
  },
  {
    id: "22",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    price: 12.99,
    rating: 4.6,
    reviewCount: 8765,
    category: "Self-Help",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "23",
    title: "Foundation",
    author: "Isaac Asimov",
    price: 17.99,
    rating: 4.5,
    reviewCount: 12345,
    category: "Science Fiction",
    coverImage: "https://images.unsplash.com/photo-1629237213606-4d894c8af292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTUyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "24",
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.3,
    reviewCount: 56789,
    category: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWN0aW9uJTIwbm92ZWwlMjBjb3ZlcnN8ZW58MXx8fHwxNzU3ODE5NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true,
    isFlashSale: true,
    flashSaleEndTime: "2024-01-20T23:59:59"
  },
  {
    id: "25",
    title: "The Pride and Prejudice",
    author: "Jane Austen",
    price: 11.99,
    rating: 4.7,
    reviewCount: 34567,
    category: "Romance",
    coverImage: "https://images.unsplash.com/photo-1599276188787-63e64b366e9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbmNlJTIwYm9va3MlMjBwaW5rfGVufDF8fHx8MTc1NzgyMzkzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "26",
    title: "Game of Thrones",
    author: "George R.R. Martin",
    price: 19.99,
    rating: 4.6,
    reviewCount: 67890,
    category: "Fantasy",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isBestseller: true
  },
  {
    id: "27",
    title: "Agatha Christie: An Autobiography",
    author: "Agatha Christie",
    price: 16.99,
    rating: 4.4,
    reviewCount: 7654,
    category: "Biography",
    coverImage: "https://images.unsplash.com/photo-1755188977089-3bb40306d57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbGl0ZXJhdHVyZSUyMGJvb2tzfGVufDF8fHx8MTc1Nzc4NTc2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "28",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    price: 15.99,
    rating: 4.5,
    reviewCount: 19876,
    category: "Self-Help",
    coverImage: "https://images.unsplash.com/photo-1650513259622-081281181c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJzJTIwbGlicmFyeXxlbnwxfHx8fDE3NTc4MTk1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];
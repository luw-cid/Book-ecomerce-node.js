export interface Review {
  id: string;
  bookId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export const sampleReviews: Review[] = [
  {
    id: "r1",
    bookId: "1",
    customerName: "Sarah M.",
    rating: 5,
    title: "Absolutely Gripping!",
    comment: "I couldn't put this book down! The psychological thriller kept me on the edge of my seat from start to finish. The way the author reveals the mystery piece by piece is masterful. Highly recommend for anyone who loves a good plot twist.",
    date: "2024-01-15",
    verified: true,
    helpful: 23,
    season: 'winter'
  },
  {
    id: "r2",
    bookId: "1",
    customerName: "Michael R.",
    rating: 4,
    title: "Great storyline, slow start",
    comment: "While the beginning felt a bit slow, once I got into it, I was completely hooked. The character development is excellent and the ending is worth the wait. Would definitely read more from this author.",
    date: "2024-01-10",
    verified: true,
    helpful: 15,
    season: 'winter'
  },
  {
    id: "r3",
    bookId: "1",
    customerName: "Jennifer L.",
    rating: 5,
    title: "A masterpiece of psychological fiction",
    comment: "This book explores the depths of human psychology in such a compelling way. The unreliable narrator kept me guessing until the very end. Perfect for book clubs - so much to discuss!",
    date: "2024-01-08",
    verified: true,
    helpful: 31,
    season: 'winter'
  },
  {
    id: "r4",
    bookId: "1",
    customerName: "David K.",
    rating: 3,
    title: "Good but predictable",
    comment: "I enjoyed the writing style and the atmosphere the author created, but I figured out the twist about halfway through. Still a solid read, just not as surprising as I hoped it would be.",
    date: "2024-01-05",
    verified: false,
    helpful: 8,
    season: 'winter'
  },
  {
    id: "r5",
    bookId: "2",
    customerName: "Alex Thompson",
    rating: 5,
    title: "Sci-Fi Epic at its finest",
    comment: "Dune is a timeless classic that continues to captivate readers decades after its publication. The world-building is unparalleled, and the political intrigue keeps you engaged throughout. A must-read for any sci-fi fan.",
    date: "2024-01-12",
    verified: true,
    helpful: 42,
    season: 'spring'
  },
  {
    id: "r6",
    bookId: "2",
    customerName: "Emily Chen",
    rating: 4,
    title: "Complex but rewarding",
    comment: "This book requires patience and attention, but it's incredibly rewarding. The depth of the universe Herbert created is amazing. Takes time to get into, but once you do, you're completely immersed.",
    date: "2024-01-09",
    verified: true,
    helpful: 18,
    season: 'spring'
  },
  {
    id: "r7",
    bookId: "3",
    customerName: "Maria Rodriguez",
    rating: 5,
    title: "Emotional and Beautiful",
    comment: "This book made me laugh, cry, and everything in between. The storytelling is absolutely beautiful, and Evelyn Hugo is such a complex, fascinating character. Couldn't put it down!",
    date: "2024-01-14",
    verified: true,
    helpful: 35,
    season: 'summer'
  },
  {
    id: "r8",
    bookId: "3",
    customerName: "James Wilson",
    rating: 4,
    title: "Great character development",
    comment: "The character arcs in this book are phenomenal. Each revelation about Evelyn's life feels earned and meaningful. A compelling read that stays with you long after you finish.",
    date: "2024-01-11",
    verified: true,
    helpful: 22,
    season: 'summer'
  },
  {
    id: "r9",
    bookId: "4",
    customerName: "Lisa Anderson",
    rating: 5,
    title: "Powerful and Important",
    comment: "This memoir is both heartbreaking and inspiring. Tara Westover's journey from isolation to education is incredible. A powerful testament to the importance of learning and self-discovery.",
    date: "2024-01-13",
    verified: true,
    helpful: 28,
    season: 'autumn'
  },
  {
    id: "r10",
    bookId: "4",
    customerName: "Robert Garcia",
    rating: 5,
    title: "Unforgettable memoir",
    comment: "One of the most powerful memoirs I've ever read. The way Westover writes about her family and her education is both beautiful and devastating. This book will change how you think about family, education, and resilience.",
    date: "2024-01-07",
    verified: true,
    helpful: 39,
    season: 'autumn'
  },
  {
    id: "r11",
    bookId: "5",
    customerName: "Ashley Taylor",
    rating: 5,
    title: "Life-changing book",
    comment: "This book has genuinely changed my daily routines and mindset. The advice is practical, backed by science, and easy to implement. I've already seen improvements in my productivity and overall well-being.",
    date: "2024-01-16",
    verified: true,
    helpful: 45,
    season: 'winter'
  },
  {
    id: "r12",
    bookId: "5",
    customerName: "Brandon Lee",
    rating: 4,
    title: "Practical and actionable",
    comment: "Clear's approach to building habits is refreshingly practical. No fluff, just solid advice that actually works. I've successfully implemented several of the strategies from this book.",
    date: "2024-01-06",
    verified: true,
    helpful: 20,
    season: 'winter'
  }
];

export function getReviewsForBook(bookId: string): Review[] {
  return sampleReviews.filter(review => review.bookId === bookId);
}

export function getAverageRating(bookId: string): number {
  const reviews = getReviewsForBook(bookId);
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function getRatingDistribution(bookId: string): { [key: number]: number } {
  const reviews = getReviewsForBook(bookId);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
  });
  
  return distribution;
}
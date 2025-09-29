export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed';
  points: number;
  orderId?: string;
  description: string;
  timestamp: string;
}

export interface UserLoyaltyAccount {
  userId: string;
  totalPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: LoyaltyTransaction[];
}

// Mock loyalty accounts
export const loyaltyAccounts: UserLoyaltyAccount[] = [
  {
    userId: "user_123",
    totalPoints: 150.00,
    totalEarned: 185.00,
    totalRedeemed: 35.00,
    transactions: [
      {
        id: "LT-001",
        userId: "user_123",
        type: "earned",
        points: 32.50,
        orderId: "ORD-001",
        description: "Points earned from order ORD-001",
        timestamp: "2024-01-15T10:00:00Z"
      },
      {
        id: "LT-002",
        userId: "user_123",
        type: "redeemed",
        points: 25.00,
        orderId: "ORD-002",
        description: "Points redeemed for order ORD-002",
        timestamp: "2024-01-18T14:30:00Z"
      }
    ]
  }
];

export const getLoyaltyAccount = (userId: string): UserLoyaltyAccount | null => {
  return loyaltyAccounts.find(account => account.userId === userId) || null;
};

export const createLoyaltyAccount = (userId: string): UserLoyaltyAccount => {
  const newAccount: UserLoyaltyAccount = {
    userId,
    totalPoints: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    transactions: []
  };
  
  loyaltyAccounts.push(newAccount);
  return newAccount;
};

export const earnPoints = (userId: string, orderTotal: number, orderId: string): number => {
  const pointsEarned = Math.floor(orderTotal * 0.10 * 100) / 100; // 10% as points, rounded to 2 decimals
  
  let account = getLoyaltyAccount(userId);
  if (!account) {
    account = createLoyaltyAccount(userId);
  }
  
  const transaction: LoyaltyTransaction = {
    id: `LT-${Date.now()}`,
    userId,
    type: 'earned',
    points: pointsEarned,
    orderId,
    description: `Points earned from order ${orderId}`,
    timestamp: new Date().toISOString()
  };
  
  account.totalPoints += pointsEarned;
  account.totalEarned += pointsEarned;
  account.transactions.push(transaction);
  
  return pointsEarned;
};

export const redeemPoints = (userId: string, pointsToRedeem: number, orderId: string): boolean => {
  const account = getLoyaltyAccount(userId);
  if (!account || account.totalPoints < pointsToRedeem) {
    return false;
  }
  
  const transaction: LoyaltyTransaction = {
    id: `LT-${Date.now()}`,
    userId,
    type: 'redeemed',
    points: pointsToRedeem,
    orderId,
    description: `Points redeemed for order ${orderId}`,
    timestamp: new Date().toISOString()
  };
  
  account.totalPoints -= pointsToRedeem;
  account.totalRedeemed += pointsToRedeem;
  account.transactions.push(transaction);
  
  return true;
};

export const getPointsValue = (points: number): number => {
  return points; // 1 point = $1 as per requirements
};
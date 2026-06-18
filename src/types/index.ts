export type PaymentMethod = 'cash' | 'card' | 'lankaqr' | 'credit';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Bill {
  id: string;
  billNo: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierId: string;
  cashierName: string;
  createdAt: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsUsed?: number;
  loyaltyPointsBalance?: number;
}

export interface Customer {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  joinedAt: string;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone: string;
  email: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  status: 'active' | 'closed';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
}

export interface DailySale {
  date: string;
  bills: number;
  revenue: number;
  profit: number;
  cash: number;
  card: number;
  lankaqr: number;
}

export const PERMISSIONS = [
  { id: 'pos.billing', label: 'POS Billing' },
  { id: 'products.manage', label: 'Manage Products' },
  { id: 'inventory.view', label: 'View Inventory' },
  { id: 'inventory.adjust', label: 'Adjust Stock' },
  { id: 'reports.view', label: 'View Reports' },
  { id: 'users.manage', label: 'Manage Staff' },
  { id: 'shifts.manage', label: 'Shift Management' },
] as const;

export const CATEGORIES = [
  'Rice & Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Beverages',
  'Snacks',
  'Spices',
  'Household',
  'Personal Care',
  'Frozen',
] as const;

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  lankaqr: 'LankaQR',
  credit: 'Credit',
};

export function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateBillNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${date}-${seq}`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-9);
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length !== 9) return phone;
  return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export function calculateLoyaltyPoints(amount: number): number {
  return Math.floor(amount / 100);
}

/** 1 loyalty point = Rs. 1 discount */
export const LOYALTY_POINT_VALUE = 1;

export function calculatePointsDiscount(points: number): number {
  return points * LOYALTY_POINT_VALUE;
}

export function getMaxRedeemablePoints(availablePoints: number, billTotal: number): number {
  return Math.min(availablePoints, Math.floor(billTotal / LOYALTY_POINT_VALUE));
}

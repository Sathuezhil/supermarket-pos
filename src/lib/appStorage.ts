import type { Product, Bill, StaffUser, Shift, StockMovement, DailySale, Customer } from '../types';
import {
  initialProducts,
  initialStaff,
  initialShifts,
  initialBills,
  initialStockMovements,
  initialCustomers,
} from '../data/mockData';
import { normalizePhone } from '../types';

const KEYS = {
  initialized: 'lanka_pos_initialized',
  products: 'lanka_pos_products',
  bills: 'lanka_pos_bills',
  staff: 'lanka_pos_staff',
  shifts: 'lanka_pos_shifts',
  stockMovements: 'lanka_pos_stock_movements',
  cart: 'lanka_pos_cart',
  customers: 'lanka_pos_customers',
} as const;

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initializeAppData(): void {
  if (!localStorage.getItem(KEYS.products)) save(KEYS.products, initialProducts);
  if (!localStorage.getItem(KEYS.bills)) save(KEYS.bills, initialBills);
  if (!localStorage.getItem(KEYS.staff)) save(KEYS.staff, initialStaff);
  if (!localStorage.getItem(KEYS.shifts)) save(KEYS.shifts, initialShifts);
  if (!localStorage.getItem(KEYS.stockMovements)) save(KEYS.stockMovements, initialStockMovements);
  if (!localStorage.getItem(KEYS.cart)) save(KEYS.cart, {});
  if (!localStorage.getItem(KEYS.customers)) save(KEYS.customers, initialCustomers);

  localStorage.setItem(KEYS.initialized, 'true');
}

export function getProducts(): Product[] {
  initializeAppData();
  return load(KEYS.products, initialProducts);
}

export function saveProducts(products: Product[]): void {
  save(KEYS.products, products);
}

export function getBills(): Bill[] {
  initializeAppData();
  return load(KEYS.bills, initialBills);
}

export function saveBills(bills: Bill[]): void {
  save(KEYS.bills, bills);
}

export function getStaff(): StaffUser[] {
  initializeAppData();
  return load(KEYS.staff, initialStaff);
}

export function saveStaff(staff: StaffUser[]): void {
  save(KEYS.staff, staff);
}

export function getStaffById(userId: string): StaffUser | undefined {
  return getStaff().find((u) => u.id === userId);
}

export function getShifts(): Shift[] {
  initializeAppData();
  return load(KEYS.shifts, initialShifts);
}

export function saveShifts(shifts: Shift[]): void {
  save(KEYS.shifts, shifts);
}

export function getStockMovements(): StockMovement[] {
  initializeAppData();
  return load(KEYS.stockMovements, initialStockMovements);
}

export function saveStockMovements(movements: StockMovement[]): void {
  save(KEYS.stockMovements, movements);
}

type CartStorage = Record<string, { product: Product; quantity: number; discount: number }[]>;

export function getCartForUser(userId: string): { product: Product; quantity: number; discount: number }[] {
  initializeAppData();
  const allCarts = load<CartStorage>(KEYS.cart, {});
  return allCarts[userId] ?? [];
}

export function saveCartForUser(
  userId: string,
  cart: { product: Product; quantity: number; discount: number }[],
): void {
  const allCarts = load<CartStorage>(KEYS.cart, {});
  allCarts[userId] = cart;
  save(KEYS.cart, allCarts);
}

export function getCustomers(): Customer[] {
  initializeAppData();
  return load(KEYS.customers, initialCustomers);
}

export function saveCustomers(customers: Customer[]): void {
  save(KEYS.customers, customers);
}

export function findCustomerByPhone(phone: string): Customer | undefined {
  const normalized = normalizePhone(phone);
  if (normalized.length < 9) return undefined;
  return getCustomers().find((c) => normalizePhone(c.phone) === normalized);
}

export function computeDailySales(bills: Bill[]): DailySale[] {
  const byDate = new Map<string, DailySale>();

  for (const bill of bills) {
    const date = bill.createdAt.slice(0, 10);
    const existing = byDate.get(date) ?? {
      date,
      bills: 0,
      revenue: 0,
      profit: 0,
      cash: 0,
      card: 0,
      lankaqr: 0,
    };

    existing.bills += 1;
    existing.revenue += bill.total;

    const billProfit = bill.items.reduce(
      (sum, item) => sum + (item.product.price - item.product.costPrice) * item.quantity,
      0,
    );
    existing.profit += billProfit;

    if (bill.paymentMethod === 'cash') existing.cash += bill.total;
    else if (bill.paymentMethod === 'card') existing.card += bill.total;
    else if (bill.paymentMethod === 'lankaqr') existing.lankaqr += bill.total;

    byDate.set(date, existing);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getEmptyDailySale(date?: string): DailySale {
  return {
    date: date ?? new Date().toISOString().slice(0, 10),
    bills: 0,
    revenue: 0,
    profit: 0,
    cash: 0,
    card: 0,
    lankaqr: 0,
  };
}

export function resetAllData(): void {
  localStorage.removeItem(KEYS.initialized);
  localStorage.removeItem(KEYS.products);
  localStorage.removeItem(KEYS.bills);
  localStorage.removeItem(KEYS.staff);
  localStorage.removeItem(KEYS.shifts);
  localStorage.removeItem(KEYS.stockMovements);
  localStorage.removeItem(KEYS.cart);
  localStorage.removeItem(KEYS.customers);
  initializeAppData();
}

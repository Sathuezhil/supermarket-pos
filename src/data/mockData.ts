import type { Product, Bill, StaffUser, Shift, StockMovement, DailySale, Customer } from '../types';

export const STORE_INFO = {
  name: 'Lanka Supermarket',
  address: 'No. 45, Galle Road, Colombo 03',
  phone: '+94 11 234 5678',
  email: 'info@lankasupermarket.lk',
  taxNo: 'VAT-123456789',
};

export const initialProducts: Product[] = [
  { id: '1', barcode: '4790012345678', name: 'Keeri Samba Rice 5kg', category: 'Rice & Grains', price: 1850, costPrice: 1650, stock: 120, minStock: 20, unit: 'pack', isActive: true },
  { id: '2', barcode: '4790012345679', name: 'Nadu Rice 5kg', category: 'Rice & Grains', price: 1650, costPrice: 1480, stock: 85, minStock: 15, unit: 'pack', isActive: true },
  { id: '3', barcode: '4790012345680', name: 'Anchor Milk Powder 400g', category: 'Dairy', price: 1280, costPrice: 1150, stock: 45, minStock: 10, unit: 'tin', isActive: true },
  { id: '4', barcode: '4790012345681', name: 'Coconut Oil 1L', category: 'Household', price: 890, costPrice: 780, stock: 60, minStock: 12, unit: 'bottle', isActive: true },
  { id: '5', barcode: '4790012345682', name: 'MD Kist Mango Juice 1L', category: 'Beverages', price: 420, costPrice: 350, stock: 8, minStock: 15, unit: 'bottle', isActive: true },
  { id: '6', barcode: '4790012345683', name: 'Elephant House Ginger Beer', category: 'Beverages', price: 180, costPrice: 145, stock: 5, minStock: 20, unit: 'bottle', isActive: true },
  { id: '7', barcode: '4790012345684', name: 'MD Samaposha 500g', category: 'Snacks', price: 650, costPrice: 580, stock: 30, minStock: 8, unit: 'pack', isActive: true },
  { id: '8', barcode: '4790012345685', name: 'Ceylon Tea 200g', category: 'Beverages', price: 520, costPrice: 420, stock: 55, minStock: 10, unit: 'box', isActive: true },
  { id: '9', barcode: '4790012345686', name: 'Curry Powder 250g', category: 'Spices', price: 380, costPrice: 310, stock: 40, minStock: 10, unit: 'pack', isActive: true },
  { id: '10', barcode: '4790012345687', name: 'Sunlight Soap 130g', category: 'Personal Care', price: 95, costPrice: 72, stock: 200, minStock: 30, unit: 'bar', isActive: true },
  { id: '11', barcode: '4790012345688', name: 'Fresh Coconut', category: 'Fruits', price: 120, costPrice: 85, stock: 3, minStock: 10, unit: 'pcs', isActive: true },
  { id: '12', barcode: '4790012345689', name: 'Potato 1kg', category: 'Vegetables', price: 280, costPrice: 220, stock: 25, minStock: 8, unit: 'kg', isActive: true },
  { id: '13', barcode: '4790012345690', name: 'Onion 1kg', category: 'Vegetables', price: 320, costPrice: 260, stock: 18, minStock: 8, unit: 'kg', isActive: true },
  { id: '14', barcode: '4790012345691', name: 'Frozen Chicken 1kg', category: 'Frozen', price: 1450, costPrice: 1280, stock: 22, minStock: 5, unit: 'pack', isActive: true },
  { id: '15', barcode: '4790012345692', name: 'Lion Soda 1.5L', category: 'Beverages', price: 250, costPrice: 195, stock: 35, minStock: 10, unit: 'bottle', isActive: true },
];

export const initialStaff: StaffUser[] = [
  { id: 'u1', username: 'admin', fullName: 'Kamal Perera', role: 'admin', phone: '+94 77 123 4567', email: 'kamal@lankasupermarket.lk', isActive: true, permissions: ['pos.billing', 'products.manage', 'inventory.view', 'inventory.adjust', 'reports.view', 'users.manage', 'shifts.manage'], createdAt: '2024-01-15' },
  { id: 'u2', username: 'manager1', fullName: 'Nimal Fernando', role: 'manager', phone: '+94 77 234 5678', email: 'nimal@lankasupermarket.lk', isActive: true, permissions: ['pos.billing', 'products.manage', 'inventory.view', 'inventory.adjust', 'reports.view', 'shifts.manage'], createdAt: '2024-03-20' },
  { id: 'u3', username: 'cashier1', fullName: 'Sithara Jayawardena', role: 'cashier', phone: '+94 77 345 6789', email: 'sithara@lankasupermarket.lk', isActive: true, permissions: ['pos.billing', 'inventory.view'], createdAt: '2024-06-01' },
  { id: 'u4', username: 'cashier2', fullName: 'Rajesh Kumar', role: 'cashier', phone: '+94 77 456 7890', email: 'rajesh@lankasupermarket.lk', isActive: true, permissions: ['pos.billing', 'inventory.view'], createdAt: '2024-08-15' },
  { id: 'u5', username: 'cashier3', fullName: 'Dilani Silva', role: 'cashier', phone: '+94 77 567 8901', email: 'dilani@lankasupermarket.lk', isActive: false, permissions: ['pos.billing'], createdAt: '2024-02-10' },
];

export const initialShifts: Shift[] = [
  { id: 's1', userId: 'u3', userName: 'Sithara Jayawardena', startTime: new Date().toISOString(), openingCash: 5000, totalSales: 45230, status: 'active' },
  { id: 's2', userId: 'u4', userName: 'Rajesh Kumar', startTime: new Date(Date.now() - 86400000).toISOString(), endTime: new Date(Date.now() - 43200000).toISOString(), openingCash: 5000, closingCash: 52340, totalSales: 67890, status: 'closed' },
];

export const initialBills: Bill[] = [];

export const initialCustomers: Customer[] = [
  { id: 'c1', phone: '771234567', fullName: 'Sunil Wickramasinghe', email: 'sunil@email.lk', loyaltyPoints: 245, totalVisits: 18, totalSpent: 24500, joinedAt: '2025-03-10' },
  { id: 'c2', phone: '772345678', fullName: 'Priya Fernando', email: 'priya@email.lk', loyaltyPoints: 520, totalVisits: 32, totalSpent: 52000, joinedAt: '2024-11-05' },
  { id: 'c3', phone: '773456789', fullName: 'Rajesh Kumar', loyaltyPoints: 85, totalVisits: 7, totalSpent: 8500, joinedAt: '2026-01-20' },
  { id: 'c4', phone: '774567890', fullName: 'Dilani Silva', email: 'dilani@email.lk', loyaltyPoints: 1200, totalVisits: 45, totalSpent: 120000, joinedAt: '2024-06-15' },
];

export const initialStockMovements: StockMovement[] = [
  { id: 'sm1', productId: '5', productName: 'MD Kist Mango Juice 1L', type: 'out', quantity: 12, reason: 'Sale', date: new Date().toISOString() },
  { id: 'sm2', productId: '1', productName: 'Keeri Samba Rice 5kg', type: 'in', quantity: 50, reason: 'Supplier delivery', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sm3', productId: '6', productName: 'Elephant House Ginger Beer', type: 'adjustment', quantity: -5, reason: 'Damaged stock', date: new Date(Date.now() - 172800000).toISOString() },
];

export const dailySalesData: DailySale[] = [
  { date: '2026-06-12', bills: 145, revenue: 234500, profit: 42100, cash: 156000, card: 48500, lankaqr: 30000 },
  { date: '2026-06-13', bills: 162, revenue: 267800, profit: 48900, cash: 178000, card: 52800, lankaqr: 37000 },
  { date: '2026-06-14', bills: 198, revenue: 312400, profit: 56200, cash: 201000, card: 68400, lankaqr: 43000 },
  { date: '2026-06-15', bills: 175, revenue: 289600, profit: 51800, cash: 189000, card: 58600, lankaqr: 42000 },
  { date: '2026-06-16', bills: 210, revenue: 345200, profit: 62400, cash: 225000, card: 72200, lankaqr: 48000 },
  { date: '2026-06-17', bills: 188, revenue: 298700, profit: 53600, cash: 195000, card: 63700, lankaqr: 40000 },
  { date: '2026-06-18', bills: 95, revenue: 156300, profit: 28100, cash: 98500, card: 32800, lankaqr: 25000 },
];

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { Product, Bill, CartItem, StaffUser, Shift, StockMovement, PaymentMethod, Customer } from '../types';
import { generateBillNo, calculateLoyaltyPoints, calculatePointsDiscount, normalizePhone } from '../types';
import type { DailySale } from '../types';
import { useAuth } from './AuthContext';
import { addCredential, updateCredentialForUser } from '../lib/authStorage';
import {
  initializeAppData,
  getProducts,
  saveProducts,
  getBills,
  saveBills,
  getStaff,
  saveStaff,
  getShifts,
  saveShifts,
  getStockMovements,
  saveStockMovements,
  getCartForUser,
  saveCartForUser,
  computeDailySales,
  getCustomers,
  saveCustomers,
} from '../lib/appStorage';

interface AppContextType {
  products: Product[];
  bills: Bill[];
  staff: StaffUser[];
  shifts: Shift[];
  stockMovements: StockMovement[];
  dailySales: DailySale[];
  currentUser: StaffUser;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  findByBarcode: (barcode: string) => Product | undefined;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  registerCustomer: (phone: string, fullName: string) => Customer;
  completeBill: (paymentMethod: PaymentMethod, amountPaid: number, customer?: Customer, pointsToUse?: number) => Bill | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantity: number, reason: string, type: StockMovement['type']) => void;
  addStaff: (user: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<StaffUser>) => void;
  startShift: (userId: string, openingCash: number) => void;
  endShift: (shiftId: string, closingCash: number) => void;
  getLowStockProducts: () => Product[];
  cartSubtotal: number;
  cartTotal: number;
  cartTax: number;
}

const AppContext = createContext<AppContextType | null>(null);

const TAX_RATE = 0.08;

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    initializeAppData();
    return getProducts();
  });
  const [bills, setBills] = useState<Bill[]>(() => getBills());
  const [staff, setStaff] = useState<StaffUser[]>(() => getStaff());
  const [shifts, setShifts] = useState<Shift[]>(() => getShifts());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => getStockMovements());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [cart, setCart] = useState<CartItem[]>([]);

  const userId = session?.userId ?? '';

  const currentUser = useMemo(() => {
    if (!session) return staff[0];
    return staff.find((u) => u.id === session.userId) ?? staff[0];
  }, [session, staff]);

  useEffect(() => {
    if (userId) {
      setCart(getCartForUser(userId));
    } else {
      setCart([]);
    }
  }, [userId]);

  const persistCart = useCallback(
    (nextCart: CartItem[]) => {
      setCart(nextCart);
      if (userId) saveCartForUser(userId, nextCart);
    },
    [userId],
  );

  const dailySales = useMemo(() => computeDailySales(bills), [bills]);

  const cartSubtotal = cart.reduce((sum, item) => {
    const lineTotal = item.product.price * item.quantity - item.discount;
    return sum + lineTotal;
  }, 0);

  const cartTax = cartSubtotal * TAX_RATE;
  const cartTotal = cartSubtotal + cartTax;

  const findByBarcode = useCallback(
    (barcode: string) => products.find((p) => p.barcode === barcode && p.isActive),
    [products],
  );

  const findCustomerByPhone = useCallback(
    (phone: string) => {
      const normalized = normalizePhone(phone);
      if (normalized.length < 9) return undefined;
      return customers.find((c) => normalizePhone(c.phone) === normalized);
    },
    [customers],
  );

  const registerCustomer = useCallback((phone: string, fullName: string): Customer => {
    const existing = findCustomerByPhone(phone);
    if (existing) return existing;

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      phone: normalizePhone(phone),
      fullName: fullName.trim(),
      loyaltyPoints: 0,
      totalVisits: 0,
      totalSpent: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    setCustomers((prev) => {
      const next = [...prev, newCustomer];
      saveCustomers(next);
      return next;
    });

    return newCustomer;
  }, [findCustomerByPhone]);

  const addToCart = useCallback(
    (product: Product, qty = 1) => {
      const existing = cart.find((i) => i.product.id === product.id);
      let nextCart: CartItem[];
      if (existing) {
        nextCart = cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      } else {
        nextCart = [...cart, { product, quantity: qty, discount: 0 }];
      }
      persistCart(nextCart);
    },
    [cart, persistCart],
  );

  const updateCartQty = useCallback(
    (productId: string, qty: number) => {
      const nextCart =
        qty <= 0
          ? cart.filter((i) => i.product.id !== productId)
          : cart.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i));
      persistCart(nextCart);
    },
    [cart, persistCart],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      persistCart(cart.filter((i) => i.product.id !== productId));
    },
    [cart, persistCart],
  );

  const clearCart = useCallback(() => persistCart([]), [persistCart]);

  const completeBill = useCallback(
    (paymentMethod: PaymentMethod, amountPaid: number, customer?: Customer, pointsToUse = 0): Bill | null => {
      if (cart.length === 0) return null;

      const actualPointsUsed = customer
        ? Math.min(pointsToUse, customer.loyaltyPoints, Math.floor(cartTotal))
        : 0;
      const pointsDiscount = calculatePointsDiscount(actualPointsUsed);
      const payableTotal = Math.max(0, cartTotal - pointsDiscount);
      const pointsEarned = customer ? calculateLoyaltyPoints(payableTotal) : 0;
      const newBalance = customer
        ? customer.loyaltyPoints - actualPointsUsed + pointsEarned
        : undefined;

      const bill: Bill = {
        id: crypto.randomUUID(),
        billNo: generateBillNo(),
        items: [...cart],
        subtotal: cartSubtotal,
        discount: pointsDiscount,
        tax: cartTax,
        total: payableTotal,
        paymentMethod,
        amountPaid,
        change: Math.max(0, amountPaid - payableTotal),
        cashierId: currentUser.id,
        cashierName: currentUser.fullName,
        createdAt: new Date().toISOString(),
        ...(customer && {
          customerId: customer.id,
          customerName: customer.fullName,
          customerPhone: customer.phone,
          loyaltyPointsUsed: actualPointsUsed,
          loyaltyPointsEarned: pointsEarned,
          loyaltyPointsBalance: newBalance,
        }),
      };

      const newBills = [bill, ...bills];
      const newProducts = products.map((p) => {
        const cartItem = cart.find((i) => i.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });

      const newMovements: StockMovement[] = cart.map((item) => ({
        id: crypto.randomUUID(),
        productId: item.product.id,
        productName: item.product.name,
        type: 'out' as const,
        quantity: item.quantity,
        reason: `Sale - ${bill.billNo}`,
        date: new Date().toISOString(),
      }));

      const newStockMovements = [...newMovements, ...stockMovements];

      const newShifts = shifts.map((s) =>
        s.status === 'active' && s.userId === currentUser.id
          ? { ...s, totalSales: s.totalSales + payableTotal }
          : s,
      );

      if (customer) {
        const updatedCustomers = customers.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                loyaltyPoints: c.loyaltyPoints - actualPointsUsed + pointsEarned,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + payableTotal,
              }
            : c,
        );
        saveCustomers(updatedCustomers);
        setCustomers(updatedCustomers);
      }

      saveBills(newBills);
      saveProducts(newProducts);
      saveStockMovements(newStockMovements);
      saveShifts(newShifts);

      setBills(newBills);
      setProducts(newProducts);
      setStockMovements(newStockMovements);
      setShifts(newShifts);
      persistCart([]);

      return bill;
    },
    [cart, cartSubtotal, cartTax, cartTotal, currentUser, bills, products, stockMovements, shifts, customers, persistCart],
  );

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID() };
    setProducts((prev) => {
      const next = [...prev, newProduct];
      saveProducts(next);
      return next;
    });
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveProducts(next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, isActive: false } : p));
      saveProducts(next);
      return next;
    });
  }, []);

  const adjustStock = useCallback(
    (productId: string, quantity: number, reason: string, type: StockMovement['type']) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newProducts = products.map((p) => {
        if (p.id !== productId) return p;
        const delta = type === 'out' ? -quantity : quantity;
        return { ...p, stock: Math.max(0, p.stock + delta) };
      });

      const movement: StockMovement = {
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
      };

      const newStockMovements = [movement, ...stockMovements];

      saveProducts(newProducts);
      saveStockMovements(newStockMovements);
      setProducts(newProducts);
      setStockMovements(newStockMovements);
    },
    [products, stockMovements],
  );

  const addStaff = useCallback((user: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newUser: StaffUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStaff((prev) => {
      const next = [...prev, newUser];
      saveStaff(next);
      return next;
    });
    addCredential({ userId: newUser.id, username: user.username, password: 'password123' });
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<StaffUser>) => {
    setStaff((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      saveStaff(next);
      if (updates.username) {
        updateCredentialForUser(id, updates.username);
      }
      return next;
    });
  }, []);

  const startShift = useCallback(
    (userId: string, openingCash: number) => {
      const user = staff.find((u) => u.id === userId);
      if (!user) return;
      const shift: Shift = {
        id: crypto.randomUUID(),
        userId,
        userName: user.fullName,
        startTime: new Date().toISOString(),
        openingCash,
        totalSales: 0,
        status: 'active',
      };
      setShifts((prev) => {
        const next = [shift, ...prev];
        saveShifts(next);
        return next;
      });
    },
    [staff],
  );

  const endShift = useCallback((shiftId: string, closingCash: number) => {
    setShifts((prev) => {
      const next = prev.map((s) =>
        s.id === shiftId
          ? { ...s, endTime: new Date().toISOString(), closingCash, status: 'closed' as const }
          : s,
      );
      saveShifts(next);
      return next;
    });
  }, []);

  const getLowStockProducts = useCallback(
    () => products.filter((p) => p.isActive && p.stock <= p.minStock),
    [products],
  );

  return (
    <AppContext.Provider
      value={{
        products,
        bills,
        staff,
        shifts,
        stockMovements,
        dailySales,
        currentUser,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        findByBarcode,
        findCustomerByPhone,
        registerCustomer,
        completeBill,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addStaff,
        updateStaff,
        startShift,
        endShift,
        getLowStockProducts,
        cartSubtotal,
        cartTotal,
        cartTax,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

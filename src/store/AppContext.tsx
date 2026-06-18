import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product, Bill, CartItem, StaffUser, Shift, StockMovement, PaymentMethod } from '../types';
import { generateBillNo } from '../types';
import {
  initialProducts,
  initialStaff,
  initialShifts,
  initialBills,
  initialStockMovements,
  dailySalesData,
} from '../data/mockData';
import type { DailySale } from '../types';

interface AppState {
  products: Product[];
  bills: Bill[];
  staff: StaffUser[];
  shifts: Shift[];
  stockMovements: StockMovement[];
  dailySales: DailySale[];
  currentUser: StaffUser;
  cart: CartItem[];
}

interface AppContextType extends AppState {
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  findByBarcode: (barcode: string) => Product | undefined;
  completeBill: (paymentMethod: PaymentMethod, amountPaid: number) => Bill | null;
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [dailySales] = useState<DailySale[]>(dailySalesData);
  const [currentUser] = useState<StaffUser>(initialStaff[2]);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { product, quantity: qty, discount: 0 }];
    });
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)),
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const completeBill = useCallback(
    (paymentMethod: PaymentMethod, amountPaid: number): Bill | null => {
      if (cart.length === 0) return null;

      const bill: Bill = {
        id: crypto.randomUUID(),
        billNo: generateBillNo(),
        items: [...cart],
        subtotal: cartSubtotal,
        discount: 0,
        tax: cartTax,
        total: cartTotal,
        paymentMethod,
        amountPaid,
        change: Math.max(0, amountPaid - cartTotal),
        cashierId: currentUser.id,
        cashierName: currentUser.fullName,
        createdAt: new Date().toISOString(),
      };

      setBills((prev) => [bill, ...prev]);

      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = cart.find((i) => i.product.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        }),
      );

      cart.forEach((item) => {
        setStockMovements((prev) => [
          {
            id: crypto.randomUUID(),
            productId: item.product.id,
            productName: item.product.name,
            type: 'out',
            quantity: item.quantity,
            reason: `Sale - ${bill.billNo}`,
            date: new Date().toISOString(),
          },
          ...prev,
        ]);
      });

      setShifts((prev) =>
        prev.map((s) =>
          s.status === 'active' && s.userId === currentUser.id
            ? { ...s, totalSales: s.totalSales + cartTotal }
            : s,
        ),
      );

      setCart([]);
      return bill;
    },
    [cart, cartSubtotal, cartTax, cartTotal, currentUser],
  );

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID() };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
  }, []);

  const adjustStock = useCallback(
    (productId: string, quantity: number, reason: string, type: StockMovement['type']) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const delta = type === 'out' ? -quantity : quantity;
          return { ...p, stock: Math.max(0, p.stock + delta) };
        }),
      );

      setStockMovements((prev) => [
        {
          id: crypto.randomUUID(),
          productId,
          productName: product.name,
          type,
          quantity: type === 'out' ? quantity : quantity,
          reason,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [products],
  );

  const addStaff = useCallback((user: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newUser: StaffUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStaff((prev) => [...prev, newUser]);
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<StaffUser>) => {
    setStaff((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
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
      setShifts((prev) => [shift, ...prev]);
    },
    [staff],
  );

  const endShift = useCallback((shiftId: string, closingCash: number) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? { ...s, endTime: new Date().toISOString(), closingCash, status: 'closed' as const }
          : s,
      ),
    );
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

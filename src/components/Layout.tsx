import { NavLink, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Warehouse,
  BarChart3,
  Users,
  Store,
  Bell,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { STORE_INFO } from '../data/mockData';

const navItems = [
  { to: '/', label: 'POS / Billing', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/users', label: 'Users & Staff', icon: Users },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentUser, getLowStockProducts } = useApp();
  const lowStockCount = getLowStockProducts().length;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-col bg-brand-800 text-white">
        <div className="border-b border-brand-700 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">{STORE_INFO.name}</h1>
              <p className="text-xs text-brand-200">{STORE_INFO.address}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 font-semibold text-white'
                    : 'text-brand-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div>{item.label}</div>
              </NavLink>
            );
          })}
        </nav>

        {lowStockCount > 0 && (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-2 text-xs text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            <span>{lowStockCount} items low stock</span>
          </div>
        )}

        <div className="border-t border-brand-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{currentUser.fullName}</p>
              <p className="text-xs text-brand-300 capitalize">{currentUser.role}</p>
            </div>
            <Bell className="h-4 w-4 text-brand-300" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

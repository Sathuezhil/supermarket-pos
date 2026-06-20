import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Warehouse,
  BarChart3,
  Users,
  Store,
  User,
  AlertTriangle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { STORE_INFO } from '../data/mockData';
import { canAccessRoute } from '../lib/roleAccess';

const navItems = [
  { to: '/', label: 'POS / Billing', shortLabel: 'POS', icon: ShoppingCart },
  { to: '/products', label: 'Products', shortLabel: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', shortLabel: 'Stock', icon: Warehouse },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: BarChart3 },
  { to: '/users', label: 'Users & Staff', shortLabel: 'Users', icon: Users },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentUser, getLowStockProducts } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const lowStockCount = getLowStockProducts().length;
  const isCashier = currentUser.role === 'cashier';

  const visibleNavItems = navItems.filter((item) => canAccessRoute(currentUser.role, item.to));

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white lg:flex-row">
      {/* Mobile top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 px-2 text-center">
          <h1 className="truncate text-sm font-bold text-slate-900">{STORE_INFO.name}</h1>
          <p className="truncate text-[10px] text-slate-500">{currentUser.fullName}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <User className="h-4 w-4" />
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:relative lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-sm ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold leading-tight text-slate-900">{STORE_INFO.name}</h1>
                <p className="text-xs text-slate-500">{STORE_INFO.address}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div>{item.label}</div>
              </NavLink>
            );
          })}
        </nav>

        {!isCashier && lowStockCount > 0 && (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{lowStockCount} items low stock</span>
          </div>
        )}

        <div className="space-y-3 border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{currentUser.fullName}</p>
              <p className="text-xs capitalize text-slate-500">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="app-bg min-h-0 flex-1 overflow-y-auto pb-[4.5rem] lg:pb-0">
        <div className="p-4 sm:p-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="flex">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="w-full truncate text-center">{item.shortLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

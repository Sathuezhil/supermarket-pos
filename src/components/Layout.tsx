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
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { STORE_INFO } from '../data/mockData';
import { canAccessRoute } from '../lib/roleAccess';

const navItems = [
  { to: '/', label: 'POS / Billing', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/users', label: 'Users & Staff', icon: Users },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentUser, getLowStockProducts } = useApp();
  const lowStockCount = getLowStockProducts().length;
  const isCashier = currentUser.role === 'cashier';

  const visibleNavItems = navItems.filter((item) => canAccessRoute(currentUser.role, item.to));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-slate-900">{STORE_INFO.name}</h1>
              <p className="text-xs text-slate-500">{STORE_INFO.address}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
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
                <Icon className="h-5 w-5" />
                <div>{item.label}</div>
              </NavLink>
            );
          })}
        </nav>

        {!isCashier && lowStockCount > 0 && (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>{lowStockCount} items low stock</span>
          </div>
        )}

        <div className="space-y-3 border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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

      <main className="app-bg flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

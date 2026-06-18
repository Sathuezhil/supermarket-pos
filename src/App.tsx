import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AppProvider } from './store/AppContext';

function AppRoutes() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<POSPage />} />
          <Route
            path="/products"
            element={
              <RoleRoute path="/products">
                <ProductsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <RoleRoute path="/inventory">
                <InventoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRoute path="/reports">
                <ReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute path="/users">
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

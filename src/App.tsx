import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<POSPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  );
}

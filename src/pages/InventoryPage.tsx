import { useState } from 'react';
import { AlertTriangle, Package, ArrowDownToLine, ArrowUpFromLine, Settings2, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, StatCard, Modal, formatLKR } from '../components/ui';

export function InventoryPage() {
  const { products, stockMovements, adjustStock, getLowStockProducts } = useApp();
  const [search, setSearch] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const lowStock = getLowStockProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const totalStockValue = activeProducts.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalItems = activeProducts.reduce((sum, p) => sum + p.stock, 0);

  const filtered = activeProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdjust = (productId?: string) => {
    setSelectedProductId(productId || '');
    setAdjustType('in');
    setAdjustQty('');
    setAdjustReason('');
    setAdjustOpen(true);
  };

  const handleAdjust = () => {
    const qty = parseInt(adjustQty);
    if (!selectedProductId || !qty || !adjustReason) return;
    adjustStock(selectedProductId, qty, adjustReason, adjustType);
    setAdjustOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Inventory / Stock"
        subtitle="Stock quantity check & low stock monitoring"
        action={
          <button onClick={() => openAdjust()} className="btn-primary">
            <Settings2 className="h-4 w-4" />
            Adjust Stock
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={activeProducts.length} icon={<Package className="h-6 w-6" />} color="blue" />
        <StatCard title="Total Stock Units" value={totalItems.toLocaleString()} color="green" />
        <StatCard title="Stock Value" value={formatLKR(totalStockValue)} subtitle="At cost price" color="slate" />
        <StatCard
          title="Low Stock Alerts"
          value={lowStock.length}
          subtitle="Items below minimum"
          icon={<AlertTriangle className="h-6 w-6" />}
          color={lowStock.length > 0 ? 'orange' : 'green'}
        />
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 card border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alert
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-white p-3 border border-amber-200">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{p.stock} {p.unit}</p>
                  <p className="text-xs text-slate-500">Min: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="input pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold">Stock Levels</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-500">Product</th>
                <th className="px-4 py-2 text-left font-medium text-slate-500">Category</th>
                <th className="px-4 py-2 text-right font-medium text-slate-500">In Stock</th>
                <th className="px-4 py-2 text-right font-medium text-slate-500">Min Level</th>
                <th className="px-4 py-2 text-center font-medium text-slate-500">Status</th>
                <th className="px-4 py-2 text-center font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isCritical = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.category}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{p.stock} {p.unit}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{p.minStock}</td>
                    <td className="px-4 py-2.5 text-center">
                      {isCritical ? (
                        <span className="badge-danger">Out of Stock</span>
                      ) : isLow ? (
                        <span className="badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge-success">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => openAdjust(p.id)} className="text-xs text-emerald-600 hover:underline">
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold">Recent Movements</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
            {stockMovements.slice(0, 20).map((m) => (
              <div key={m.id} className="flex items-start gap-3 text-sm">
                <div className={`mt-0.5 rounded-full p-1 ${
                  m.type === 'in' ? 'bg-emerald-100 text-emerald-600' :
                  m.type === 'out' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {m.type === 'in' ? <ArrowDownToLine className="h-3.5 w-3.5" /> :
                   m.type === 'out' ? <ArrowUpFromLine className="h-3.5 w-3.5" /> :
                   <Settings2 className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.productName}</p>
                  <p className="text-xs text-slate-500">{m.reason}</p>
                  <p className="text-xs text-slate-500">{new Date(m.date).toLocaleString('en-LK')}</p>
                </div>
                <span className={`font-semibold ${m.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {m.type === 'in' ? '+' : '-'}{m.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust Stock" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Product</label>
            <select className="input" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
              <option value="">Select product...</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['in', 'out', 'adjustment'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAdjustType(t)}
                  className={`rounded-lg border-2 p-2 text-sm capitalize ${
                    adjustType === t ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  {t === 'in' ? 'Stock In' : t === 'out' ? 'Stock Out' : 'Adjustment'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" className="input" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="input" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="e.g. Supplier delivery, Damaged goods" />
          </div>
          <button onClick={handleAdjust} className="btn-primary w-full">Apply Adjustment</button>
        </div>
      </Modal>
    </div>
  );
}

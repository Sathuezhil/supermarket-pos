import { useState } from 'react';
import { Plus, Pencil, Search, Tag } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, Modal, formatLKR } from '../components/ui';
import { CATEGORIES, type Product } from '../types';

const emptyProduct = {
  barcode: '',
  name: '',
  category: 'Rice & Grains',
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 5,
  unit: 'pcs',
  isActive: true,
};

export function ProductsPage() {
  const { products, addProduct, updateProduct } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [priceEditId, setPriceEditId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct, barcode: String(Date.now()).slice(-13) });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      barcode: product.barcode,
      name: product.name,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.barcode) return;
    if (editing) {
      updateProduct(editing.id, form);
    } else {
      addProduct(form);
    }
    setModalOpen(false);
  };

  const handlePriceUpdate = (id: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      updateProduct(id, { price });
      setPriceEditId(null);
      setNewPrice('');
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Add, edit products & update prices"
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or barcode..."
            className="input pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Barcode</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Category</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Cost</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Price</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Margin</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Stock</th>
              <th className="px-4 py-3 text-center font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-center font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => {
              const margin = product.price > 0 ? ((product.price - product.costPrice) / product.price * 100).toFixed(1) : '0';
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{product.barcode}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{product.category}</td>
                  <td className="px-4 py-3 text-right">{formatLKR(product.costPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    {priceEditId === product.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="input w-24 text-right py-1"
                          autoFocus
                        />
                        <button onClick={() => handlePriceUpdate(product.id)} className="text-emerald-600 text-xs">Save</button>
                        <button onClick={() => setPriceEditId(null)} className="text-slate-500 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPriceEditId(product.id); setNewPrice(String(product.price)); }}
                        className="font-semibold text-emerald-600 hover:underline flex items-center justify-end gap-1 ml-auto"
                      >
                        <Tag className="h-3 w-3" />
                        {formatLKR(product.price)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{margin}%</td>
                  <td className="px-4 py-3 text-right">{product.stock} {product.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={product.isActive ? 'badge-success' : 'badge-danger'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(product)} className="text-slate-500 hover:text-emerald-600">
                      <Pencil className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Barcode</label>
            <input className="input font-mono" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Product Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Cost Price (Rs.)</label>
            <input type="number" className="input" value={form.costPrice || ''} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Selling Price (Rs.)</label>
            <input type="number" className="input" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Stock Quantity</label>
            <input type="number" className="input" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Min Stock Alert</label>
            <input type="number" className="input" value={form.minStock || ''} onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {['pcs', 'kg', 'pack', 'bottle', 'tin', 'box', 'bar'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editing ? 'Update' : 'Add Product'}</button>
        </div>
      </Modal>
    </div>
  );
}

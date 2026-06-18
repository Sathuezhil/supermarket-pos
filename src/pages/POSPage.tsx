import { useState, useRef, useEffect } from 'react';
import {
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, Modal, formatLKR } from '../components/ui';
import { PAYMENT_LABELS, type PaymentMethod } from '../types';
import { STORE_INFO } from '../data/mockData';

export function POSPage() {
  const {
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    findByBarcode,
    completeBill,
    cartSubtotal,
    cartTax,
    cartTotal,
    currentUser,
  } = useApp();

  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [completedBill, setCompletedBill] = useState<ReturnType<typeof completeBill>>(null);
  const [scanError, setScanError] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const product = findByBarcode(barcode.trim());
    if (product) {
      if (product.stock <= 0) {
        setScanError(`${product.name} - Out of stock!`);
      } else {
        addToCart(product);
        setScanError('');
      }
    } else {
      setScanError(`Barcode not found: ${barcode}`);
    }
    setBarcode('');
    barcodeRef.current?.focus();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search) ||
        p.category.toLowerCase().includes(search.toLowerCase())),
  );

  const handlePayment = () => {
    const paid = paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : cartTotal;
    if (paymentMethod === 'cash' && paid < cartTotal) return;

    const bill = completeBill(paymentMethod, paid);
    if (bill) {
      setCompletedBill(bill);
      setPaymentOpen(false);
      setAmountPaid('');
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <div>
      <PageHeader
        title="POS / Billing"
        subtitle="Scan barcode, create bill & receive payment"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Product search & grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode Scanner */}
          <div className="card p-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-600" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="input pl-10 text-lg font-mono"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary px-6">
                Add
              </button>
            </form>
            {scanError && (
              <p className="mt-2 text-sm text-red-600">{scanError}</p>
            )}
          </div>

          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, barcode, category..."
              className="input pl-9"
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => product.stock > 0 && addToCart(product)}
                disabled={product.stock <= 0}
                className="card p-3 text-left transition-all hover:shadow-md hover:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm font-medium text-slate-900 line-clamp-2">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-700">{formatLKR(product.price)}</span>
                  <span className={`text-xs ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-400'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart & Payment */}
        <div className="space-y-4">
          <div className="card flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Current Bill
                </h2>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-red-600 hover:text-red-700">
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Cashier: {currentUser.fullName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  Scan barcode or click product to add
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{formatLKR(item.product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="rounded p-1 hover:bg-slate-100"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="rounded p-1 hover:bg-slate-100"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold w-24 text-right">
                      {formatLKR(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatLKR(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">VAT (8%)</span>
                <span>{formatLKR(cartTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                <span>Total</span>
                <span className="text-brand-700">{formatLKR(cartTotal)}</span>
              </div>
              <button
                onClick={() => {
                  setPaymentMethod('cash');
                  setAmountPaid(String(Math.ceil(cartTotal / 100) * 100));
                  setPaymentOpen(true);
                }}
                disabled={cart.length === 0}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                Receive Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Receive Payment" size="md">
        <div className="space-y-4">
          <div className="text-center py-3 bg-brand-50 rounded-lg">
            <p className="text-sm text-slate-500">Amount Due</p>
            <p className="text-3xl font-bold text-brand-700">{formatLKR(cartTotal)}</p>
          </div>

          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {(['cash', 'card', 'lankaqr', 'credit'] as PaymentMethod[]).map((method) => {
                const icons = { cash: Banknote, card: CreditCard, lankaqr: QrCode, credit: Receipt };
                const Icon = icons[method];
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm transition-colors ${
                      paymentMethod === method
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {PAYMENT_LABELS[method]}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <label className="label">Amount Received (Rs.)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="input text-lg font-mono"
                autoFocus
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmountPaid(String(amt))}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                  >
                    Rs. {amt}
                  </button>
                ))}
                <button
                  onClick={() => setAmountPaid(String(Math.ceil(cartTotal)))}
                  className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1 text-xs text-brand-700"
                >
                  Exact
                </button>
              </div>
              {parseFloat(amountPaid) >= cartTotal && (
                <p className="mt-2 text-sm font-medium text-green-600">
                  Change: {formatLKR(parseFloat(amountPaid) - cartTotal)}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={paymentMethod === 'cash' && parseFloat(amountPaid) < cartTotal}
            className="btn-primary w-full py-3"
          >
            Complete Payment
          </button>
        </div>
      </Modal>

      {/* Bill Receipt Modal */}
      <Modal
        open={!!completedBill}
        onClose={() => setCompletedBill(null)}
        title="Bill Created Successfully"
        size="md"
      >
        {completedBill && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2 text-lg font-semibold">{completedBill.billNo}</p>
            </div>
            <div className="border-t border-b border-dashed border-slate-300 py-4 text-center text-sm space-y-1">
              <p className="font-bold">{STORE_INFO.name}</p>
              <p className="text-slate-500">{STORE_INFO.address}</p>
              <p className="text-slate-500">Tel: {STORE_INFO.phone}</p>
              <p className="text-slate-500">VAT No: {STORE_INFO.taxNo}</p>
            </div>
            <div className="space-y-1 text-sm">
              {completedBill.items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>{formatLKR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatLKR(completedBill.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (8%)</span>
                <span>{formatLKR(completedBill.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatLKR(completedBill.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{PAYMENT_LABELS[completedBill.paymentMethod]}</span>
              </div>
              {completedBill.change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Change</span>
                  <span>{formatLKR(completedBill.change)}</span>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-slate-400">
              Cashier: {completedBill.cashierName} | {new Date(completedBill.createdAt).toLocaleString('en-LK')}
            </p>
            <button onClick={() => setCompletedBill(null)} className="btn-primary w-full">
              New Bill
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

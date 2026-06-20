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
  Phone,
  User,
  Star,
  X,
  Printer,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, Modal, formatLKR } from '../components/ui';
import { BillReceipt } from '../components/BillReceipt';
import { printBillReceipt } from '../lib/printBill';
import { PAYMENT_LABELS, type PaymentMethod, type Customer, formatPhoneDisplay, calculateLoyaltyPoints, calculatePointsDiscount, getMaxRedeemablePoints, LOYALTY_POINT_VALUE } from '../types';

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
    findCustomerByPhone,
    registerCustomer,
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
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerError, setCustomerError] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleLookupCustomer = () => {
    setCustomerError('');
    setShowNewCustomerForm(false);

    const phone = customerPhone.trim();
    if (!phone) {
      setCustomerError('Enter customer phone number');
      setSelectedCustomer(null);
      return;
    }

    const customer = findCustomerByPhone(phone);
    if (customer) {
      setSelectedCustomer(customer);
      setShowNewCustomerForm(false);
      setUsePoints(false);
      setPointsToUse(0);
    } else {
      setSelectedCustomer(null);
      setShowNewCustomerForm(true);
      setCustomerError('New customer — enter name to register');
    }
  };

  const handleRegisterCustomer = () => {
    if (!newCustomerName.trim()) {
      setCustomerError('Enter customer name');
      return;
    }
    const customer = registerCustomer(customerPhone, newCustomerName);
    setSelectedCustomer(customer);
    setShowNewCustomerForm(false);
    setCustomerError('');
  };

  const handleClearCustomer = () => {
    setCustomerPhone('');
    setSelectedCustomer(null);
    setNewCustomerName('');
    setShowNewCustomerForm(false);
    setCustomerError('');
    setUsePoints(false);
    setPointsToUse(0);
  };

  const maxRedeemablePoints = selectedCustomer
    ? getMaxRedeemablePoints(selectedCustomer.loyaltyPoints, cartTotal)
    : 0;

  const appliedPoints = usePoints && selectedCustomer
    ? Math.min(pointsToUse, maxRedeemablePoints)
    : 0;

  const pointsDiscount = calculatePointsDiscount(appliedPoints);
  const payableTotal = Math.max(0, cartTotal - pointsDiscount);
  const pointsToEarn = selectedCustomer ? calculateLoyaltyPoints(payableTotal) : 0;

  useEffect(() => {
    if (selectedCustomer && usePoints) {
      setPointsToUse((prev) => Math.min(prev || maxRedeemablePoints, maxRedeemablePoints));
    }
  }, [cartTotal, selectedCustomer, usePoints, maxRedeemablePoints]);

  const handlePayment = () => {
    const paid = paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : payableTotal;
    if (paymentMethod === 'cash' && paid < payableTotal) return;

    const bill = completeBill(paymentMethod, paid, selectedCustomer ?? undefined, appliedPoints);
    if (bill) {
      setCompletedBill(bill);
      setPaymentOpen(false);
      setAmountPaid('');
      handleClearCustomer();
    }
  };

  const handlePrintBill = () => {
    if (!completedBill || !receiptRef.current) return;
    printBillReceipt(receiptRef.current.innerHTML, completedBill.billNo);
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
            <form onSubmit={handleBarcodeSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="input pl-10 text-base font-mono sm:text-lg"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full px-6 sm:w-auto">
                Add
              </button>
            </form>
            {scanError && (
              <p className="mt-2 text-sm text-red-600">{scanError}</p>
            )}
          </div>

          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
                className="card p-3 text-left transition-all hover:shadow-md hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm font-medium text-slate-900 line-clamp-2">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">{formatLKR(product.price)}</span>
                  <span className={`text-xs ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-500'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart & Payment */}
        <div className="space-y-4">
          {/* Customer lookup */}
          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User className="h-4 w-4 text-emerald-600" />
              Customer
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="relative min-w-0 flex-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupCustomer()}
                  placeholder="07X XXX XXXX"
                  className="input pl-9"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleLookupCustomer} className="btn-primary flex-1 px-4 sm:flex-none">
                  Lookup
                </button>
                {(selectedCustomer || customerPhone) && (
                  <button type="button" onClick={handleClearCustomer} className="btn-secondary px-3">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {customerError && (
              <p className={`mt-2 text-xs ${showNewCustomerForm ? 'text-amber-600' : 'text-red-600'}`}>
                {customerError}
              </p>
            )}

            {showNewCustomerForm && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Customer full name"
                  className="input min-w-0 flex-1"
                />
                <button type="button" onClick={handleRegisterCustomer} className="btn-secondary whitespace-nowrap">
                  Register
                </button>
              </div>
            )}

            {selectedCustomer && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{selectedCustomer.fullName}</p>
                    <p className="text-xs text-slate-500">{formatPhoneDisplay(selectedCustomer.phone)}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold">{selectedCustomer.loyaltyPoints}</span>
                    <span className="text-xs">pts</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <span>Visits: {selectedCustomer.totalVisits}</span>
                  <span>Spent: {formatLKR(selectedCustomer.totalSpent)}</span>
                </div>
                {cart.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {appliedPoints > 0
                      ? `Earn +${pointsToEarn} pts after redeeming ${appliedPoints} pts`
                      : pointsToEarn > 0
                        ? `+${pointsToEarn} points will be earned on this bill`
                        : null}
                  </p>
                )}

                {selectedCustomer.loyaltyPoints > 0 && cart.length > 0 && (
                  <div className="mt-3 border-t border-emerald-200 pt-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => {
                          setUsePoints(e.target.checked);
                          if (e.target.checked) {
                            setPointsToUse(maxRedeemablePoints);
                          } else {
                            setPointsToUse(0);
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-800">Use loyalty points</span>
                      <span className="text-xs text-slate-500">(1 pt = Rs. {LOYALTY_POINT_VALUE})</span>
                    </label>

                    {usePoints && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={maxRedeemablePoints}
                          value={pointsToUse}
                          onChange={(e) =>
                            setPointsToUse(
                              Math.min(maxRedeemablePoints, Math.max(0, parseInt(e.target.value) || 0)),
                            )
                          }
                          className="input w-24 text-center"
                        />
                        <span className="text-xs text-slate-500">/ {maxRedeemablePoints} max</span>
                        <button
                          type="button"
                          onClick={() => setPointsToUse(maxRedeemablePoints)}
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Use all
                        </button>
                      </div>
                    )}

                    {usePoints && appliedPoints > 0 && (
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Discount: {formatLKR(pointsDiscount)} ({appliedPoints} pts)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card flex flex-col max-h-[55vh] lg:max-h-[calc(100vh-340px)]">
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
                <p className="text-center text-sm text-slate-500 py-8">
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
              {appliedPoints > 0 && (
                <div className="flex justify-between text-sm text-amber-700">
                  <span>Points discount ({appliedPoints} pts)</span>
                  <span>-{formatLKR(pointsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                <span>{appliedPoints > 0 ? 'Payable' : 'Total'}</span>
                <span className="text-emerald-600">{formatLKR(payableTotal)}</span>
              </div>
              <button
                onClick={() => {
                  setPaymentMethod('cash');
                  setAmountPaid(String(Math.ceil(payableTotal / 100) * 100 || Math.ceil(payableTotal)));
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
          <div className="text-center py-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-slate-500">Amount Due</p>
            <p className="text-3xl font-bold text-emerald-600">{formatLKR(payableTotal)}</p>
            {appliedPoints > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Includes {appliedPoints} pts discount ({formatLKR(pointsDiscount)})
              </p>
            )}
          </div>

          {selectedCustomer && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <p className="font-medium text-slate-900">{selectedCustomer.fullName}</p>
              <p className="text-xs text-slate-500">{formatPhoneDisplay(selectedCustomer.phone)}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="text-amber-700">Balance: {selectedCustomer.loyaltyPoints} pts</span>
                {appliedPoints > 0 && (
                  <span className="font-medium text-amber-700">Redeem: -{appliedPoints} pts</span>
                )}
                {pointsToEarn > 0 && (
                  <span className="font-medium text-emerald-700">Earn: +{pointsToEarn} pts</span>
                )}
              </div>
            </div>
          )}

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
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-200'
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
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-100"
                  >
                    Rs. {amt}
                  </button>
                ))}
                <button
                  onClick={() => setAmountPaid(String(Math.ceil(payableTotal)))}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-600"
                >
                  Exact
                </button>
              </div>
              {parseFloat(amountPaid) >= payableTotal && (
                <p className="mt-2 text-sm font-medium text-emerald-600">
                  Change: {formatLKR(parseFloat(amountPaid) - payableTotal)}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={paymentMethod === 'cash' && parseFloat(amountPaid) < payableTotal}
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
            <div ref={receiptRef}>
              <BillReceipt bill={completedBill} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handlePrintBill} className="btn-secondary flex-1 py-3">
                <Printer className="h-4 w-4" />
                Print Bill
              </button>
              <button onClick={() => setCompletedBill(null)} className="btn-primary flex-1 py-3">
                New Bill
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

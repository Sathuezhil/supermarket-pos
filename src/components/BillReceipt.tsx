import type { Bill } from '../types';
import { PAYMENT_LABELS, formatPhoneDisplay } from '../types';
import { STORE_INFO } from '../data/mockData';
import { formatLKR } from './ui';

interface BillReceiptProps {
  bill: Bill;
}

export function BillReceipt({ bill }: BillReceiptProps) {
  return (
    <div className="bill-receipt space-y-3 text-sm">
      <div className="border-b border-dashed border-slate-300 pb-3 text-center space-y-0.5">
        <p className="text-base font-bold">{STORE_INFO.name}</p>
        <p className="text-slate-600">{STORE_INFO.address}</p>
        <p className="text-slate-600">Tel: {STORE_INFO.phone}</p>
        <p className="text-slate-600">VAT No: {STORE_INFO.taxNo}</p>
      </div>

      <div className="flex justify-between text-xs text-slate-600">
        <span>Bill No: {bill.billNo}</span>
        <span>{new Date(bill.createdAt).toLocaleString('en-LK')}</span>
      </div>

      <div className="space-y-1">
        {bill.items.map((item) => (
          <div key={item.product.id} className="flex justify-between gap-2">
            <span className="min-w-0 flex-1">
              {item.product.name} x{item.quantity}
            </span>
            <span className="shrink-0">{formatLKR(item.product.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatLKR(bill.subtotal)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between">
            <span>Points discount</span>
            <span>-{formatLKR(bill.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>VAT (8%)</span>
          <span>{formatLKR(bill.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatLKR(bill.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment</span>
          <span>{PAYMENT_LABELS[bill.paymentMethod]}</span>
        </div>
        {bill.change > 0 && (
          <div className="flex justify-between font-medium">
            <span>Change</span>
            <span>{formatLKR(bill.change)}</span>
          </div>
        )}
      </div>

      {bill.customerName && (
        <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{bill.customerName}</span>
          </div>
          {bill.customerPhone && (
            <div className="flex justify-between text-slate-600">
              <span>Phone</span>
              <span>{formatPhoneDisplay(bill.customerPhone)}</span>
            </div>
          )}
          {bill.loyaltyPointsUsed != null && bill.loyaltyPointsUsed > 0 && (
            <div className="flex justify-between">
              <span>Points Used</span>
              <span>-{bill.loyaltyPointsUsed} pts</span>
            </div>
          )}
          {bill.loyaltyPointsEarned != null && bill.loyaltyPointsEarned > 0 && (
            <div className="flex justify-between">
              <span>Points Earned</span>
              <span>+{bill.loyaltyPointsEarned} pts</span>
            </div>
          )}
          {bill.loyaltyPointsBalance != null && (
            <div className="flex justify-between">
              <span>Total Points</span>
              <span>{bill.loyaltyPointsBalance} pts</span>
            </div>
          )}
        </div>
      )}

      <p className="border-t border-dashed border-slate-300 pt-2 text-center text-xs text-slate-600">
        Cashier: {bill.cashierName}
      </p>
      <p className="text-center text-xs text-slate-500">Thank you for shopping with us!</p>
    </div>
  );
}

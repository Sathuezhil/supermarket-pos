import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Receipt, Package } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, StatCard, formatLKR } from '../components/ui';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444'];

export function ReportsPage() {
  const { dailySales, products, bills } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'profit' | 'stock'>('sales');

  const today = dailySales[dailySales.length - 1];
  const weekRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
  const weekProfit = dailySales.reduce((s, d) => s + d.profit, 0);
  const weekBills = dailySales.reduce((s, d) => s + d.bills, 0);

  const paymentBreakdown = [
    { name: 'Cash', value: dailySales.reduce((s, d) => s + d.cash, 0) },
    { name: 'Card', value: dailySales.reduce((s, d) => s + d.card, 0) },
    { name: 'LankaQR', value: dailySales.reduce((s, d) => s + d.lankaqr, 0) },
  ];

  const stockByCategory = products
    .filter((p) => p.isActive)
    .reduce<Record<string, { count: number; value: number }>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = { count: 0, value: 0 };
      acc[p.category].count += p.stock;
      acc[p.category].value += p.stock * p.costPrice;
      return acc;
    }, {});

  const stockChartData = Object.entries(stockByCategory).map(([name, data]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '...' : name,
    units: data.count,
    value: data.value,
  }));

  const tabs = [
    { id: 'sales' as const, label: 'Daily Sales' },
    { id: 'profit' as const, label: 'Profit' },
    { id: 'stock' as const, label: 'Stock Reports' },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Daily sales, profit analysis & stock reports"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={formatLKR(today.revenue)}
          subtitle={`${today.bills} bills`}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Today's Profit"
          value={formatLKR(today.profit)}
          subtitle={`${((today.profit / today.revenue) * 100).toFixed(1)}% margin`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Week Revenue"
          value={formatLKR(weekRevenue)}
          subtitle={`${weekBills} total bills`}
          icon={<Receipt className="h-6 w-6" />}
          color="slate"
        />
        <StatCard
          title="Week Profit"
          value={formatLKR(weekProfit)}
          subtitle={`${((weekProfit / weekRevenue) * 100).toFixed(1)}% margin`}
          icon={<Package className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-semibold">Daily Sales - Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatLKR(value)} />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bills" fill="#3b82f6" name="Bills" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 font-semibold">Payment Method Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatLKR(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold">Daily Sales Detail</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Date</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Bills</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Revenue</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Cash</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Card</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...dailySales].reverse().map((d) => (
                    <tr key={d.date} className="hover:bg-slate-50">
                      <td className="px-4 py-2">{d.date}</td>
                      <td className="px-4 py-2 text-right">{d.bills}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatLKR(d.revenue)}</td>
                      <td className="px-4 py-2 text-right text-slate-500">{formatLKR(d.cash)}</td>
                      <td className="px-4 py-2 text-right text-slate-500">{formatLKR(d.card)}</td>
                      <td className="px-4 py-2 text-right text-slate-500">{formatLKR(d.lankaqr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {bills.length > 0 && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold">Today's Bills (Live)</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Bill No</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Cashier</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Items</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600">Total</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Payment</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs">{b.billNo}</td>
                      <td className="px-4 py-2">{b.cashierName}</td>
                      <td className="px-4 py-2 text-right">{b.items.length}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatLKR(b.total)}</td>
                      <td className="px-4 py-2 capitalize">{b.paymentMethod}</td>
                      <td className="px-4 py-2 text-slate-500">{new Date(b.createdAt).toLocaleTimeString('en-LK')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-semibold">Profit Trend - Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatLKR(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold">Profit Analysis by Day</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Date</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Revenue</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Profit</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Margin %</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Avg Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...dailySales].reverse().map((d) => (
                  <tr key={d.date} className="hover:bg-slate-50">
                    <td className="px-4 py-2">{d.date}</td>
                    <td className="px-4 py-2 text-right">{formatLKR(d.revenue)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-600">{formatLKR(d.profit)}</td>
                    <td className="px-4 py-2 text-right">{((d.profit / d.revenue) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-slate-500">{formatLKR(d.revenue / d.bills)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td className="px-4 py-2">Week Total</td>
                  <td className="px-4 py-2 text-right">{formatLKR(weekRevenue)}</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatLKR(weekProfit)}</td>
                  <td className="px-4 py-2 text-right">{((weekProfit / weekRevenue) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right text-slate-500">{formatLKR(weekRevenue / weekBills)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-semibold">Stock by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="units" fill="#22c55e" name="Units" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold">Stock Value by Category</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Category</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Total Units</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Stock Value</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(stockByCategory).map(([cat, data]) => (
                  <tr key={cat} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{cat}</td>
                    <td className="px-4 py-2 text-right">{data.count}</td>
                    <td className="px-4 py-2 text-right">{formatLKR(data.value)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {products.filter((p) => p.category === cat && p.isActive).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

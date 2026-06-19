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
import { PageHeader, StatCard, formatLKR, DataTable, Table, TableHead, TableBody, TableFoot, TableRow, TableTh, TableTd } from '../components/ui';
import { getEmptyDailySale } from '../lib/appStorage';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444'];

function marginPercent(profit: number, revenue: number): string {
  if (revenue <= 0) return '0.0';
  return ((profit / revenue) * 100).toFixed(1);
}

export function ReportsPage() {
  const { dailySales, products, bills } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'profit' | 'stock'>('sales');

  const todayDate = new Date().toISOString().slice(0, 10);
  const today =
    dailySales.find((d) => d.date === todayDate) ??
    (dailySales.length > 0 ? dailySales[dailySales.length - 1] : getEmptyDailySale(todayDate));
  const weekRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
  const weekProfit = dailySales.reduce((s, d) => s + d.profit, 0);
  const weekBills = dailySales.reduce((s, d) => s + d.bills, 0);

  const paymentBreakdown = [
    { name: 'Cash', value: dailySales.reduce((s, d) => s + d.cash, 0) },
    { name: 'Card', value: dailySales.reduce((s, d) => s + d.card, 0) },
    { name: 'LankaQR', value: dailySales.reduce((s, d) => s + d.lankaqr, 0) },
  ];
  const paymentTotal = paymentBreakdown.reduce((sum, item) => sum + item.value, 0);
  const paymentChartData = paymentBreakdown.filter((item) => item.value > 0);

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
          subtitle={`${marginPercent(today.profit, today.revenue)}% margin`}
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
          subtitle={`${marginPercent(weekProfit, weekRevenue)}% margin`}
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
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-300'
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
              {paymentTotal > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={paymentChartData.length > 1 ? 2 : 0}
                      >
                        {paymentChartData.map((entry) => {
                          const colorIndex = paymentBreakdown.findIndex((item) => item.name === entry.name);
                          return (
                            <Cell key={entry.name} fill={COLORS[colorIndex % COLORS.length]} />
                          );
                        })}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatLKR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-2 border-t border-slate-100 pt-4">
                    {paymentBreakdown.map((item, i) => {
                      const percent = paymentTotal > 0 ? ((item.value / paymentTotal) * 100).toFixed(0) : '0';
                      return (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-700">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            {item.name}
                          </span>
                          <span className="text-slate-600">
                            {formatLKR(item.value)} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="py-16 text-center text-sm text-slate-500">No payment data for this period</p>
              )}
            </div>

            <DataTable title="Daily Sales Detail">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh>Date</TableTh>
                    <TableTh align="right">Bills</TableTh>
                    <TableTh align="right">Revenue</TableTh>
                    <TableTh align="right">Cash</TableTh>
                    <TableTh align="right">Card</TableTh>
                    <TableTh align="right">QR</TableTh>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...dailySales].reverse().map((d) => (
                    <TableRow key={d.date}>
                      <TableTd className="font-medium">{d.date}</TableTd>
                      <TableTd align="right">{d.bills}</TableTd>
                      <TableTd align="right" className="font-semibold text-slate-900">{formatLKR(d.revenue)}</TableTd>
                      <TableTd align="right" className="text-slate-500">{formatLKR(d.cash)}</TableTd>
                      <TableTd align="right" className="text-slate-500">{formatLKR(d.card)}</TableTd>
                      <TableTd align="right" className="text-slate-500">{formatLKR(d.lankaqr)}</TableTd>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          </div>

          {bills.length > 0 && (
            <DataTable title="Today's Bills (Live)">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh>Bill No</TableTh>
                    <TableTh>Cashier</TableTh>
                    <TableTh align="right">Items</TableTh>
                    <TableTh align="right">Total</TableTh>
                    <TableTh>Payment</TableTh>
                    <TableTh>Time</TableTh>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map((b) => (
                    <TableRow key={b.id}>
                      <TableTd className="font-mono text-xs">{b.billNo}</TableTd>
                      <TableTd>{b.cashierName}</TableTd>
                      <TableTd align="right">{b.items.length}</TableTd>
                      <TableTd align="right" className="font-semibold text-emerald-700">{formatLKR(b.total)}</TableTd>
                      <TableTd className="capitalize">{b.paymentMethod}</TableTd>
                      <TableTd className="text-slate-500">{new Date(b.createdAt).toLocaleTimeString('en-LK')}</TableTd>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
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

          <DataTable title="Profit Analysis by Day">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Date</TableTh>
                  <TableTh align="right">Revenue</TableTh>
                  <TableTh align="right">Profit</TableTh>
                  <TableTh align="right">Margin %</TableTh>
                  <TableTh align="right">Avg Bill</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...dailySales].reverse().map((d) => (
                  <TableRow key={d.date}>
                    <TableTd className="font-medium">{d.date}</TableTd>
                    <TableTd align="right">{formatLKR(d.revenue)}</TableTd>
                    <TableTd align="right" className="font-medium text-emerald-600">{formatLKR(d.profit)}</TableTd>
                    <TableTd align="right">{marginPercent(d.profit, d.revenue)}%</TableTd>
                    <TableTd align="right" className="text-slate-500">
                      {formatLKR(d.bills > 0 ? d.revenue / d.bills : 0)}
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
              <TableFoot>
                <TableRow>
                  <TableTd>Week Total</TableTd>
                  <TableTd align="right">{formatLKR(weekRevenue)}</TableTd>
                  <TableTd align="right" className="text-emerald-700">{formatLKR(weekProfit)}</TableTd>
                  <TableTd align="right">{marginPercent(weekProfit, weekRevenue)}%</TableTd>
                  <TableTd align="right" className="text-slate-500">
                    {formatLKR(weekBills > 0 ? weekRevenue / weekBills : 0)}
                  </TableTd>
                </TableRow>
              </TableFoot>
            </Table>
          </DataTable>
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

          <DataTable title="Stock Value by Category">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Category</TableTh>
                  <TableTh align="right">Total Units</TableTh>
                  <TableTh align="right">Stock Value</TableTh>
                  <TableTh align="right">Products</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(stockByCategory).map(([cat, data]) => (
                  <TableRow key={cat}>
                    <TableTd className="font-medium text-slate-900">{cat}</TableTd>
                    <TableTd align="right">{data.count}</TableTd>
                    <TableTd align="right" className="font-semibold">{formatLKR(data.value)}</TableTd>
                    <TableTd align="right" className="text-slate-500">
                      {products.filter((p) => p.category === cat && p.isActive).length}
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </div>
      )}
    </div>
  );
}

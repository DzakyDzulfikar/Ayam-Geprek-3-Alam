import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/ThemeContext";
import API from "../services/api";

export function DashboardMain() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    todays_portions: 0,
    low_stock_count: 0,
    top_menu: 'Ayam Geprek Original',
    top_menu_sold: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topMenuData, setTopMenuData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('dashboard-summary/');
      const data = response.data;
      setMetrics({
        total_revenue: data.total_revenue,
        todays_portions: data.todays_portions,
        low_stock_count: data.low_stock_count,
        top_menu: data.top_menu,
        top_menu_sold: data.top_menu_sold
      });
      setSalesData(data.sales_data);
      setRecentTransactions(data.recent_transactions);
      setTopMenuData(data.top_menu_data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Operasional
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selamat datang di sistem AI Ayam Geprek 3 Alam
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pendapatan */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Total Pendapatan
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(metrics.total_revenue)}
              </h2>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Akumulasi real-time</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-500" />
            </div>
          </div>
        </div>

        {/* Penjualan Hari Ini */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Penjualan Hari Ini
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {metrics.todays_portions} Porsi
              </h2>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Hari ini</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </div>

        {/* Menu Terlaris */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Menu Terlaris
              </p>
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white mb-2 w-max max-w-[150px] truncate"
                title={metrics.top_menu}
              >
                {metrics.top_menu}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {metrics.top_menu_sold} porsi terjual
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        {/* Status Stok */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Status Stok
              </p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {metrics.low_stock_count} Item Menipis
              </h3>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Bahan baku menipis</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Tren Penjualan Mingguan
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                className="opacity-50 dark:opacity-20"
              />
              <XAxis
                dataKey="day"
                stroke="#9ca3af"
                tick={{ dy: 15, className: "dark:fill-gray-400" }}
                height={50}
              />
              <YAxis
                stroke="#9ca3af"
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1).replace('.0', '')}jt` : (value >= 1000 ? `${(value / 1000).toFixed(0)}rb` : value)}
                tick={{ className: "dark:fill-gray-400" }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "#f97316" }}
              />
              <Line
                type="monotone"
                dataKey="penjualan"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: "#f97316", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Menu Terpopuler
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={topMenuData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                className="opacity-50 dark:opacity-20"
              />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                interval={0}
                height={50}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const words = payload.value.split(" ");
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={20}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize={10}
                        className="dark:fill-gray-400"
                      >
                        <tspan x="0" dy="0">
                          {words.slice(0, 2).join(" ")}
                        </tspan>
                        {words.length > 2 && (
                          <tspan x="0" dy="14">
                            {words.slice(2).join(" ")}
                          </tspan>
                        )}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ className: "dark:fill-gray-400" }}
              />
              <Tooltip
                cursor={{ fill: theme === "dark" ? "#374151" : "#f3f4f6" }}
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "#f97316" }}
              />
              <Bar dataKey="sold" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Transaksi Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Menu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-400">
                    {transaction.menu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-400">
                    {transaction.qty}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300 font-medium">
                    {formatCurrency(transaction.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-500">
                    {transaction.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

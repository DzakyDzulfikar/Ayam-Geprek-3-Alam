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
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
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
  const [hoveredBarIndex, setHoveredBarIndex] = useState(-1);
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    todays_portions: 0,
    low_stock_count: 0,
    warning_stock_count: 0,
    safe_stock_count: 0,
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
        warning_stock_count: data.warning_stock_count,
        safe_stock_count: data.safe_stock_count,
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

  const CustomSalesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-colors">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hari: {data.day}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Omzet: {formatCurrency(data.penjualan)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-colors">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{data.name}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Terjual: {data.sold} Porsi</span>
          </div>
        </div>
      );
    }
    return null;
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
        <p className="text-gray-650 dark:text-gray-400">
          Selamat datang di sistem AI Ayam Geprek 3 Alam
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pendapatan Hari Ini */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Total Pendapatan Hari Ini
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(metrics.total_revenue)}
              </h2>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Hari ini</span>
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
                Menu Terlaris (Semua Waktu)
              </p>
              <h3
                className="text-lg font-bold text-gray-900 dark:text-white mb-2 w-max max-w-[150px] truncate"
                title={metrics.top_menu}
              >
                {metrics.top_menu}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {metrics.top_menu_sold} porsi terjual
              </p>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Semua waktu</span>
              </div>
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
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  🔴 {metrics.low_stock_count} Menipis
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">
                  🟡 {metrics.warning_stock_count} Peringatan
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                  🟢 {metrics.safe_stock_count} Aman
                </span>
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 to-amber-500"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Tren Penjualan Mingguan (Omzet)
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <defs>
                <linearGradient id="colorDashboardSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
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
                content={<CustomSalesTooltip />} 
                allowEscapeViewBox={true} 
                offset={20}
                transitionDuration={200}
              />
              <Area
                type="monotone"
                dataKey="penjualan"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorDashboardSales)"
                dot={{ fill: "#ffffff", stroke: "#f97316", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, strokeWidth: 0, fill: "#f97316" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 to-amber-500"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Menu Terpopuler (Semua Waktu)
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={topMenuData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <defs>
                <linearGradient id="colorDashboardBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.65}/>
                </linearGradient>
              </defs>
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
                content={<CustomBarTooltip />} 
                cursor={{ fill: theme === "dark" ? "#374151" : "#f3f4f6", opacity: 0.3 }} 
                allowEscapeViewBox={true} 
                offset={20}
                transitionDuration={200}
              />
              <Bar 
                dataKey="sold" 
                fill="url(#colorDashboardBar)" 
                radius={[8, 8, 0, 0]}
                onMouseEnter={(_, index) => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(-1)}
              >
                {topMenuData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    style={{
                      opacity: hoveredBarIndex === -1 || hoveredBarIndex === index ? 1 : 0.65,
                      transition: 'opacity 0.2s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Transaksi Terbaru
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40">
            5 Transaksi Terakhir
          </span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Menu Pesanan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kasir
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jumlah Porsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Bayar
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {transaction.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs sm:max-w-md">
                      {transaction.menu ? transaction.menu.split(', ').map((item, idx) => {
                        const parts = item.match(/^(\d+)x\s+(.+)$/);
                        if (parts) {
                          const [_, qty, name] = parts;
                          return (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-850 dark:bg-orange-950/20 dark:text-orange-300 border border-orange-200 dark:border-orange-900/30 shadow-sm transition-transform hover:scale-105 duration-200">
                              <span className="bg-orange-200 dark:bg-orange-800/80 text-orange-950 dark:text-orange-100 px-1.5 py-0.5 rounded text-[10px] font-black">
                                {qty}x
                              </span>
                              {name}
                            </span>
                          );
                        }
                        return (
                          <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                            {item}
                          </span>
                        );
                      }) : (
                        <span className="text-gray-400 italic">Tidak ada item</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                      👤 {transaction.kasir || 'Karyawan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-400 font-medium">
                    <span className="inline-flex items-center gap-1">
                      🍽️ {transaction.qty} porsi
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-orange-600 dark:text-orange-500 font-bold text-base">
                    {formatCurrency(transaction.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-medium">
                    ⏱️ {transaction.time} WIB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Selesai
                    </span>
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

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';

export function MenuAnalytics() {
  const { theme } = useTheme();
  const [dateFilter, setDateFilter] = useState('7days');
  const [sortBy, setSortBy] = useState('revenue');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(-1);
  const [activePieIndex, setActivePieIndex] = useState(-1);

  useEffect(() => {
    fetchMenuAnalytics();
  }, [dateFilter]);

  const fetchMenuAnalytics = async () => {
    try {
      setLoading(true);
      const response = await API.get('menu-analytics/', {
        params: { filter: dateFilter }
      });
      setMenuData(response.data);
    } catch (err) {
      console.error('Error fetching menu analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderIndex = (name) => {
    if (!name) return 5;
    const lower = name.toLowerCase();
    if (lower.includes('geprek') || lower.includes('paket')) return 0;
    if (lower.includes('sayap')) return 1;
    if (lower.includes('paha bawah')) return 2;
    if (lower.includes('dada')) return 3;
    if (lower.includes('paha atas')) return 4;
    return 5;
  };

  // Pie chart data sorted by custom position sequence: Geprek (top middle), Sayap (top right), Paha Bawah (bottom right), Dada (bottom left), Paha Atas (top left)
  const pieData = [...menuData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .sort((a, b) => getOrderIndex(a.name) - getOrderIndex(b.name))
    .map((item) => ({
      name: item.name,
      value: item.revenue,
    }));

  const activeSlice = activePieIndex !== -1 ? pieData[activePieIndex] : null;
  const totalTop5Revenue = pieData.reduce((sum, item) => sum + item.value, 0);
  const geprekRatio = totalTop5Revenue > 0 ? (pieData[0]?.value / totalTop5Revenue) : 0.4;
  const geprekAngle = geprekRatio * 360;
  const startAngle = 90 + (geprekAngle / 2);
  const endAngle = startAngle - 360;

  const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

  const getShortName = (name) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    if (lower.includes('paha atas')) return 'Paha Atas';
    if (lower.includes('paha bawah')) return 'Paha Bawah';
    if (lower.includes('sayap')) return 'Sayap';
    if (lower.includes('dada')) return 'Dada';
    if (lower.includes('original')) return 'Original';
    const words = name.split(' ');
    return words[2] || words[0] || name;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-colors">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium">Revenue:</span>
              <span className="text-orange-600 dark:text-orange-500 font-bold">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium">Terjual:</span>
              <span className="text-gray-900 dark:text-white font-bold">{data.sold} Porsi</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium">Margin:</span>
              <span className="text-gray-900 dark:text-white font-bold">{data.margin}%</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium">Pertumbuhan:</span>
              <span className={`font-bold ${data.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-650 dark:text-red-400'}`}>
                {data.growth >= 0 ? `+${data.growth}%` : `${data.growth}%`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.value / (totalRevenue || 1)) * 100).toFixed(0);
      return (
        <div className="bg-white dark:bg-gray-900 p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl transition-all pointer-events-none z-50">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{getShortName(data.name)}</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Revenue:</span>
              <span className="text-orange-600 dark:text-orange-500 font-bold">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Kontribusi:</span>
              <span className="text-gray-900 dark:text-white font-bold">{percent}% Omzet</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const sortedData = [...menuData].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'sold') return b.sold - a.sold;
    if (sortBy === 'growth') return b.growth - a.growth;
    if (sortBy === 'margin') return b.margin - a.margin;
    return 0;
  });

  const totalRevenue = menuData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSold = menuData.reduce((sum, item) => sum + item.sold, 0);
  const avgGrowth = menuData.length > 0 ? (menuData.reduce((sum, item) => sum + item.growth, 0) / menuData.length) : 0;


  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            Analitik Menu
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Analisis performa mendalam dan tren penjualan tiap menu</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 font-medium text-sm transition-colors">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Filter Data:</span>
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="thismonth">Bulan Ini</option>
            <option value="lastmonth">Bulan Lalu</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="revenue">Urutkan: Revenue Tertinggi</option>
            <option value="sold">Urutkan: Penjualan Terbanyak</option>
            <option value="growth">Urutkan: Pertumbuhan Tertinggi</option>
            <option value="margin">Urutkan: Margin Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-orange-400 to-transparent w-full h-full"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatCurrency(totalRevenue)}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data filter aktif: 7 hari terakhir</p>
              </div>
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center border border-orange-100 dark:border-orange-900/50 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-blue-400 to-transparent w-full h-full"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Terjual</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalSold} Porsi</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Akumulasi semua varian menu</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-green-400 to-transparent w-full h-full"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Rata-rata Pertumbuhan</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{avgGrowth.toFixed(1)}%</h2>
                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded w-max text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Tren keseluruhan: Positif</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-900/50 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
            Top 5 Revenue per Menu
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Berdasarkan filter</span>
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sortedData.slice(0, 5)} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorMenuRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="opacity-50 dark:opacity-20" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 12, className: 'dark:fill-gray-400'}} angle={-25} textAnchor="end" height={80} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" tick={{ className: 'dark:fill-gray-400' }} tickFormatter={(value) => `${value / 1000}k`} axisLine={false} tickLine={false} />
              <Tooltip 
                content={<CustomBarTooltip />} 
                cursor={{ fill: theme === 'dark' ? '#374151' : '#fef08a', opacity: theme === 'dark' ? 0.3 : 0.4 }} 
                allowEscapeViewBox={true} 
                offset={20}
                transitionDuration={200} 
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#colorMenuRevenue)" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
                onMouseEnter={(_, index) => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(-1)}
              >
                {sortedData.slice(0, 5).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    style={{
                      opacity: hoveredBarIndex === -1 || hoveredBarIndex === index ? 1 : 0.45,
                      transition: 'opacity 0.2s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Distribusi Proporsi Penjualan</h3>
          
          <ResponsiveContainer width="100%" height={320} style={{ overflow: 'visible' }}>
            <PieChart margin={{ top: 20, right: 60, left: 60, bottom: 20 }} style={{ overflow: 'visible' }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${getShortName(name)}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={95}
                innerRadius={65}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
                stroke="none"
                startAngle={startAngle}
                endAngle={endAngle}
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(-1)}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    style={{
                      opacity: activePieIndex === -1 || activePieIndex === index ? 1 : 0.5,
                      transform: activePieIndex === index ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: '50% 50%',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%-1.5rem)] text-center pointer-events-none max-w-[150px] z-10">
            {activeSlice ? (
              <div>
                <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider mb-0.5">
                  {getShortName(activeSlice.name)}
                </span>
                <span className="block text-base font-black text-orange-600 dark:text-orange-500 leading-none">
                  {formatCurrency(activeSlice.value)}
                </span>
                <span className="block text-[9px] font-semibold text-gray-400 dark:text-gray-500 mt-1">
                  {((activeSlice.value / (totalRevenue || 1)) * 100).toFixed(0)}% Omzet
                </span>
              </div>
            ) : (
              <div>
                <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">Top 5</span>
                <span className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Menu</span>
                <span className="block text-[10px] text-gray-450 dark:text-gray-500 font-bold mt-1">{formatCurrency(totalTop5Revenue)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Lengkap Performa Menu</h3>
          <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm font-semibold px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-900/50">Menampilkan {sortedData.length} Varian</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 dark:bg-gray-700/50 transition-colors">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peringkat</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Menu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Volume Terjual</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Pendapatan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trend Pertumbuhan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating Tinjauan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Margin Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedData.map((menu, index) => (
                <tr key={menu.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white ring-2 ring-yellow-200 dark:ring-yellow-900 ring-offset-1' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{menu.name}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{menu.sold} Porsi</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{formatCurrency(menu.revenue)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      {menu.growth > 0 ? (
                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded w-fit border border-green-100 dark:border-green-900/50">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{menu.growth}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2.5 py-1 rounded w-fit border border-red-100 dark:border-red-900/50">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{menu.growth}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg w-fit border border-gray-100 dark:border-gray-700">
                      <span className="text-yellow-400 text-xs shadow-sm">⭐</span>
                      <span className="text-gray-900 dark:text-white font-bold text-sm">{menu.avgRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${
                          menu.margin >= 50 ? 'text-green-700 dark:text-green-400' :
                          menu.margin >= 40 ? 'text-blue-700 dark:text-blue-400' :
                          'text-orange-700 dark:text-orange-400'
                        }`}>
                          {menu.margin}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                             menu.margin >= 50 ? 'bg-green-500' :
                             menu.margin >= 40 ? 'bg-blue-500' :
                             'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(menu.margin, 100)}%` }}
                        ></div>
                      </div>
                    </div>
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

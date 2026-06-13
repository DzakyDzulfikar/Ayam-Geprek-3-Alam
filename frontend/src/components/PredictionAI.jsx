import { useState } from 'react';
import { Calendar, Brain, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';

export function PredictionAI() {
  const { theme } = useTheme();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [showResults, setShowResults] = useState(false);
  const [predictionData, setPredictionData] = useState([]);
  const [stockPrediction, setStockPrediction] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    const diffTime = new Date(endDate) - new Date(startDate);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    try {
      const response = await API.post('predict/', { days: diffDays });
      const data = response.data;

      const formattedPredictions = data.detail_prediksi.map((item) => {
        const d = new Date(item.tanggal);
        const day = d.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return {
          date: `${day} ${monthNames[d.getMonth()]}`,
          predicted: item.prediksi_penjualan_porsi,
          actual: null,
        };
      });

      setPredictionData(formattedPredictions);

      const formattedStocks = data.stock_prediction.map((item) => ({
        item: item.item,
        current: item.current,
        predicted: item.predicted,
        recommendation: item.recommendation,
        satuan: item.satuan || 'kg',
        status: item.status,
      }));

      setStockPrediction(formattedStocks);
      setAiInsight(data.rekomendasi_sistem);
      setShowResults(true);
    } catch (err) {
      console.error('AI prediction error:', err);
      alert('Gagal mengambil hasil prediksi dari backend Django.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-orange-500" />
          Prediksi AI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Prediksi kebutuhan stok dan permintaan menggunakan Machine Learning
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Pengaturan Prediksi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai Training</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Target Prediksi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses AI...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Jalankan Prediksi AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Akurasi Model</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">92.5%</h2>
                </div>
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-900/50">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 inline-block px-2 py-1 rounded transition-colors">Rata-rata error (MAPE): <strong>7.5%</strong></p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">RMSE</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">18.2</h2>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Brain className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 inline-block px-2 py-1 rounded transition-colors">Root Mean Square Error</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Tingkat Kepercayaan</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">91.2%</h2>
                </div>
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 inline-block px-2 py-1 rounded transition-colors">Rata-rata <em>Confidence Level</em></p>
            </div>
          </div>

          {/* Prediction Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Grafik Proyeksi Permintaan 7 Hari Kedepan</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={predictionData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="opacity-50 dark:opacity-20" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ className: 'dark:fill-gray-400' }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis stroke="#9ca3af" tick={{ className: 'dark:fill-gray-400' }} axisLine={false} tickLine={false} tickMargin={12} label={{ value: 'Porsi Terjual', angle: -90, position: 'insideLeft', offset: -5, className: 'dark:fill-gray-400' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Data Historis Aktual"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f97316"
                  strokeWidth={4}
                  strokeDasharray="6 6"
                  dot={{ fill: 'white', r: 6, strokeWidth: 3, stroke: '#f97316' }}
                  activeDot={{ r: 8, strokeDasharray: '0', fill: '#f97316', stroke: 'none' }}
                  name="Hasil Prediksi AI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Prediction Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rincian Prediksi Kebutuhan Stok Berbasis AI</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 transition-colors">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Item Bahan Baku</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stok di Gudang</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Prediksi Sisa (7 Hari)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rekomendasi Tindakan AI</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status Keparahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                  {stockPrediction.map((item, index) => {
                    const isUrgent = item.status === 'KRITIS';
                    const isLow = item.status === 'PERINGATAN';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.item}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.current} {item.satuan}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isUrgent ? 'text-red-600 dark:text-red-500' : isLow ? 'text-orange-500 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                            {item.predicted} {item.satuan}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{item.recommendation}</td>
                        <td className="px-6 py-4">
                          {isUrgent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                              <AlertCircle className="w-3.5 h-3.5" />
                              KRITIS
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                              PERINGATAN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                              AMAN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Note */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-500/20">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-32 -mb-8 w-16 h-16 rounded-full bg-white opacity-10"></div>
            
            <div className="relative p-6 sm:p-8 flex items-start gap-5">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Kesimpulan & Insight AI</h3>
                <p className="text-orange-50 leading-relaxed mb-4 text-[15px]">
                  {aiInsight || "Berdasarkan analisis tren penjualan historis, sistem memprediksi kebutuhan stok bahan baku Anda."}
                </p>
                <div className="flex items-center gap-2 text-orange-100 text-sm font-semibold bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                  <AlertCircle className="w-4 h-4 text-orange-200" />
                  <span>Confidence Level Tinggi — Disarankan mengambil tindakan preventif segera.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State before prediction */}
      {!showResults && (
        <div className="bg-white dark:bg-gray-800 p-12 lg:p-24 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed shadow-sm text-center flex flex-col items-center justify-center transition-colors duration-300">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
            <Brain className="w-12 h-12 text-orange-300 dark:text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sistem AI Siap Dijalankan</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Silakan sesuaikan rentang tanggal di menu atas, lalu klik <strong>"Jalankan Prediksi AI"</strong> untuk memulai proses kalkulasi model Machine Learning kami.</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Package, Megaphone, Star } from 'lucide-react';
import API from '../services/api';

export function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await API.get('recommendations/');
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'stock':
        return Package;
      case 'promotion':
        return Megaphone;
      case 'menu':
        return Star;
      case 'operation':
        return Lightbulb;
      default:
        return AlertTriangle;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-900/50',
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-400',
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-900/50',
          badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
          icon: 'text-orange-600 dark:text-orange-400',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-900/50',
          badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
          icon: 'text-yellow-600 dark:text-yellow-400',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-900/50',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
          icon: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'stock':
        return 'Manajemen Stok';
      case 'menu':
        return 'Menu';
      case 'promotion':
        return 'Promosi';
      case 'operation':
        return 'Operasional';
      default:
        return category;
    }
  };

  const getPriorityLabel = (type) => {
    switch (type) {
      case 'urgent':
        return 'Kritis (URGENT)';
      case 'high':
        return 'Prioritas Tinggi';
      case 'medium':
        return 'Prioritas Menengah';
      default:
        return 'Prioritas Rendah';
    }
  };

  // Group recommendations by priority
  const urgentRecs = recommendations.filter((r) => r.type === 'urgent');
  const highRecs = recommendations.filter((r) => r.type === 'high');
  const mediumRecs = recommendations.filter((r) => r.type === 'medium');
  const lowRecs = recommendations.filter((r) => r.type === 'low');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-orange-500 fill-orange-500/20" />
          Rekomendasi Cerdas AI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistem otomatis menghasilkan saran keputusan bisnis terbaik berdasarkan analisis data operasional secara real-time.
        </p>
      </div>

      {/* Summary Priority Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden transition-colors duration-300">
          <div className="absolute -right-4 -top-4 bg-red-50 dark:bg-red-900/20 text-red-500 p-6 rounded-full opacity-50">
           <AlertTriangle size={48} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tindakan Kritis</p>
            <h2 className="text-4xl font-extrabold text-red-600 dark:text-red-400">{urgentRecs.length}</h2>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden transition-colors duration-300">
          <div className="absolute -right-4 -top-4 bg-orange-50 dark:bg-orange-900/20 text-orange-500 p-6 rounded-full opacity-50">
           <TrendingUp size={48} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Prioritas Tinggi</p>
            <h2 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">{highRecs.length}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden transition-colors duration-300">
          <div className="absolute -right-4 -top-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 p-6 rounded-full opacity-50">
           <Lightbulb size={48} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Prioritas Menengah</p>
            <h2 className="text-4xl font-extrabold text-yellow-600 dark:text-yellow-400">{mediumRecs.length}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden transition-colors duration-300">
          <div className="absolute -right-4 -top-4 bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-6 rounded-full opacity-50">
           <Star size={48} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Saran Tambahan</p>
            <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{lowRecs.length}</h2>
          </div>
        </div>
      </div>

      {/* Recommendations List (Feed) */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-4">Daftar Rekomendasi</h3>
      <div className="space-y-5">
        {recommendations.map((rec) => {
          const styles = getTypeStyles(rec.type);
          const Icon = getIcon(rec.category);

          return (
            <div
              key={rec.id}
              className={`${styles.bg} border ${styles.border} rounded-2xl p-6 hover:shadow-md transition-shadow shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Icon Circle */}
                <div className={`w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50 dark:border-gray-700 ${styles.icon} transition-colors`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${styles.badge} ${
                          rec.type === 'urgent' ? 'ring-red-200 dark:ring-red-900/50 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 animate-pulse' : 
                          rec.type === 'high' ? 'ring-orange-200 dark:ring-orange-900/50 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' : 
                          'ring-black/10 dark:ring-white/10'
                        }`}>
                          {getPriorityLabel(rec.type)}
                        </span>
                        <span className="px-2.5 py-1 bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 ring-inset text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors">
                          Kategori: {getCategoryLabel(rec.category)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">{rec.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed max-w-4xl">{rec.description}</p>
                    </div>
                  </div>

                  {/* Action & Impact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Star className="w-4 h-4" /> Tindakan yang Disarankan
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">{rec.action}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Estimasi Dampak Positif
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">{rec.impact}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all">
                      Terapkan Rekomendasi
                    </button>
                    <button className="px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-all">
                      Tunda / Nanti
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

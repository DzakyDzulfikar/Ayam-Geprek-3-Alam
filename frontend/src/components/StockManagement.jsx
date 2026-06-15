import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import API from '../services/api';

export function StockManagement() {
  const userRole = localStorage.getItem('userRole');
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await API.get('bahanbaku/');
      const mapped = response.data.map((item) => ({
        id: item.id,
        name: item.nama_bahan,
        unit: item.satuan,
        quantity: item.stok_saat_ini !== undefined && item.stok_saat_ini !== null ? Math.round(item.stok_saat_ini) : 0,
        minStock: item.stok_minimum !== undefined && item.stok_minimum !== null ? Math.round(item.stok_minimum) : 0,
        lastUpdate: new Date(item.terakhir_diupdate).toISOString().split('T')[0],
      }));
      setStocks(mapped);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    quantity: '',
  });

  const cleanInteger = (val) => {
    if (val === '') return '';
    // Replace comma with dot to handle both decimal separators
    let normalized = val.replace(',', '.');
    // Parse as float first
    let parsedFloat = parseFloat(normalized);
    if (isNaN(parsedFloat)) return '';
    // Discard decimal part
    let parsedInt = Math.floor(parsedFloat);
    if (parsedInt < 0) parsedInt = 0;
    return parsedInt.toString();
  };

  const handleOpenModal = (stock = null) => {
    if (stock) {
      setEditingStock(stock);
      setFormData({
        name: stock.name,
        unit: stock.unit,
        quantity: stock.quantity !== undefined && stock.quantity !== null ? String(Math.round(stock.quantity)) : '',
      });
    } else {
      setEditingStock(null);
      setFormData({ name: '', unit: 'kg', quantity: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStock(null);
    setFormData({ name: '', unit: 'kg', quantity: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nama_bahan: formData.name,
      satuan: formData.unit,
      stok_saat_ini: parseInt(formData.quantity, 10) || 0,
    };

    try {
      if (editingStock) {
        await API.put(`bahanbaku/${editingStock.id}/`, payload);
      } else {
        await API.post('bahanbaku/', payload);
      }
      fetchStocks();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving stock:', err);
      alert('Gagal menyimpan data stok ke backend');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await API.delete(`bahanbaku/${id}/`);
        fetchStocks();
      } catch (err) {
        console.error('Error deleting stock:', err);
        alert('Gagal menghapus item dari backend');
      }
    }
  };

  const handleMove = async (index, direction) => {
    const newStocks = [...stocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newStocks.length) return;

    // Swap locally
    const temp = newStocks[index];
    newStocks[index] = newStocks[targetIndex];
    newStocks[targetIndex] = temp;
    
    // Update local state instantly
    setStocks(newStocks);

    try {
      // Send the new sequence of IDs to the backend
      const ids = newStocks.map(item => item.id);
      await API.post('bahanbaku/reorder/', { ids });
    } catch (err) {
      console.error('Error reordering stock:', err);
      // Revert if API call fails
      fetchStocks();
      alert('Gagal menyimpan urutan baru ke backend');
    }
  };

  const getLowStockCount = () => {
    return stocks.filter((stock) => stock.quantity < stock.minStock * 0.5).length;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Stok</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola inventori bahan baku restoran</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Stok
          </button>
        )}
      </div>

      {/* Warning Card */}
      {getLowStockCount() > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex items-center gap-4 shadow-sm transition-colors duration-300">
          <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-red-900 dark:text-red-300 font-bold">Peringatan Stok Menipis!</p>
            <p className="text-red-700 dark:text-red-400 text-sm mt-0.5">
              Terdapat <strong>{getLowStockCount()} item</strong> yang memerlukan restok segera.
            </p>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <tr>
                {userRole === 'admin' && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-20">Urutan</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Bahan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Jumlah Tersedia</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Batas Minimum</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Update Terakhir</th>
                {userRole === 'admin' && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stocks.map((stock, index) => {
                const isLow = stock.quantity < stock.minStock * 0.5;
                const isWarning = !isLow && stock.quantity < stock.minStock;
                
                let statusBadge;
                let textClass = 'text-gray-900 dark:text-white';
                
                if (isLow) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                      Menipis
                    </span>
                  );
                  textClass = 'text-red-600 dark:text-red-400';
                } else if (isWarning) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">
                      Peringatan
                    </span>
                  );
                  textClass = 'text-yellow-600 dark:text-yellow-500';
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                      Aman
                    </span>
                  );
                  textClass = 'text-green-600 dark:text-green-400';
                }

                return (
                  <tr key={stock.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                    {userRole === 'admin' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded-md transition-all ${
                              index === 0 
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 hover:scale-105'
                            }`}
                            title="Pindahkan ke Atas"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === stocks.length - 1}
                            className={`p-1 rounded-md transition-all ${
                              index === stocks.length - 1 
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 hover:scale-105'
                            }`}
                            title="Pindahkan ke Bawah"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{stock.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{stock.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${textClass}`}>
                        {stock.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{stock.minStock}</td>
                    <td className="px-6 py-4">
                      {statusBadge}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{stock.lastUpdate}</td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(stock)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent dark:hover:border-blue-800"
                            title="Edit Stok"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent dark:hover:border-red-800"
                            title="Hapus Stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingStock ? 'Perbarui Data Stok' : 'Tambah Stok Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Bahan Baku</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transiton-shadow"
                  placeholder="Contoh: Bawang Merah"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (l)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="pack">Pack / Bungkus</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jumlah Tersedia</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: cleanInteger(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3 rounded-lg text-xs text-orange-800 dark:text-orange-350 leading-normal flex items-start gap-2">
                <span>💡</span>
                <span>Batas stok minimum dihitung secara otomatis oleh AI berdasarkan rata-rata penggunaan harian untuk menjaga efisiensi inventori Anda.</span>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors shadow-sm"
                >
                  {editingStock ? 'Simpan Perubahan' : 'Tambah Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

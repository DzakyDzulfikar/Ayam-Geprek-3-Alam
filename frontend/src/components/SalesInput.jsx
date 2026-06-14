import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import API from '../services/api';

export function SalesInput() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState(null); // 'loading', 'success', 'error', null
  const [checkoutDetails, setCheckoutDetails] = useState({ total: 0, message: '' });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await API.get('menu/');
      const mapped = response.data.map(item => ({
        id: item.id,
        name: item.nama_menu,
        price: parseFloat(item.harga)
      }));
      setMenuItems(mapped);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;

    const menu = menuItems.find((item) => item.name === selectedMenu);
    if (!menu) return;

    const existingItem = cart.find((item) => item.menu === selectedMenu);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menu === selectedMenu ? { ...item, qty: item.qty + quantity } : item
        )
      );
    } else {
      setCart([...cart, { menu: menu.name, price: menu.price, qty: quantity }]);
    }

    setSelectedMenu('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (menu) => {
    setCart(cart.filter((item) => item.menu !== menu));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const totalOrder = calculateTotal();
    setCheckoutDetails({ total: totalOrder, message: '' });
    setCheckoutStatus('loading');
    
    const details = cart.map(item => {
      const matched = menuItems.find(m => m.name === item.menu);
      return {
        menu: matched.id,
        kuantitas: item.qty
      };
    });

    try {
      const response = await API.post('transaksi/', {
        details: details
      });
      if (response.status === 201) {
        setCheckoutStatus('success');
        setCart([]);
      } else {
        setCheckoutDetails({ total: totalOrder, message: 'Gagal memproses transaksi.' });
        setCheckoutStatus('error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errMsg = err.response?.data?.error || 'Gagal menyimpan transaksi ke backend';
      setCheckoutDetails({ total: totalOrder, message: errMsg });
      setCheckoutStatus('error');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Input Penjualan</h1>
        <p className="text-gray-600 dark:text-gray-400">Tambahkan transaksi penjualan baru dengan cepat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            Tambah Item
          </h3>

          <div className="space-y-4">
            {/* Menu Selection */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Pilih Menu</label>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="">-- Pilih Menu --</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Jumlah</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedMenu}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-5 h-5" />
              Tambah ke Keranjang
            </button>
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Keranjang Belanja</h3>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center h-full">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto flex-1 pr-2">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.menu}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.qty}x @ {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price * item.qty)}</p>
                      <button
                        onClick={() => handleRemoveFromCart(item.menu)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-1.5 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 mt-auto transition-colors">
                <div className="flex justify-between items-center text-sm font-medium">
                  <p className="text-gray-600 dark:text-gray-400">Total Item</p>
                  <p className="text-gray-900 dark:text-white">{cart.reduce((sum, item) => sum + item.qty, 0)}</p>
                </div>
                <div className="flex justify-between items-center bg-orange-50 dark:bg-gray-900/50 p-3 rounded-lg border border-orange-100 dark:border-gray-700 transition-colors">
                  <p className="text-gray-900 dark:text-white font-bold">Total Pembayaran</p>
                  <h2 className="text-xl font-bold text-orange-600 dark:text-orange-500">{formatCurrency(calculateTotal())}</h2>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 font-bold text-white py-3.5 rounded-lg shadow-sm transition-colors mt-2"
                >
                  Proses Transaksi Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Receipt Modal Overlay */}
      {checkoutStatus && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center transition-colors">
            
            {checkoutStatus === 'loading' && (
              <div className="py-6 flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Memproses Transaksi</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Menyimpan data penjualan ke database...</p>
              </div>
            )}

            {checkoutStatus === 'success' && (
              <div className="w-full">
                {/* Animated checkmark circle */}
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100 dark:border-green-900/40 relative">
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping"></div>
                  <svg className="w-10 h-10 animate-in zoom-in-75 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Transaksi Berhasil!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Stok bahan baku telah otomatis disesuaikan</p>
                
                {/* Receipt Card */}
                <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-xl p-4 mb-6 text-left space-y-2.5 font-sans shadow-inner text-sm">
                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <span>Waktu</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleTimeString('id-ID')} WIB</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <span>Status</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Lunas</span>
                  </div>
                  <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700 my-2"></div>
                  <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-bold">
                    <span>Total Bayar</span>
                    <span className="text-orange-600 dark:text-orange-500 text-base">{formatCurrency(checkoutDetails.total)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setCheckoutStatus(null)}
                  className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white py-3 rounded-lg font-bold transition-all shadow-md shadow-green-600/10"
                >
                  Tutup
                </button>
              </div>
            )}

            {checkoutStatus === 'error' && (
              <div className="w-full">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-900/40 relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping"></div>
                  <svg className="w-10 h-10 animate-in zoom-in-75 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaksi Gagal</h3>
                <p className="text-red-500 dark:text-red-400 text-sm mb-6 px-2 break-words leading-normal">{checkoutDetails.message}</p>
                
                <button
                  onClick={() => setCheckoutStatus(null)}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-3 rounded-lg font-bold transition-all shadow-md"
                >
                  Coba Lagi
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}

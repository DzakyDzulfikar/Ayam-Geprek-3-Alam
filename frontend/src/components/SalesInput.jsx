import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import API from '../services/api';

export function SalesInput() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

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
        alert(`Transaksi berhasil! Total: ${formatCurrency(calculateTotal())}`);
        setCart([]);
      } else {
        alert('Gagal memproses transaksi.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.error || 'Gagal menyimpan transaksi ke backend');
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
    </div>
  );
}

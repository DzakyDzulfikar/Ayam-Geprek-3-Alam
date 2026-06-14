import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' atau 'karyawan'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password wajib diisi!');
      return;
    }

    // Reset error sebelum mencoba
    setError('');

    try {
      const response = await API.post('login/', { username, password });
      const data = response.data;
      if (data.status === 'success') {
        onLogin({ username: data.user.username, role: data.user.role });
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Tidak dapat terhubung ke server backend!';
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto transition-colors duration-300">
      {/* Container utama login - fixed size & perfectly centered */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col justify-center my-auto relative z-10 transition-colors">
        
        {/* Toggle Theme Button (Absolute Top Right of Container) */}
        <button 
          type="button"
          onClick={toggleTheme}
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-600 transition-all focus:outline-none"
          title={`Beralih ke ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 mt-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full shadow-xl border-4 border-orange-500 overflow-hidden bg-white px-1.5 py-1.5">
            <img src="/logo.png" alt="Logo 3 Alam" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5">Ayam Geprek 3 Alam</h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600">
            Sistem AI Operasional Bisnis
          </p>
        </div>

        {/* Role Selector Tabs (Animated Slider) */}
        <div className="w-full bg-[#E5E7EB]/70 dark:bg-gray-900/50 p-1 rounded-xl flex relative mb-6">
          
          {/* Animated Background Sliding Indicator */}
          <div 
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 ring-1 ring-black/[0.03] transition-transform duration-300 ease-in-out ${
              activeRole === 'karyawan' ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'
            }`}
          />

          {/* Admin Button */}
          <button
            type="button"
            onClick={() => { setActiveRole('admin'); setError(''); setUsername(''); setPassword(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg z-10 transition-colors duration-300 ${
              activeRole === 'admin' 
                ? 'text-[#F97316] dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Admin
          </button>

          {/* Karyawan Button */}
          <button
            type="button"
            onClick={() => { setActiveRole('karyawan'); setError(''); setUsername(''); setPassword(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg z-10 transition-colors duration-300 ${
              activeRole === 'karyawan' 
                ? 'text-[#F97316] dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Karyawan
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4 flex flex-col">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 block">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 dark:text-red-400 text-[10px] sm:text-xs font-medium text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-orange-500 mt-2 active:scale-[0.98]"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;

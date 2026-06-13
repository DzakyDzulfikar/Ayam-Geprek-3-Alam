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
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Container utama login - fixed size & perfectly centered */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-center m-auto relative z-10 transition-colors">
        
        {/* Toggle Theme Button (Absolute Top Right of Container) */}
        <button 
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-600 transition-all focus:outline-none"
          title={`Beralih ke ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 mb-6 rounded-full shadow-xl border-4 border-orange-500 overflow-hidden bg-white px-2 py-2">
            <img src="/logo.png" alt="Logo 3 Alam" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Ayam Geprek 3 Alam</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600">
            Sistem AI Operasional Bisnis
          </p>
        </div>

        {/* Role Selector Tabs (Animated Slider) */}
        <div className="w-full bg-[#E5E7EB]/70 dark:bg-gray-900/50 p-1.5 rounded-xl flex relative mb-8">
          
          {/* Animated Background Sliding Indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 ring-1 ring-black/[0.03] transition-transform duration-300 ease-in-out ${
              activeRole === 'karyawan' ? 'translate-x-[calc(100%+0.375rem)]' : 'translate-x-0'
            }`}
          />

          {/* Admin Button */}
          <button
            type="button"
            onClick={() => { setActiveRole('admin'); setError(''); setUsername(''); setPassword(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-300 ${
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
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-300 ${
              activeRole === 'karyawan' 
                ? 'text-[#F97316] dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Karyawan
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-5 flex flex-col">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs font-medium text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-orange-500 mt-2 active:scale-[0.98]"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;

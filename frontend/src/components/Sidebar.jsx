import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Brain,
  Lightbulb,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Sidebar({ activePage, onNavigate, onLogout, userRole }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'karyawan'] },
    { id: 'sales', label: 'Input Penjualan', icon: ShoppingCart, roles: ['karyawan'] },
    { id: 'stock', label: 'Manajemen Stok', icon: Package, roles: ['admin', 'karyawan'] },
    { id: 'prediction', label: 'Prediksi AI', icon: Brain, roles: ['admin'] },
    { id: 'recommendations', label: 'Rekomendasi', icon: Lightbulb, roles: ['admin'] },
    { id: 'analytics', label: 'Analitik Menu', icon: BarChart3, roles: ['admin'] },
    { id: 'reports', label: 'Laporan', icon: FileText, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 bg-white flex-shrink-0 p-1">
            <img src="/logo.png" alt="Logo 3 Alam" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold text-lg">3 Alam</h2>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0 lg:static lg:inset-auto lg:h-screen ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="h-28 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm shadow-orange-500/20 mr-3 bg-white flex-shrink-0 p-1">
            <img src="/logo.png" alt="Logo 3 Alam" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#F97316] dark:text-orange-400 leading-tight">3 Alam</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">AI Dashboard</p>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-5 bg-orange-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 shrink-0 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">
              Login sebagai:
            </p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-500 capitalize">
              {userRole}
            </p>
          </div>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
            title={`Beralih ke ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col w-full p-4 space-y-2 overflow-y-auto flex-grow">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500 !text-white opacity-100 shadow-md shadow-orange-500/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* User Info */}
            <div className="px-4 py-3 bg-orange-50 dark:bg-gray-800 border-b border-orange-100 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-xs">Login sebagai:</p>
              <p className="text-orange-600 dark:text-orange-500 capitalize font-medium">{userRole}</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col w-full p-4 space-y-2 overflow-y-auto flex-grow">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500 !text-white opacity-100 shadow-md shadow-orange-500/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

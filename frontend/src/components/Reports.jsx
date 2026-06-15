import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, Pizza } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import API from '../services/api';

export function Reports() {
  const { theme } = useTheme();
  
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return getLocalDateString(d);
  };

  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(getPastDateString(6));
  const [endDate, setEndDate] = useState(getPastDateString(0));
  const [weeklyData, setWeeklyData] = useState([]);
  const [menuBreakdown, setMenuBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    if (reportType === 'daily') {
      const todayStr = getLocalDateString(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (reportType === 'weekly') {
      setStartDate(getPastDateString(6));
      setEndDate(getPastDateString(0));
    } else if (reportType === 'monthly') {
      setStartDate(getPastDateString(29));
      setEndDate(getPastDateString(0));
    } else if (reportType === 'yearly') {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  }, [reportType]);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await API.get('report-data/', {
        params: { start_date: startDate, end_date: endDate }
      });
      setWeeklyData(response.data.daily_stats || []);
      setMenuBreakdown(response.data.menu_breakdown || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomReportRevenueTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const avgValue = data.transactions > 0 ? (data.revenue / data.transactions) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-colors">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Hari: {data.day}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-gray-900 dark:text-white font-medium">Omzet:</span>
              </div>
              <span className="text-orange-600 dark:text-orange-500 font-bold">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium pl-4">Transaksi:</span>
              <span className="text-gray-900 dark:text-white font-bold">{data.transactions} Trx</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium pl-4">Rerata/Trx:</span>
              <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(avgValue)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomReportSalesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const avgValue = data.transactions > 0 ? (data.sales / data.transactions) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-colors">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Hari: {data.day}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-900 dark:text-white font-medium">Penjualan:</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{data.sales} Porsi</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium pl-4">Transaksi:</span>
              <span className="text-gray-900 dark:text-white font-bold">{data.transactions} Trx</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-550 dark:text-gray-400 font-medium pl-4">Rerata Porsi/Trx:</span>
              <span className="text-gray-900 dark:text-white font-bold">{avgValue.toFixed(1)} Porsi</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = weeklyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSales = weeklyData.reduce((sum, item) => sum + item.sales, 0);
  const totalTransactions = weeklyData.reduce((sum, item) => sum + item.transactions, 0);
  const avgTransaction = totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Penjualan - Ayam Geprek 3 Alam", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 22);
    
    const tableColumn = ["Tanggal/Hari", "Volume (Porsi)", "Nilai Pendapatan", "Jml Transaksi", "Rata-rata/Trx"];
    const tableRows = [];
    
    weeklyData.forEach(d => {
      const rowData = [
        d.day,
        d.sales.toString(),
        formatCurrency(d.revenue),
        d.transactions.toString(),
        formatCurrency(d.transactions > 0 ? d.revenue / d.transactions : 0)
      ];
      tableRows.push(rowData);
    });
    
    tableRows.push([
      "TOTAL KESELURUHAN",
      totalSales.toString(),
      formatCurrency(totalRevenue),
      totalTransactions.toString(),
      formatCurrency(avgTransaction)
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [234, 88, 12] }
    });
    
    if (menuBreakdown && menuBreakdown.length > 0) {
      let finalY = doc.lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Rincian Penjualan per Varian Menu", 14, finalY);
      
      const menuColumns = ["Varian Menu", "Volume (Porsi)", "Kontribusi Vol (%)", "Total Pendapatan (Rp)"];
      const menuRows = [];
      
      menuBreakdown.forEach(m => {
        menuRows.push([
          m.nama_menu,
          m.total_sold.toString(),
          `${m.pct_sales}%`,
          formatCurrency(m.total_revenue)
        ]);
      });
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [menuColumns],
        body: menuRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
    
    doc.save(`Laporan_PDF_AyamGeprek_${startDate}_to_${endDate}.pdf`);
  };

  const handleExportExcel = () => {
    const data = weeklyData.map(d => ({
      "Tanggal/Hari": d.day,
      "Volume (Porsi)": d.sales,
      "Nilai Pendapatan (Rp)": d.revenue,
      "Jml Transaksi": d.transactions,
      "Rata-rata Pembelian/Trx (Rp)": d.transactions > 0 ? Math.round(d.revenue / d.transactions) : 0
    }));

    data.push({
      "Tanggal/Hari": "TOTAL KESELURUHAN",
      "Volume (Porsi)": totalSales,
      "Nilai Pendapatan (Rp)": totalRevenue,
      "Jml Transaksi": totalTransactions,
      "Rata-rata Pembelian/Trx (Rp)": Math.round(avgTransaction)
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Harian");
    
    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 15 },
      { wch: 22 },
      { wch: 15 },
      { wch: 28 },
    ];

    if (menuBreakdown && menuBreakdown.length > 0) {
      const menuData = menuBreakdown.map(m => ({
        "Nama Menu": m.nama_menu,
        "Volume Terjual (Porsi)": m.total_sold,
        "Kontribusi Volume (%)": m.pct_sales,
        "Total Pendapatan (Rp)": m.total_revenue,
        "Kontribusi Pendapatan (%)": m.pct_revenue
      }));
      
      const menuWorksheet = XLSX.utils.json_to_sheet(menuData);
      XLSX.utils.book_append_sheet(workbook, menuWorksheet, "Rincian Menu");
      
      menuWorksheet['!cols'] = [
        { wch: 30 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        { wch: 24 },
      ];
    }

    XLSX.writeFile(workbook, `Laporan_Excel_AyamGeprek_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" />
            Laporan Bisnis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Export laporan operasional secara dinamis sesuai periode pilihan Anda.</p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Calendar size={120} />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
          <Calendar className="w-5 h-5 text-orange-500" />
          Konfigurasi Laporan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <option value="daily">Laporan Harian</option>
              <option value="weekly">Laporan Mingguan</option>
              <option value="monthly">Laporan Bulanan</option>
              <option value="yearly">Laporan Tahunan</option>
              <option value="custom">-- Custom Range --</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-600 transition-colors cursor-pointer"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-600 transition-colors cursor-pointer"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:col-span-2 relative z-10">
            <button
              onClick={handleExportPDF}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm border border-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span className="whitespace-nowrap">Cetak PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm border border-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-600 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span className="whitespace-nowrap">Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Report Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl border border-orange-400 dark:border-orange-500/50 shadow-sm text-white relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <DollarSign className="absolute -right-4 -top-4 w-24 h-24 opacity-20 transform -rotate-12" />
          <div className="relative z-10">
            <p className="text-orange-100 font-medium mb-1 uppercase tracking-wider text-xs">Total Pendapatan Terakumulasi</p>
            <h2 className="text-3xl font-extrabold mb-3">{formatCurrency(totalRevenue)}</h2>
            <div className="inline-flex items-center gap-1.5 text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded text-sm font-bold shadow-sm backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Selesai</span> 
              <span className="font-medium text-xs ml-1 opacity-80 uppercase">Periode Aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Penjualan</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{totalSales}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded w-max transition-colors">Porsi terjual ke pelanggan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-purple-200 dark:hover:border-purple-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Volume Transaksi</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{totalTransactions}</h2>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded w-max transition-colors">Pelanggan aktif dilayani</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-green-200 dark:hover:border-green-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider text-nowrap">Rata-rata Trx.</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(avgTransaction)}</h2>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-900/50">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded w-max transition-colors">Nilai per pelanggan</p>
        </div>
      </div>

      {/* Charts (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 relative overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md duration-300 animate-in fade-in duration-500">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 to-amber-500"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tren Pertumbuhan Pendapatan (Omzet)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} className="opacity-50 dark:opacity-20" />
              <XAxis dataKey="day" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ className: 'dark:fill-gray-400' }} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}jt`} tick={{ className: 'dark:fill-gray-400' }} />
              <Tooltip 
                content={<CustomReportRevenueTooltip />} 
                allowEscapeViewBox={true} 
                offset={20}
                transitionDuration={200}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Nilai Omzet"
                stroke="#ea580c"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={{ fill: '#ffffff', stroke: '#ea580c', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, strokeWidth: 0, fill: '#ea580c' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Area Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md duration-300 animate-in fade-in duration-500">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Volume Detail Penjualan (Porsi)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} className="opacity-50 dark:opacity-20" />
              <XAxis dataKey="day" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ className: 'dark:fill-gray-400' }} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ className: 'dark:fill-gray-400' }} />
              <Tooltip 
                content={<CustomReportSalesTooltip />} 
                allowEscapeViewBox={true} 
                offset={20}
                transitionDuration={200}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Banyak Penjualan (Porsi)"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                dot={{ fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, strokeWidth: 0, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Menu Sales Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
        <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Pizza className="w-5 h-5 text-orange-500" />
              Rincian Penjualan per Varian Menu
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distribusi volume penjualan dan kontribusi omzet masing-masing menu.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {menuBreakdown.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Tidak ada data penjualan menu untuk periode ini.
            </div>
          ) : (
            <table className="w-full whitespace-nowrap text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16 text-center">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Varian Menu</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Volume (Porsi)</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kontribusi Penjualan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {menuBreakdown.map((menu, index) => (
                  <tr key={menu.menu_id} className="hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-900 dark:bg-orange-950/30 dark:text-orange-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{menu.nama_menu}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-right">{menu.total_sold} Porsi</td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-8">{menu.pct_sales}%</span>
                        <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                              index === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              'bg-gradient-to-r from-teal-500 to-emerald-500'
                            }`}
                            style={{ width: `${menu.pct_sales}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">{formatCurrency(menu.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed Table Data */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
        <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rekapitulasi Data Transaksi Lengkap</h3>
          <button onClick={handleExportExcel} className="text-orange-600 dark:text-orange-500 font-semibold text-sm hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-900/50">
            <Download className="w-4 h-4" />
            Download Excel Laporan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tanggal/Hari</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Volume (Porsi)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Nilai Pendapatan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Jml Transaksi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Rata-rata Pembelian/Trx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {weeklyData.map((day, index) => (
                <tr key={index} className="hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{day.day}</td>
                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-right">{day.sales}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">{formatCurrency(day.revenue)}</td>
                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-right">{day.transactions}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block transition-colors">{formatCurrency(day.transactions > 0 ? day.revenue / day.transactions : 0)}</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-900 dark:bg-gray-950 text-white shadow-inner font-bold text-sm">
                <td className="px-6 py-4 uppercase tracking-widest text-gray-300">TOTAL KESELURUHAN</td>
                <td className="px-6 py-4 text-right text-lg text-white">{totalSales}</td>
                <td className="px-6 py-4 text-right text-lg text-orange-400">{formatCurrency(totalRevenue)}</td>
                <td className="px-6 py-4 text-right text-lg text-white">{totalTransactions}</td>
                <td className="px-6 py-4 text-right text-lg text-white font-medium">{formatCurrency(avgTransaction)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Report Gen Templates */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-8 transition-colors duration-300">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 relative inline-block">
          Template Laporan Cetak Cepat
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-orange-500 rounded-full"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <button
            onClick={handleExportPDF}
            className="p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all text-left group flex flex-col justify-start relative overflow-hidden h-full"
          >
            <div className="absolute top-0 right-0 p-4 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform opacity-10">
               <FileText size={80} />
            </div>
            <FileText className="w-10 h-10 text-orange-500 dark:text-orange-400 mb-4 bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Laporan Mingguan</h4>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Klik untuk unduh data analisis minggu ini segera (PDF format).</p>
          </button>
          <button
            onClick={handleExportPDF}
            className="p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left group flex flex-col justify-start relative overflow-hidden h-full"
          >
             <div className="absolute top-0 right-0 p-4 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform opacity-10">
               <FileText size={80} />
            </div>
            <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-4 bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Laporan Bulanan</h4>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rekap komplit performa transaksi untuk satu bulan berjalan.</p>
          </button>
          <button
            onClick={handleExportPDF}
            className="p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all text-left group flex flex-col justify-start relative overflow-hidden h-full"
          >
             <div className="absolute top-0 right-0 p-4 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform opacity-10">
               <FileText size={80} />
            </div>
            <FileText className="w-10 h-10 text-purple-500 dark:text-purple-400 mb-4 bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Laporan Tahunan</h4>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arsip data final, pertumbuhan YTD, dan laporan laba-rugi.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

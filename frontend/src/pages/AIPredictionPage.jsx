import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// Di lingkungan nyata, axios akan diimpor: import axios from 'axios';

// Mendaftarkan komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AIPredictionPage = () => {
    // State manajemen
    const [daysToPredict, setDaysToPredict] = useState(7);
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fungsi fetch API ke Django
    const fetchPrediction = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Simulasi panggilan endpoint API menggunakan axios
            // const response = await axios.post('http://localhost:8000/api/predict-ai/', { days: daysToPredict });
            // setPredictionData(response.data);
            
            // >>> SIMULASI RESPON UNTUK KEPERLUAN DEMO <<<
            const responseData = {
                "status": "success",
                "hari_diprediksi": daysToPredict,
                "detail_prediksi": Array.from({ length: daysToPredict }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i + 1);
                  return {
                    "tanggal": d.toISOString().split('T')[0],
                    "prediksi_penjualan_porsi": Math.floor(60 + Math.random() * 30 + (i * 1.5))
                  }
                }),
                "rekomendasi_sistem": `Berdasarkan tren penjualan historis, Anda diproyeksikan akan menjual banyak porsi dalam ${daysToPredict} hari ke depan. Disarankan untuk segera restok ayam secepatnya.`
            };
            
            setTimeout(() => {
                setPredictionData(responseData);
                setLoading(false);
            }, 800); // Simulasi delay jaringan
            
        } catch (err) {
            setError(err.message || 'Gagal mengambil prediksi AI.');
            setLoading(false);
        }
    };

    // Auto-fetch data awal saat komponen dimuat
    useEffect(() => {
        fetchPrediction();
    }, []);

    // Konfigurasi Chart.js berdasarkan data state
    const chartData = {
        labels: predictionData ? predictionData.detail_prediksi.map(item => item.tanggal) : [],
        datasets: [
            {
                label: 'Prediksi Permintaan (Porsi)',
                data: predictionData ? predictionData.detail_prediksi.map(item => item.prediksi_penjualan_porsi) : [],
                borderColor: '#F97316', // Oranye Ayam Geprek
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#EA580C',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#EA580C',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#374151'
                }
            },
            title: {
                display: true,
                text: 'Proyeksi Kebutuhan Stok Ayam (Porsi)',
                color: '#111827',
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: '#E5E7EB' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-transparent min-h-full">
            {/* Header Halaman */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Prediksi AI & Rekomendasi</h1>
                    <p className="text-gray-500 mt-1">Menggunakan Machine Learning untuk memprediksi tren penjualan masa depan.</p>
                </div>
                
                {/* Kontrol Input (Date picker trigger) */}
                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-fit">
                    <label htmlFor="days" className="text-sm font-medium text-gray-700 whitespace-nowrap">Prediksi untuk:</label>
                    <select 
                        id="days" 
                        value={daysToPredict} 
                        onChange={(e) => setDaysToPredict(parseInt(e.target.value))}
                        className="border border-gray-300 bg-white rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value={3}>3 Hari ke Depan</option>
                        <option value={7}>7 Hari ke Depan</option>
                        <option value={14}>14 Hari ke Depan</option>
                        <option value={30}>1 Bulan ke Depan</option>
                    </select>
                    <button 
                        onClick={fetchPrediction}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? 'Menghitung...' : 'Mulai Prediksi'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Panel Rekomendasi Sistem */}
            {predictionData && !loading && (
                <div className="bg-white border-l-4 border-orange-500 shadow-md rounded-lg p-6 mb-8 transform transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 bg-orange-100 rounded-full p-3 mr-4">
                            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Rekomendasi Sistem (AI)</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                "{predictionData.rekomendasi_sistem}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Container */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-500 font-medium">Model AI sedang menganalisis data...</span>
                    </div>
                ) : predictionData ? (
                    <div className="h-96 w-full flex justify-center">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                        Tidak ada data prediksi untuk ditampilkan. Klik tombol di atas untuk memulai.
                    </div>
                )}
            </div>
            
            {/* Disclaimer */}
            <div className="mt-8 text-center text-xs text-gray-400">
                <p>Data prediksi ini dihasilkan menggunakan model regresi linier / time series (Scikit-learn) berdasarkan historis transaksi.</p>
                <p>Akurasi bergantung pada kelengkapan dan konsistensi data penjualan harian Anda.</p>
            </div>
        </div>
    );
};

export default AIPredictionPage;

# Struktur Direktori Full-Stack Aplikasi AI Ayam Geprek 3 Alam

Berikut adalah struktur folder ideal untuk proyek web Full-Stack yang menggunakan React (Frontend) dan Django (Backend):

```text
coba_ayam_geprek/
│
├── frontend/                   # React.js Frontend (menggunakan Vite / Create React App)
│   ├── public/                 # File statis publik (favicon, index.html)
│   ├── src/
│   │   ├── assets/             # Gambar, ikon, font
│   │   ├── components/         # Komponen UI Reusable (Sidebar, Navbar, Card, Chart)
│   │   ├── pages/              # Komponen Halaman Utama
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx
│   │   │   ├── Inventory.jsx
│   │   │   └── AIPredictionPage.jsx # Halaman AI Prediksi (Chart.js)
│   │   ├── services/           # Modul pemanggilan API (Axios instance)
│   │   │   └── api.js
│   │   ├── utils/              # Fungsi utilitas format mata uang, tanggal, dll
│   │   ├── App.jsx             # Root component & Routing utama
│   │   ├── index.jsx           # Entry point React
│   │   └── index.css           # Konfigurasi Tailwind CSS
│   ├── package.json            # Dependensi React (react, chart.js, axios, dll)
│   └── tailwind.config.js      # Konfigurasi Tailwind (Warna brand Oranye)
│
├── backend/                    # Django Backend & API
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Dependensi Python (django, djangorestframework, pandas, scikit-learn, psycopg2)
│   ├── backend_project/        # Konfigurasi utama Django
│   │   ├── settings.py         # Setting Database (PostgreSQL), App apps, CORS, DRF
│   │   ├── urls.py             # URL routing utama
│   │   └── wsgi.py
│   └── core/                   # Aplikasi Django (App Django utama)
│       ├── migrations/         # Database migrations
│       ├── models.py           # Skema Data (User, Menu, BahanBaku, TransaksiPenjualan)
│       ├── serializers.py      # Format data API (DRF)
│       ├── views.py            # Logika API / Endpoint Controller
│       ├── urls.py             # Routing API
│       └── ai_service.py       # Modul Data Science: Pandas preprocessing & Scikit-learn prediction
│
└── README.md                   # Dokumentasi cara menjalankan proyek
```

## Penjelasan Singkat
* `frontend/`: Dibangun dengan React + Tailwind CSS. Berfungsi sebagai Single Page Application (SPA).
* `backend/core/ai_service.py`: Di file inilah Pandas dan Scikit-learn bekerja mengolah data dari tabel `TransaksiPenjualan` di PostgreSQL untuk menghasilkan prediksi.
* API DRF menjembatani data PostgreSQL dan AI model agar bisa dipakai oleh *frontend*.

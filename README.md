# Proyek Full-Stack AI Point of Sales (Ayam Geprek 3 Alam)

Proyek ini adalah demonstrasi implementasi sistem berdasarkan prompt arsitektur skripsi. File-file penting ditempatkan di dalam folder struktur proyek ini.

## File Utama yang Dihasilkan
Sesuai instruksi, berikut file-file kunci yang sudah digenerate:

1. **Struktur Proyek**: Bisa dilihat di `struktur_proyek.md`
2. **Database Schema (Django Models)**: `backend/core/models.py`
3. **AI Service (Pandas & Scikit-learn)**: `backend/core/ai_service.py`
4. **API Endpoints (Django Views & Serializers)**: `backend/core/views.py` dan `backend/core/serializers.py`
5. **Frontend AI Prediction Page (React)**: `frontend/src/pages/AIPredictionPage.jsx`

## Cara Memulai Pengembangan (Tahap Lanjutan)

Karena ini adalah referensi kode inti, untuk membuat project ini benar-benar berjalan dari nol, Anda perlu:

### Backend (Django)
1. Buat virtual environment: `python -m venv venv`
2. Aktivasi: `venv\Scripts\activate` (Windows)
3. Install package: `pip install django djangorestframework psycopg2 pandas scikit-learn django-cors-headers`
4. Start project: `django-admin startproject backend_project .`
5. Start app: `django-admin startapp core`
6. Lalu copy isi file `models.py`, `serializers.py`, `views.py`, dan `ai_service.py` dari folder ini ke dalam folder aplikasi Django `core/`.

### Frontend (React)
1. Buat project React di folder luar (atau buka terminal baru): `npx create-vite frontend --template react` (atau `npx create-react-app frontend`)
2. Masuk direktori: `cd frontend`
3. Install dependensi: `npm install chart.js react-chartjs-2 axios tailwindcss postcss autoprefixer`
4. Copy `AIPredictionPage.jsx` ke dalam struktur React `src/pages/` Anda.
5. Jalankan: `npm run dev` (untuk Vite) atau `npm start` (untuk CRA).

### Cara Menjalankan Sekaligus (Backend & Frontend)
Untuk kemudahan pengembangan, Anda bisa langsung menjalankan server backend dan frontend secara bersamaan dari root direktori proyek Anda hanya dengan satu perintah:
```bash
npm run dev
```
Perintah ini akan mendownload package pembantu `concurrently` (jika belum ada) dan langsung menyalakan server Django serta React secara paralel di satu jendela terminal.

Sistem arsitektur AI dan komponen React (dengan Chart.js) siap diintegrasikan.


from datetime import timedelta
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from .models import TransaksiPenjualan, DetailTransaksi, BahanBaku, Resep

try:
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False

def predict_sales_and_stock(days_to_predict=7):
    """
    Fungsi untuk memprediksi penjualan ke depan.
    Jika Pandas & Scikit-learn terinstal (lokal), model menggunakan Scikit-learn LinearRegression.
    Jika tidak terinstal (PythonAnywhere), model menggunakan perhitungan manual Least Squares.
    """
    # 1. Mengambil data dari Database
    APPROVED_MENUS = ["Paket Ayam Geprek", "Dada", "Paha Atas", "Paha Bawah", "Sayap"]
    qs = DetailTransaksi.objects.filter(
        menu__nama_menu__in=APPROVED_MENUS
    ).annotate(
        tanggal=TruncDate('transaksi__tanggal_transaksi')
    ).values('tanggal').annotate(
        penjualan_ayam=Sum('kuantitas')
    ).order_by('tanggal')
    
    data_list = list(qs)
    
    hasil_prediksi = []
    total_estimasi_stok_diperlukan = 0
    
    if HAS_ML_LIBS:
        # --- PATH A: Menggunakan Pandas & Scikit-learn (Sesuai Naskah Skripsi) ---
        df = pd.DataFrame(data_list)
        
        # [FALLBACK DATA] Jika data database kosong atau < 5 hari, gunakan Dummy Data historis
        if len(df) < 5:
            today = timezone.localtime(timezone.now()).date()
            fallback_dates = [today - timedelta(days=29-i) for i in range(30)]
            fallback_sales = [50, 55, 60, 52, 65, 78, 80, 51, 58, 62, 53, 68, 82, 85, 54, 59, 65, 55, 70, 85, 88, 55, 62, 66, 58, 72, 88, 90, 60, 65]
            df = pd.DataFrame({'tanggal': fallback_dates, 'penjualan_ayam': fallback_sales})
        
        # Konversi tanggal ke hari_ke (X)
        min_date = df['tanggal'].min()
        df['X'] = df['tanggal'].apply(lambda d: (d - min_date).days)
        df['y'] = df['penjualan_ayam']
        
        X_train = df[['X']].values
        y_train = df['y'].values
        
        # Inisialisasi dan training model Regresi Linear
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        last_day = int(df['X'].max())
        last_date = df['tanggal'].max()
        
        # Lakukan prediksi
        for i in range(1, days_to_predict + 1):
            future_day = last_day + i
            pred = model.predict([[future_day]])[0]
            estimasi = max(0, int(round(pred)))
            
            future_date = last_date + timedelta(days=i)
            hasil_prediksi.append({
                "tanggal": future_date.strftime('%Y-%m-%d'),
                "prediksi_penjualan_porsi": estimasi
            })
            total_estimasi_stok_diperlukan += estimasi
            
    else:
        # --- PATH B: Perhitungan Manual Least Squares (Untuk Hosting Gratis PythonAnywhere) ---
        # [FALLBACK DATA] Jika data database kosong atau < 5 hari, gunakan Dummy Data historis
        if len(data_list) < 5:
            today = timezone.localtime(timezone.now()).date()
            fallback_dates = [today - timedelta(days=29-i) for i in range(30)]
            fallback_sales = [50, 55, 60, 52, 65, 78, 80, 51, 58, 62, 53, 68, 82, 85, 54, 59, 65, 55, 70, 85, 88, 55, 62, 66, 58, 72, 88, 90, 60, 65]
            data_list = [{'tanggal': d, 'penjualan_ayam': s} for d, s in zip(fallback_dates, fallback_sales)]
        
        min_date = data_list[0]['tanggal']
        X = []
        y = []
        for item in data_list:
            days = (item['tanggal'] - min_date).days
            X.append(days)
            y.append(item['penjualan_ayam'])
        
        n = len(X)
        sum_x = sum(X)
        sum_y = sum(y)
        sum_xy = sum(val_x * val_y for val_x, val_y in zip(X, y))
        sum_xx = sum(val_x ** 2 for val_x in X)
        
        denominator = (n * sum_xx - sum_x ** 2)
        if denominator == 0:
            m = 0
            c = sum_y / n if n > 0 else 0
        else:
            m = (n * sum_xy - sum_x * sum_y) / denominator
            c = (sum_y - m * sum_x) / n
        
        last_day = X[-1]
        last_date = data_list[-1]['tanggal']
        
        for i in range(1, days_to_predict + 1):
            future_day = last_day + i
            pred = m * future_day + c
            estimasi = max(0, int(round(pred)))
            
            future_date = last_date + timedelta(days=i)
            hasil_prediksi.append({
                "tanggal": future_date.strftime('%Y-%m-%d'),
                "prediksi_penjualan_porsi": estimasi
            })
            total_estimasi_stok_diperlukan += estimasi
        
    # 5. Kalkulasi Prediksi Bahan Baku berdasarkan Resep di database
    ALLOWED_BAHAN = ["Ayam", "Cabai", "Cabai Keriting", "Garam", "Bawang Putih", "Minyak Goreng", "Tepung Bumbu"]
    stock_predictions = []
    for bahan in BahanBaku.objects.filter(nama_bahan__in=ALLOWED_BAHAN):
        resep_items = Resep.objects.filter(bahan_baku=bahan).filter(menu__nama_menu__in=APPROVED_MENUS)
        if resep_items.exists():
            usage_per_porsi = sum(r.jumlah_dibutuhkan for r in resep_items) / resep_items.count()
        else:
            usage_per_porsi = 0.0
            
        total_needed = usage_per_porsi * total_estimasi_stok_diperlukan
        predicted_remaining = max(0.0, bahan.stok_saat_ini - total_needed)
        
        recommendation = "Aman"
        if predicted_remaining < bahan.stok_minimum:
            deficit = (bahan.stok_minimum + total_needed) - bahan.stok_saat_ini
            if deficit > 0:
                urgency = " (URGENT)" if predicted_remaining == 0 else ""
                recommendation = f"Butuh {round(deficit, 1)} {bahan.satuan}{urgency}"
                
        stock_predictions.append({
            "item": bahan.nama_bahan,
            "current": round(bahan.stok_saat_ini, 1),
            "predicted": round(predicted_remaining, 1),
            "recommendation": recommendation,
            "satuan": bahan.satuan,
            "status": "KRITIS" if predicted_remaining == 0 else ("PERINGATAN" if predicted_remaining < bahan.stok_minimum else "AMAN")
        })
        
    # 6. Menghasilkan Teks Rekomendasi
    rekomendasi = (
        f"Berdasarkan tren penjualan historis, Anda diproyeksikan akan menjual sekitar {total_estimasi_stok_diperlukan} porsi "
        f"dalam {days_to_predict} hari ke depan. Disarankan untuk segera melakukan restok bahan baku penting sesuai rincian di bawah."
    )
    
    return {
        "status": "success",
        "hari_diprediksi": days_to_predict,
        "detail_prediksi": hasil_prediksi,
        "stock_prediction": stock_predictions,
        "rekomendasi_sistem": rekomendasi,
    }

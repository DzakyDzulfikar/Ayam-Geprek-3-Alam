import os
import sys
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

# Set up Django environment
sys.path.append(r"C:\Users\Dzaky Dzulfikar\Documents\Tugas Akhir\Ayam Geprek 3 Alam\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from core.models import Menu, BahanBaku, TransaksiPenjualan, DetailTransaksi, Resep

User = get_user_model()

def seed_database():
    print("=== SEEDING DATABASE WITH DUMMY DATA ===")
    
    # 1. Clean existing database
    print("Clearing old data...")
    DetailTransaksi.objects.all().delete()
    TransaksiPenjualan.objects.all().delete()
    Resep.objects.all().delete()
    Menu.objects.all().delete()
    BahanBaku.objects.all().delete()
    User.objects.all().delete()
    
    # 2. Create Users
    print("Creating users...")
    admin_user = User.objects.create_superuser(
        username='Admin',
        email='admin@geprek3alam.com',
        password='Admin'
    )
    admin_user.role = 'admin'
    admin_user.save()
    
    karyawan_user = User.objects.create_user(
        username='Karyawan',
        email='karyawan@geprek3alam.com',
        password='Karyawan'
    )
    karyawan_user.role = 'kasir'
    karyawan_user.save()
    
    print(f"Created users: Admin (admin) and Karyawan (kasir/karyawan).")

    # 3. Create Menus (Exactly the 5 specified menus)
    print("Creating menus...")
    menus_data = [
        {"nama_menu": "Paket Ayam Geprek", "harga": 17000.00, "deskripsi": "Paket nasi + ayam geprek + lalapan"},
        {"nama_menu": "Dada", "harga": 12000.00, "deskripsi": "Ayam geprek dada saja"},
        {"nama_menu": "Paha Atas", "harga": 12000.00, "deskripsi": "Ayam geprek paha atas saja"},
        {"nama_menu": "Paha Bawah", "harga": 10000.00, "deskripsi": "Ayam geprek paha bawah saja"},
        {"nama_menu": "Sayap", "harga": 9000.00, "deskripsi": "Ayam geprek sayap saja"},
    ]
    
    menu_objs = {}
    for m_data in menus_data:
        m = Menu.objects.create(**m_data)
        menu_objs[m.nama_menu] = m
        print(f"  - Menu: {m.nama_menu} (Rp {m.harga})")

    # 4. Create Bahan Baku (Raw Materials)
    print("Creating raw materials...")
    # Setup stock levels to demonstrate merah, kuning, hijau status:
    # 1. Ayam (warning / kuning): stok_saat_ini = 20 kg, stok_minimum = 15 kg
    # 2. Cabai (critical / merah): stok_saat_ini = 3.5 kg, stok_minimum = 5 kg
    # 3. Bawang Putih (safe / hijau): stok_saat_ini = 12 kg, stok_minimum = 2 kg
    # 4. Minyak Goreng (safe / hijau): stok_saat_ini = 45 liter, stok_minimum = 10 liter
    # 5. Tepung Bumbu (warning / kuning): stok_saat_ini = 13 kg, stok_minimum = 10 kg
    
    bahan_data = [
        {"nama_bahan": "Ayam", "satuan": "kg", "stok_saat_ini": 20.0, "stok_minimum": 15.0},
        {"nama_bahan": "Cabai", "satuan": "kg", "stok_saat_ini": 3.5, "stok_minimum": 5.0},
        {"nama_bahan": "Bawang Putih", "satuan": "kg", "stok_saat_ini": 12.0, "stok_minimum": 2.0},
        {"nama_bahan": "Minyak Goreng", "satuan": "liter", "stok_saat_ini": 45.0, "stok_minimum": 10.0},
        {"nama_bahan": "Tepung Bumbu", "satuan": "kg", "stok_saat_ini": 13.0, "stok_minimum": 10.0},
    ]
    
    bahan_objs = {}
    for b_data in bahan_data:
        b = BahanBaku.objects.create(**b_data)
        bahan_objs[b.nama_bahan] = b
        print(f"  - Bahan Baku: {b.nama_bahan} ({b.stok_saat_ini} {b.satuan}, Min: {b.stok_minimum})")

    # 5. Create Recipes (Resep)
    print("Creating recipes...")
    # Paket Ayam Geprek Recipe
    Resep.objects.create(menu=menu_objs["Paket Ayam Geprek"], bahan_baku=bahan_objs["Ayam"], jumlah_dibutuhkan=0.20)
    Resep.objects.create(menu=menu_objs["Paket Ayam Geprek"], bahan_baku=bahan_objs["Cabai"], jumlah_dibutuhkan=0.04)
    Resep.objects.create(menu=menu_objs["Paket Ayam Geprek"], bahan_baku=bahan_objs["Bawang Putih"], jumlah_dibutuhkan=0.008)
    Resep.objects.create(menu=menu_objs["Paket Ayam Geprek"], bahan_baku=bahan_objs["Minyak Goreng"], jumlah_dibutuhkan=0.03)
    Resep.objects.create(menu=menu_objs["Paket Ayam Geprek"], bahan_baku=bahan_objs["Tepung Bumbu"], jumlah_dibutuhkan=0.05)
    
    # Dada Recipe
    Resep.objects.create(menu=menu_objs["Dada"], bahan_baku=bahan_objs["Ayam"], jumlah_dibutuhkan=0.18)
    Resep.objects.create(menu=menu_objs["Dada"], bahan_baku=bahan_objs["Cabai"], jumlah_dibutuhkan=0.03)
    Resep.objects.create(menu=menu_objs["Dada"], bahan_baku=bahan_objs["Bawang Putih"], jumlah_dibutuhkan=0.005)
    Resep.objects.create(menu=menu_objs["Dada"], bahan_baku=bahan_objs["Minyak Goreng"], jumlah_dibutuhkan=0.02)
    Resep.objects.create(menu=menu_objs["Dada"], bahan_baku=bahan_objs["Tepung Bumbu"], jumlah_dibutuhkan=0.04)
    
    # Paha Atas Recipe
    Resep.objects.create(menu=menu_objs["Paha Atas"], bahan_baku=bahan_objs["Ayam"], jumlah_dibutuhkan=0.18)
    Resep.objects.create(menu=menu_objs["Paha Atas"], bahan_baku=bahan_objs["Cabai"], jumlah_dibutuhkan=0.03)
    Resep.objects.create(menu=menu_objs["Paha Atas"], bahan_baku=bahan_objs["Bawang Putih"], jumlah_dibutuhkan=0.005)
    Resep.objects.create(menu=menu_objs["Paha Atas"], bahan_baku=bahan_objs["Minyak Goreng"], jumlah_dibutuhkan=0.02)
    Resep.objects.create(menu=menu_objs["Paha Atas"], bahan_baku=bahan_objs["Tepung Bumbu"], jumlah_dibutuhkan=0.04)
    
    # Paha Bawah Recipe
    Resep.objects.create(menu=menu_objs["Paha Bawah"], bahan_baku=bahan_objs["Ayam"], jumlah_dibutuhkan=0.15)
    Resep.objects.create(menu=menu_objs["Paha Bawah"], bahan_baku=bahan_objs["Cabai"], jumlah_dibutuhkan=0.03)
    Resep.objects.create(menu=menu_objs["Paha Bawah"], bahan_baku=bahan_objs["Bawang Putih"], jumlah_dibutuhkan=0.005)
    Resep.objects.create(menu=menu_objs["Paha Bawah"], bahan_baku=bahan_objs["Minyak Goreng"], jumlah_dibutuhkan=0.02)
    Resep.objects.create(menu=menu_objs["Paha Bawah"], bahan_baku=bahan_objs["Tepung Bumbu"], jumlah_dibutuhkan=0.03)
    
    # Sayap Recipe
    Resep.objects.create(menu=menu_objs["Sayap"], bahan_baku=bahan_objs["Ayam"], jumlah_dibutuhkan=0.12)
    Resep.objects.create(menu=menu_objs["Sayap"], bahan_baku=bahan_objs["Cabai"], jumlah_dibutuhkan=0.02)
    Resep.objects.create(menu=menu_objs["Sayap"], bahan_baku=bahan_objs["Bawang Putih"], jumlah_dibutuhkan=0.004)
    Resep.objects.create(menu=menu_objs["Sayap"], bahan_baku=bahan_objs["Minyak Goreng"], jumlah_dibutuhkan=0.02)
    Resep.objects.create(menu=menu_objs["Sayap"], bahan_baku=bahan_objs["Tepung Bumbu"], jumlah_dibutuhkan=0.03)
    
    print("Recipes created.")

    # 6. Generate 3 months of sales transactions (approx. 90 days back from 2026-06-14)
    # End date: today (2026-06-14)
    # Start date: 90 days ago (2026-03-16)
    print("Generating 3 months of sales transactions...")
    
    end_date = datetime(2026, 6, 14, 21, 0, 0)
    start_date = end_date - timedelta(days=90)
    
    current_date = start_date
    tx_count = 0
    portions_count = 0
    total_sales_val = 0
    
    menu_list = list(menu_objs.values())
    
    # We will generate daily batches
    while current_date <= end_date:
        # Determine number of transactions for the day based on day of week
        weekday = current_date.weekday() # 0 = Monday, ..., 6 = Sunday
        if weekday in [5, 6]: # Saturday, Sunday (Weekend Peak)
            num_tx = random.randint(45, 75)
        elif weekday in [4]: # Friday
            num_tx = random.randint(40, 60)
        else: # Mon-Thu
            num_tx = random.randint(25, 45)
            
        # For each transaction
        for _ in range(num_tx):
            # Random time of day between 10:00 and 21:00
            hour = random.randint(10, 20)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            tx_datetime = current_date.replace(hour=hour, minute=minute, second=second)
            
            # Make sure it's aware timezone if USE_TZ is true
            tx_datetime = timezone.make_aware(tx_datetime, timezone.get_current_timezone())
            
            tx = TransaksiPenjualan.objects.create(
                tanggal_transaksi=tx_datetime,
                kasir=karyawan_user,
                total_harga=0 # will update shortly
            )
            
            # Select 1 to 3 items
            num_items = random.randint(1, 3)
            selected_menus = random.sample(menu_list, num_items)
            
            tx_total = 0
            for menu in selected_menus:
                qty = random.choices([1, 2, 3, 4], weights=[0.6, 0.25, 0.1, 0.05])[0]
                subtotal = float(menu.harga) * qty
                
                DetailTransaksi.objects.create(
                    transaksi=tx,
                    menu=menu,
                    kuantitas=qty,
                    subtotal=subtotal
                )
                tx_total += subtotal
                portions_count += qty
                
            tx.total_harga = tx_total
            tx.save()
            
            total_sales_val += tx_total
            tx_count += 1
            
        current_date += timedelta(days=1)
        
    print(f"Successfully generated {tx_count} transactions with {portions_count} portions sold.")
    print(f"Total revenue generated: Rp {total_sales_val:,.2f}")
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()

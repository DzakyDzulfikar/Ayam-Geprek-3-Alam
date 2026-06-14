import random
from datetime import datetime, timedelta
from django.db import transaction, connection
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import CustomUser, Menu, BahanBaku, Resep, TransaksiPenjualan, DetailTransaksi

class Command(BaseCommand):
    help = 'Mengisi database awal dengan data pengujian Ayam Geprek 3 Alam'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Mengosongkan database lama...')
        DetailTransaksi.objects.all().delete()
        TransaksiPenjualan.objects.all().delete()
        Resep.objects.all().delete()
        Menu.objects.all().delete()
        BahanBaku.objects.all().delete()
        # Hapus user non-superuser
        CustomUser.objects.filter(is_superuser=False).delete()

        self.stdout.write('Membuat user default...')
        # Buat Admin (jika belum ada)
        admin_user, created = CustomUser.objects.get_or_create(
            username='Admin',
            defaults={
                'email': 'admin@geprek3alam.com',
                'role': 'admin',
                'is_staff': True
            }
        )
        if created or not admin_user.check_password('Admin'):
            admin_user.set_password('Admin')
            admin_user.save()

        # Buat Karyawan/Kasir
        kasir_user, created = CustomUser.objects.get_or_create(
            username='Karyawan',
            defaults={
                'email': 'karyawan@geprek3alam.com',
                'role': 'kasir',
                'is_staff': False
            }
        )
        if created or not kasir_user.check_password('Karyawan'):
            kasir_user.set_password('Karyawan')
            kasir_user.save()

        self.stdout.write('Membuat bahan baku per hari...')
        # setup bahan baku dengan indikator:
        # merah (menipis) <= min
        # kuning (peringatan) min < qty <= min * 1.5
        # hijau (aman) qty > min * 1.5
        bahan_list = [
            {"nama_bahan": "Ayam", "satuan": "ekor", "stok_saat_ini": 20.0, "stok_minimum": 15.0},         # Kuning (Peringatan)
            {"nama_bahan": "Cabai", "satuan": "kg", "stok_saat_ini": 3.5, "stok_minimum": 5.0},            # Merah (Menipis)
            {"nama_bahan": "Cabai Keriting", "satuan": "kg", "stok_saat_ini": 7.5, "stok_minimum": 4.0},   # Hijau (Aman)
            {"nama_bahan": "Garam", "satuan": "kg", "stok_saat_ini": 0.8, "stok_minimum": 1.0},            # Merah (Menipis)
            {"nama_bahan": "Bawang Putih", "satuan": "kg", "stok_saat_ini": 2.6, "stok_minimum": 2.0},    # Kuning (Peringatan)
            {"nama_bahan": "Minyak Goreng", "satuan": "liter", "stok_saat_ini": 18.0, "stok_minimum": 10.0},# Hijau (Aman)
            {"nama_bahan": "Tepung Bumbu", "satuan": "kg", "stok_saat_ini": 12.0, "stok_minimum": 10.0},   # Kuning (Peringatan)
        ]
        bahan_db = {}
        for b in bahan_list:
            obj = BahanBaku.objects.create(**b)
            bahan_db[b["nama_bahan"]] = obj

        self.stdout.write('Membuat menu makanan...')
        menu_list = [
            {"nama_menu": "Paket Ayam Geprek", "harga": 18000.00, "deskripsi": "Paket nasi + ayam geprek + lalapan"},
            {"nama_menu": "Dada", "harga": 8000.00, "deskripsi": "Ayam geprek dada saja"},
            {"nama_menu": "Paha Atas", "harga": 6000.00, "deskripsi": "Ayam geprek paha atas saja"},
            {"nama_menu": "Paha Bawah", "harga": 6000.00, "deskripsi": "Ayam geprek paha bawah saja"},
            {"nama_menu": "Sayap", "harga": 7000.00, "deskripsi": "Ayam geprek sayap saja"},
        ]
        menu_db = {}
        for m in menu_list:
            obj = Menu.objects.create(**m)
            menu_db[m["nama_menu"]] = obj

        self.stdout.write('Menghubungkan resep bahan baku ke menu...')
        resep_data = [
            # Paket Ayam Geprek
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Ayam"], "jumlah_dibutuhkan": 0.1},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Cabai"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Cabai Keriting"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Garam"], "jumlah_dibutuhkan": 0.005},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Bawang Putih"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.05},
            
            # Dada
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Ayam"], "jumlah_dibutuhkan": 0.1},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Cabai"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Cabai Keriting"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Garam"], "jumlah_dibutuhkan": 0.003},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Bawang Putih"], "jumlah_dibutuhkan": 0.005},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.04},
            
            # Paha Atas
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Ayam"], "jumlah_dibutuhkan": 0.1},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Cabai"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Cabai Keriting"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Garam"], "jumlah_dibutuhkan": 0.003},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Bawang Putih"], "jumlah_dibutuhkan": 0.005},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.04},
            
            # Paha Bawah
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Ayam"], "jumlah_dibutuhkan": 0.1},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Cabai"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Cabai Keriting"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Garam"], "jumlah_dibutuhkan": 0.003},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Bawang Putih"], "jumlah_dibutuhkan": 0.005},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.03},
            
            # Sayap
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Ayam"], "jumlah_dibutuhkan": 0.1},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Cabai"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Cabai Keriting"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Garam"], "jumlah_dibutuhkan": 0.003},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Bawang Putih"], "jumlah_dibutuhkan": 0.004},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.02},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.03},
        ]
        for r in resep_data:
            Resep.objects.create(**r)

        self.stdout.write('Membuat data transaksi historis 3 bulan (90 hari)...')
        end_date = datetime(2026, 6, 14, 21, 0, 0)
        start_date = end_date - timedelta(days=90)
        
        current_date = start_date
        portions_count = 0
        total_sales_val = 0
        tx_count = 0
        
        geprek_menus = list(menu_db.values())

        txs_to_create = []
        details_by_tx_index = []

        # Disable auto_now_add to allow custom timestamps
        field = TransaksiPenjualan._meta.get_field('tanggal_transaksi')
        field.auto_now_add = False

        try:
            while current_date <= end_date:
                daily_total = 0
                target_revenue = random.randint(500000, 600000)
                
                while daily_total < (target_revenue - 18000):
                    hour = random.randint(10, 20)
                    minute = random.randint(0, 59)
                    second = random.randint(0, 59)
                    
                    tx_time = current_date.replace(hour=hour, minute=minute, second=second)
                    tx_time = timezone.make_aware(tx_time, timezone.get_current_timezone())
                    
                    total_harga = 0
                    items_count = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
                    chosen_food = random.sample(geprek_menus, min(items_count, len(geprek_menus)))
                    
                    tx_details = []
                    for food in chosen_food:
                        qty = random.choices([1, 2, 3, 4], weights=[0.6, 0.25, 0.1, 0.05])[0]
                        subtotal = float(food.harga) * qty
                        
                        tx_details.append(DetailTransaksi(
                            menu=food,
                            kuantitas=qty,
                            subtotal=subtotal
                        ))
                        total_harga += subtotal
                        portions_count += qty
                    
                    txs_to_create.append(TransaksiPenjualan(
                        kasir=kasir_user,
                        total_harga=total_harga,
                        tanggal_transaksi=tx_time
                    ))
                    details_by_tx_index.append(tx_details)
                    
                    daily_total += total_harga
                    total_sales_val += total_harga
                    tx_count += 1
                    
                current_date += timedelta(days=1)
                
            self.stdout.write(f"Menyimpan {len(txs_to_create)} transaksi ke database...")
            created_txs = TransaksiPenjualan.objects.bulk_create(txs_to_create)
            
            all_details_to_create = []
            for i, tx in enumerate(created_txs):
                for detail in details_by_tx_index[i]:
                    detail.transaksi_id = tx.id
                    all_details_to_create.append(detail)
            
            self.stdout.write(f"Menyimpan {len(all_details_to_create)} item detail transaksi...")
            DetailTransaksi.objects.bulk_create(all_details_to_create)
            
        finally:
            field.auto_now_add = True

        self.stdout.write(self.style.SUCCESS(
            f'Seeding selesai! Berhasil membuat {tx_count} transaksi, '
            f'{portions_count} porsi terjual, total omzet Rp {total_sales_val:,.2f}'
        ))

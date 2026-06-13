import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import CustomUser, Menu, BahanBaku, Resep, TransaksiPenjualan, DetailTransaksi

class Command(BaseCommand):
    help = 'Mengisi database awal dengan data pengujian'

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

        self.stdout.write('Membuat bahan baku...')
        bahan_list = [
            {"nama_bahan": "Daging Ayam", "satuan": "kg", "stok_saat_ini": 55.0, "stok_minimum": 20.0},
            {"nama_bahan": "Tepung Bumbu", "satuan": "kg", "stok_saat_ini": 28.0, "stok_minimum": 10.0},
            {"nama_bahan": "Cabai Rawit", "satuan": "kg", "stok_saat_ini": 8.0, "stok_minimum": 3.0},
            {"nama_bahan": "Keju", "satuan": "kg", "stok_saat_ini": 15.0, "stok_minimum": 8.0},
            {"nama_bahan": "Minyak Goreng", "satuan": "liter", "stok_saat_ini": 35.0, "stok_minimum": 15.0},
            {"nama_bahan": "Beras", "satuan": "kg", "stok_saat_ini": 60.0, "stok_minimum": 30.0},
        ]
        bahan_db = {}
        for b in bahan_list:
            obj = BahanBaku.objects.create(**b)
            bahan_db[b["nama_bahan"]] = obj

        self.stdout.write('Membuat menu makanan...')
        menu_list = [
            {"nama_menu": "Paket Ayam Geprek", "harga": 20000.0, "deskripsi": "Paket ayam geprek lengkap dengan nasi"},
            {"nama_menu": "Dada", "harga": 15000.0, "deskripsi": "Ayam geprek bagian dada"},
            {"nama_menu": "Paha Atas", "harga": 15000.0, "deskripsi": "Ayam geprek bagian paha atas"},
            {"nama_menu": "Paha Bawah", "harga": 14000.0, "deskripsi": "Ayam geprek bagian paha bawah"},
            {"nama_menu": "Sayap", "harga": 12000.0, "deskripsi": "Ayam geprek bagian sayap"},
            {"nama_menu": "Es Teh Manis", "harga": 5000.0, "deskripsi": "Teh es manis penyegar dahaga"},
            {"nama_menu": "Es Jeruk", "harga": 7000.0, "deskripsi": "Es jeruk peras asli manis segar"},
        ]
        menu_db = {}
        for m in menu_list:
            obj = Menu.objects.create(**m)
            menu_db[m["nama_menu"]] = obj

        self.stdout.write('Menghubungkan resep bahan baku ke menu...')
        resep_data = [
            # Dada
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Daging Ayam"], "jumlah_dibutuhkan": 0.2},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Cabai Rawit"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Dada"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.05},
            # Paha Atas
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Daging Ayam"], "jumlah_dibutuhkan": 0.2},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Cabai Rawit"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Paha Atas"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.05},
            # Paha Bawah
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Daging Ayam"], "jumlah_dibutuhkan": 0.15},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.04},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Cabai Rawit"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Paha Bawah"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.04},
            # Sayap
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Daging Ayam"], "jumlah_dibutuhkan": 0.12},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.03},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Cabai Rawit"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Sayap"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.03},
            # Paket Ayam Geprek
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Daging Ayam"], "jumlah_dibutuhkan": 0.2},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Tepung Bumbu"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Cabai Rawit"], "jumlah_dibutuhkan": 0.01},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Minyak Goreng"], "jumlah_dibutuhkan": 0.05},
            {"menu": menu_db["Paket Ayam Geprek"], "bahan_baku": bahan_db["Beras"], "jumlah_dibutuhkan": 0.1},
        ]
        for r in resep_data:
            Resep.objects.create(**r)

        self.stdout.write('Membuat data transaksi historis (30 hari ke belakang)...')
        now = timezone.now()
        
        geprek_menus = [
            menu_db["Dada"],
            menu_db["Paha Atas"],
            menu_db["Paha Bawah"],
            menu_db["Sayap"],
            menu_db["Paket Ayam Geprek"]
        ]
        
        drink_menus = [
            menu_db["Es Teh Manis"],
            menu_db["Es Jeruk"]
        ]

        for day_ago in range(30, -1, -1):
            date_target = now - timedelta(days=day_ago)
            num_transactions = random.randint(8, 20)
            
            if date_target.weekday() in [5, 6]: # Sabtu & Minggu
                num_transactions = random.randint(15, 30)

            for _ in range(num_transactions):
                hour = random.randint(10, 21)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                
                tx_time = date_target.replace(hour=hour, minute=minute, second=second)
                
                tx = TransaksiPenjualan.objects.create(
                    kasir=kasir_user,
                    total_harga=0
                )
                tx.tanggal_transaksi = tx_time
                tx.save()

                total_harga = 0
                items_count = random.randint(1, 3)
                chosen_food = random.sample(geprek_menus, items_count)
                
                for food in chosen_food:
                    qty = random.randint(1, 3)
                    subtotal = food.harga * qty
                    DetailTransaksi.objects.create(
                        transaksi=tx,
                        menu=food,
                        kuantitas=qty,
                        subtotal=subtotal
                    )
                    total_harga += subtotal
                
                if random.random() < 0.8:
                    chosen_drink = random.choice(drink_menus)
                    qty = random.randint(1, 3)
                    subtotal = chosen_drink.harga * qty
                    DetailTransaksi.objects.create(
                        transaksi=tx,
                        menu=chosen_drink,
                        kuantitas=qty,
                        subtotal=subtotal
                    )
                    total_harga += subtotal

                tx.total_harga = total_harga
                tx.save()

        self.stdout.write(self.style.SUCCESS('Database Ayam Geprek 3 Alam berhasil di-seed!'))

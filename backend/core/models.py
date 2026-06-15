from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('kasir', 'Kasir'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='kasir')

    def __str__(self):
        return f"{self.username} - {self.role}"

class Menu(models.Model):
    nama_menu = models.CharField(max_length=100)
    harga = models.DecimalField(max_digits=10, decimal_places=2)
    deskripsi = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nama_menu

class BahanBaku(models.Model):
    nama_bahan = models.CharField(max_length=100)
    satuan = models.CharField(max_length=50) # kg, pcs, liter
    stok_saat_ini = models.FloatField(default=0.0)
    stok_minimum = models.FloatField(default=0.0) # Batas kritis peringatan stok
    order_index = models.IntegerField(default=0)
    terakhir_diupdate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama_bahan
    
    @property
    def is_kritis(self):
        return self.stok_saat_ini <= self.stok_minimum

class TransaksiPenjualan(models.Model):
    tanggal_transaksi = models.DateTimeField(auto_now_add=True)
    kasir = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    total_harga = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Transaksi #{self.id} - {self.tanggal_transaksi.strftime('%Y-%m-%d')}"

class DetailTransaksi(models.Model):
    transaksi = models.ForeignKey(TransaksiPenjualan, related_name='details', on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.RESTRICT)
    kuantitas = models.IntegerField(default=1)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.kuantitas}x {self.menu.nama_menu}"

class Resep(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='resep')
    bahan_baku = models.ForeignKey(BahanBaku, on_delete=models.CASCADE)
    jumlah_dibutuhkan = models.FloatField() # Jumlah bahan baku yang digunakan per porsi menu

    def __str__(self):
        return f"{self.menu.nama_menu} - {self.bahan_baku.nama_bahan} ({self.jumlah_dibutuhkan} {self.bahan_baku.satuan})"

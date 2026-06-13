from rest_framework import serializers
from .models import Menu, BahanBaku, TransaksiPenjualan, DetailTransaksi, CustomUser, Resep

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']

class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = '__all__'

class BahanBakuSerializer(serializers.ModelSerializer):
    status_stok = serializers.SerializerMethodField()

    class Meta:
        model = BahanBaku
        fields = '__all__'

    def get_status_stok(self, obj):
        return "Kritis" if obj.is_kritis else "Aman"

class DetailTransaksiSerializer(serializers.ModelSerializer):
    nama_menu = serializers.ReadOnlyField(source='menu.nama_menu')
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = DetailTransaksi
        fields = ['id', 'menu', 'nama_menu', 'kuantitas', 'subtotal']

class TransaksiPenjualanSerializer(serializers.ModelSerializer):
    details = DetailTransaksiSerializer(many=True)
    nama_kasir = serializers.ReadOnlyField(source='kasir.username')

    class Meta:
        model = TransaksiPenjualan
        fields = ['id', 'tanggal_transaksi', 'kasir', 'nama_kasir', 'total_harga', 'details']
        read_only_fields = ['total_harga']

    def create(self, validated_data):
        details_data = validated_data.pop('details', [])
        transaksi = TransaksiPenjualan.objects.create(**validated_data)
        total_harga = 0

        for detail_data in details_data:
            menu = detail_data['menu']
            kuantitas = detail_data['kuantitas']
            subtotal = menu.harga * kuantitas

            # Simpan DetailTransaksi
            DetailTransaksi.objects.create(
                transaksi=transaksi,
                menu=menu,
                kuantitas=kuantitas,
                subtotal=subtotal
            )
            total_harga += subtotal

            # Pengurangan stok otomatis berdasarkan resep menu
            resep_items = menu.resep.all()
            for item in resep_items:
                bahan = item.bahan_baku
                jumlah_potong = item.jumlah_dibutuhkan * kuantitas
                bahan.stok_saat_ini = max(0.0, bahan.stok_saat_ini - jumlah_potong)
                bahan.save()

        # Update total harga transaksi
        transaksi.total_harga = total_harga
        transaksi.save()
        return transaksi

class ResepSerializer(serializers.ModelSerializer):
    nama_bahan = serializers.ReadOnlyField(source='bahan_baku.nama_bahan')
    satuan_bahan = serializers.ReadOnlyField(source='bahan_baku.satuan')
    nama_menu = serializers.ReadOnlyField(source='menu.nama_menu')

    class Meta:
        model = Resep
        fields = ['id', 'menu', 'nama_menu', 'bahan_baku', 'nama_bahan', 'satuan_bahan', 'jumlah_dibutuhkan']


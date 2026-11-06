export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  namaTokoReseller?: string;
  noTelepon?: string;
  rekeningBank?: string;
  alamatLengkap?: string;
  customTier?: string;
  levelClaimRequest?: {
    targetLevel: string;
    boutiqueName: string;
    offlineSales: string;
    reasonText: string;
    submittedAt: string;
  };
}

export interface Brand {
  id: string;
  namaBrand: string;
  gambar?: string; // Foto cover/display brand untuk landing page & katalog
}

export interface Produk {
  id: string;
  namaProduk: string;
  SKU: string;
  hargaSatuan: number;
  stok: number;
  gambar: string;
  brandId: string;
  garansi: string; // e.g. "2 Tahun"
  berat: number; // in grams, e.g. 1200
  estimasiPengiriman: string; // e.g. "2-3 Hari Kerja"
  deskripsi: string;
  clodeoProductId?: string; // synced ID on Clodeo
  gineeProductId?: string;  // synced ID on Ginee
}

export type OrderStatus = "Menunggu Pembayaran" | "Dibayar" | "Diproses" | "Dikirim" | "Selesai";

export interface OrderDetail {
  id: string;
  produkId: string;
  namaProduk: string;
  gambarProduk: string;
  SKU: string;
  hargaSatuan: number;
  jumlah: number;
  subtotal: number;
}

export interface AlamatPengiriman {
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
}

export interface Order {
  id: string;
  tanggal: string;
  status: OrderStatus;
  userId: string;
  namaUser: string;
  emailUser: string;
  alamatPengiriman: AlamatPengiriman;
  nomorResi?: string;
  jenisPengiriman: string;
  biayaLayanan: number;
  totalTagihan: number;
  details: OrderDetail[];
  clodeoOrderId?: string;
  gineeOrderId?: string;
  clodeoSyncStatus?: "Pending" | "Synced" | "Failed";
  gineeSyncStatus?: "Pending" | "Synced" | "Failed";
  ongkosKirim?: number;
  buktiPembayaran?: string; // Image base64 or URL of payment receipt
  waktuUploadBukti?: string;
  bankTujuan?: string;
  namaPengirimTransfer?: string;
  catatanPembayaran?: string;
  statusVerifikasiBukti?: "Belum Upload" | "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak" | "Diverifikasi (Duitku Gateway)";
  duitkuReference?: string;
  duitkuPaymentUrl?: string;
  duitkuVaNumber?: string;
  duitkuPaymentMethod?: string;
  duitkuQrString?: string;
}

export interface CartItem {
  produk: Produk;
  jumlah: number;
}

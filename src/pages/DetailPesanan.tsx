import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  RefreshCw, 
  CreditCard, 
  MessageSquare, 
  AlertCircle, 
  Upload, 
  Check, 
  X, 
  FileText, 
  Image as ImageIcon,
  Building2,
  Copy,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { OrderStatus, Order } from "../types";
import UploadBuktiModal from "../components/UploadBuktiModal";
import ReceiptLightboxModal from "../components/ReceiptLightboxModal";
import DuitkuPaymentModal from "../components/DuitkuPaymentModal";

export default function DetailPesanan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useApp();

  const [showDuitkuModal, setShowDuitkuModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLightboxModal, setShowLightboxModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedBankKey, setCopiedBankKey] = useState<string | null>(null);

  // Find target order
  const order = useMemo(() => {
    return orders.find((o) => o.id === id);
  }, [orders, id]);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankKey(key);
    setTimeout(() => setCopiedBankKey(null), 2000);
  };

  const getStatusBanner = (targetOrder: Order) => {
    switch (targetOrder.status) {
      case "Menunggu Pembayaran":
        if (targetOrder.buktiPembayaran) {
          return (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex gap-3.5 items-center">
                <div className="bg-amber-600 text-white p-2.5 rounded-xl shadow-xs">
                  <Clock size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <span>Bukti Pembayaran Terkirim</span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">Menunggu Verifikasi</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 font-light mt-0.5">
                    Bukti transfer Anda sedang dicek oleh tim finance admin. Status akan otomatis berubah setelah mutasi terverifikasi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLightboxModal(true)}
                  className="bg-white border border-amber-300 text-amber-900 text-xs tracking-wider uppercase font-bold px-4 py-2.5 rounded-lg hover:bg-amber-100/50 flex items-center gap-1.5 transition-colors"
                >
                  <FileText size={13} />
                  <span>Lihat Bukti</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="bg-[#1E1916] text-white text-xs tracking-wider uppercase font-bold px-4 py-2.5 rounded-lg hover:bg-[#B39274] flex items-center gap-1.5 transition-colors"
                >
                  <Upload size={13} />
                  <span>Ubah Bukti</span>
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex gap-3.5 items-center">
              <div className="bg-rose-600 text-white p-2.5 rounded-xl shadow-xs">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Menunggu Pembayaran</h4>
                <p className="text-[11px] text-rose-800 font-light mt-0.5">
                  Gunakan Duitku Payment Gateway (QRIS / Virtual Account) untuk verifikasi instan, atau transfer manual.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDuitkuModal(true)}
                className="bg-emerald-700 text-white text-xs tracking-wider uppercase font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-800 flex items-center gap-1.5 shadow-sm"
                id="btn-duitku-banner"
              >
                <CreditCard size={14} />
                <span>Bayar via Duitku</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="bg-[#1E1916] text-white text-xs tracking-wider uppercase font-bold px-4 py-2.5 rounded-lg hover:bg-[#B39274] flex items-center gap-1.5 shadow-sm"
                id="btn-pay-banner"
              >
                <Upload size={14} />
                <span>Manual</span>
              </button>
            </div>
          </div>
        );

      case "Dibayar":
        return (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex gap-3.5 items-center">
              <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span>Pembayaran Lunas</span>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-950 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
                    {targetOrder.duitkuReference ? "Otomatis Duitku" : "Terverifikasi"}
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-800 font-light mt-0.5">
                  Pembayaran berhasil diverifikasi. Pesanan Anda kini masuk ke antrian Quality Control (QC) &amp; Packing tas mewah oleh admin.
                </p>
              </div>
            </div>
          </div>
        );

      case "Diproses":
        return (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-2xl flex gap-3.5 items-center shadow-xs">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-xs">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Pesanan Sedang Diproses</h4>
              <p className="text-[11px] text-blue-700 font-light mt-0.5">
                Pembayaran Anda telah terverifikasi lunas. Tim admin sedang menyiapkan pengecekan kualitas barang (QC) dan pengemasan dropship.
              </p>
            </div>
          </div>
        );

      case "Dikirim":
        return (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-5 rounded-2xl flex gap-3.5 items-center shadow-xs">
            <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-xs">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Pesanan Telah Dikirim</h4>
              <p className="text-[11px] text-purple-700 font-light mt-0.5">
                Barang sudah diserahkan ke kurir logistik. No. Resi: <strong className="font-mono">{targetOrder?.nomorResi}</strong> ({targetOrder?.jenisPengiriman})
              </p>
            </div>
          </div>
        );

      case "Selesai":
        return (
          <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl flex gap-3.5 items-center shadow-xs">
            <div className="bg-green-600 text-white p-2.5 rounded-xl shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Transaksi Selesai</h4>
              <p className="text-[11px] text-green-700 font-light mt-0.5">
                Paket pesanan telah diterima dengan baik di alamat pelanggan dropship Anda. Terima kasih atas kerja samanya.
              </p>
            </div>
          </div>
        );
    }
  };

  if (!order) {
    return (
      <ResellerLayout pageTitle="Pesanan Tidak Ditemukan">
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="text-center bg-white p-12 border border-[#EAE6DF] rounded-2xl max-w-md space-y-4">
            <div className="bg-amber-50 text-amber-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1E1916]">Order Tidak Ditemukan</h3>
            <p className="text-xs text-[#7C634F] font-normal">
              Faktur pesanan dengan ID tersebut tidak terdaftar di sistem reseller.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2 bg-[#1E1916] text-white text-xs tracking-wider uppercase rounded-lg hover:bg-[#B39274]"
            >
              Kembali ke Riwayat Pesanan
            </button>
          </div>
        </div>
      </ResellerLayout>
    );
  }

  const totalItemCount = order.details.reduce((acc, d) => acc + d.jumlah, 0);
  const totalItemPrice = order.details.reduce((acc, d) => acc + d.subtotal, 0);

  // Simulated WhatsApp contact message
  const waMessage = `Halo Admin Senna & Grace, saya ingin bertanya mengenai pesanan saya dengan nomor order: ${order.id}. Terimakasih!`;
  const waUrl = `https://wa.me/628123456789?text=${encodeURIComponent(waMessage)}`;

  return (
    <ResellerLayout pageTitle={`Detail Pesanan: ${order.id}`}>
      
      {/* BACK NAVIGATION */}
      <div className="px-6 py-4 border-b border-[#EAE6DF] bg-white flex items-center">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7C634F] hover:text-[#1E1916] font-semibold transition-colors duration-200"
          id="btn-back-to-orders"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Pesanan Saya</span>
        </button>
      </div>

      <section className="flex-grow p-6 lg:p-10 space-y-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Banner Status */}
          {getStatusBanner(order)}

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: ITEMS LIST, SHIPPING & PAYMENT PROOF (col 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Bought bags list */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-6 py-4">
                  <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold">Produk yang Dibeli ({totalItemCount} Tas)</h3>
                </div>

                <div className="divide-y divide-[#EAE6DF]">
                  {order.details.map((item) => (
                    <div key={item.id} className="p-6 flex gap-4 items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#EAE6DF] shrink-0">
                          <img src={item.gambarProduk} alt={item.namaProduk} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono tracking-wider text-[#B39274] uppercase">{item.SKU}</span>
                          <h4 className="text-xs font-bold text-[#1E1916] line-clamp-1">{item.namaProduk}</h4>
                          <p className="text-xs text-[#7C634F] mt-0.5">{formatIDR(item.hargaSatuan)} &times; {item.jumlah} unit</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-mono text-[#7C634F]">Subtotal</p>
                        <p className="text-xs font-bold text-[#1E1916] mt-0.5">{formatIDR(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: BUKTI PEMBAYARAN / TRANSFER CARD */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
                  <div>
                    <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#B39274]" />
                      <span>Bukti Pembayaran &amp; Transfer Rekening</span>
                    </h3>
                    <p className="text-[11px] text-[#7C634F] font-light mt-0.5">
                      Verifikasi mutasi pembayaran order reseller.
                    </p>
                  </div>

                  {order.status === "Menunggu Pembayaran" && (
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="text-xs bg-[#1E1916] hover:bg-[#B39274] text-white px-3.5 py-1.5 rounded-lg font-semibold tracking-wide uppercase transition-colors flex items-center gap-1.5"
                    >
                      <Upload size={13} />
                      <span>{order.buktiPembayaran ? "Ganti Bukti" : "Upload Bukti"}</span>
                    </button>
                  )}
                </div>

                {order.buktiPembayaran ? (
                  <div className="grid sm:grid-cols-12 gap-5 items-center bg-[#FAF9F6] p-4 rounded-xl border border-[#EAE6DF]">
                    <div 
                      onClick={() => setShowLightboxModal(true)}
                      className="sm:col-span-4 aspect-4/3 rounded-xl overflow-hidden bg-neutral-900 border border-[#EAE6DF] cursor-pointer group relative shadow-2xs"
                    >
                      <img
                        src={order.buktiPembayaran}
                        alt="Bukti Transfer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                        <ExternalLink size={14} />
                        <span>Perbesar</span>
                      </div>
                    </div>

                    <div className="sm:col-span-8 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#7C634F]">Status Validasi</span>
                        {order.statusVerifikasiBukti === "Terverifikasi" ? (
                          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" />
                            <span>Lunas Terverifikasi</span>
                          </span>
                        ) : order.statusVerifikasiBukti === "Ditolak" ? (
                          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            Ditolak
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={11} />
                            <span>Menunggu Review Admin</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] text-[#7C634F]">Bank Tujuan:</p>
                        <p className="font-semibold text-[#1E1916]">{order.bankTujuan || "BCA (PT Senna & Grace Luxury)"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] text-[#7C634F]">Nama Pengirim:</p>
                        <p className="font-semibold text-[#1E1916]">{order.namaPengirimTransfer || order.namaUser}</p>
                      </div>

                      {order.catatanPembayaran && (
                        <div className="space-y-1">
                          <p className="text-[11px] text-[#7C634F]">Catatan:</p>
                          <p className="text-[#1E1916] italic font-light text-[11px]">{order.catatanPembayaran}</p>
                        </div>
                      )}

                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLightboxModal(true)}
                          className="text-[11px] text-[#1E1916] font-bold underline hover:text-[#B39274] cursor-pointer"
                        >
                          Lihat Bukti Resolusi Penuh
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF9F6] p-5 rounded-xl border border-dashed border-[#EAE6DF] text-center space-y-3">
                    <div className="w-10 h-10 bg-white text-[#B39274] rounded-full flex items-center justify-center mx-auto border border-[#EAE6DF]">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1E1916]">Belum Ada Bukti Pembayaran</p>
                      <p className="text-[11px] text-[#7C634F] max-w-sm mx-auto font-light mt-0.5">
                        Silakan transfer sesuai invoice dan unggah struk atau tangkapan layar m-banking untuk validasi cepat.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="bg-[#1E1916] hover:bg-[#B39274] text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Upload size={13} />
                      <span>Upload Struk Sekarang</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery info card */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs p-6 space-y-4">
                <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold border-b border-[#EAE6DF] pb-3">Informasi Pengiriman (Dropship)</h3>
                
                <div className="grid sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <p className="text-[#7C634F] font-mono">Penerima Alamat</p>
                    <p className="text-[#1E1916] font-medium leading-relaxed font-sans">{order.alamatPengiriman.alamat}</p>
                    <p className="text-[#7C634F] font-light">
                      Kel. {order.alamatPengiriman.kelurahan}, Kec. {order.alamatPengiriman.kecamatan}<br />
                      {order.alamatPengiriman.kotaKabupaten}, {order.alamatPengiriman.provinsi}, {order.alamatPengiriman.kodePos}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[#7C634F] font-mono">Jenis Ekspedisi</p>
                      <p className="text-[#1E1916] font-bold">{order.jenisPengiriman}</p>
                    </div>
                    {order.nomorResi ? (
                      <div>
                        <p className="text-[#7C634F] font-mono">Nomor Resi Logistik</p>
                        <p className="text-sm font-mono font-bold text-[#B39274] bg-[#FAF9F6] border border-[#EAE6DF] px-3 py-1.5 rounded-lg inline-block">{order.nomorResi}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[#7C634F] font-mono">Nomor Resi</p>
                        <p className="text-xs text-[#7C634F] italic">Belum diinput oleh admin.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PAYMENT DETAILS & CTAs (col 4) */}
            <div className="lg:col-span-4 bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="border-b border-[#EAE6DF] pb-4">
                <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold">Rincian Pembayaran</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-[#7C634F]">
                  <span>Total Harga Item</span>
                  <span className="font-medium">{formatIDR(totalItemPrice)}</span>
                </div>
                <div className="flex justify-between text-[#7C634F]">
                  <span>Biaya Layanan</span>
                  <span className="font-medium">{formatIDR(order.biayaLayanan)}</span>
                </div>
                {order.ongkosKirim !== undefined && (
                  <div className="flex justify-between text-[#7C634F]">
                    <span>Ongkos Kirim Logistik</span>
                    <span className="font-medium">{formatIDR(order.ongkosKirim)}</span>
                  </div>
                )}
                <div className="border-t border-[#EAE6DF] pt-4 flex justify-between items-center text-[#1E1916]">
                  <span className="font-bold">Total Invoice</span>
                  <span className="text-base font-extrabold text-[#1E1916]">{formatIDR(order.totalTagihan)}</span>
                </div>
              </div>

              {/* Official Bank Quick Transfer box */}
              <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#7C634F]">Rekening Resmi Tujuan</span>
                  <span className="text-[9px] font-bold bg-[#B39274]/20 text-[#B39274] px-1.5 py-0.5 rounded">BCA</span>
                </div>
                <div>
                  <p className="font-mono font-bold text-sm text-[#1E1916]">8920192819</p>
                  <p className="text-[10px] text-[#7C634F]">a/n PT SENNA &amp; GRACE LUXURY</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("8920192819", "bca-rek")}
                  className="w-full text-center text-xs border border-[#EAE6DF] bg-white hover:bg-neutral-50 py-1.5 rounded-lg text-[#1E1916] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedBankKey === "bca-rek" ? (
                    <>
                      <Check size={12} className="text-green-600" />
                      <span className="text-green-600 text-[11px]">Rekening Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Salin No. Rekening</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-[#EAE6DF] pt-4 space-y-2.5 text-[11px] text-[#7C634F]">
                <div className="flex justify-between">
                  <span>Waktu Pemesanan</span>
                  <span className="font-medium text-[#1E1916]">
                    {new Date(order.tanggal).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Metode</span>
                  <span className="font-medium text-[#1E1916]">Dropship Partner Portal</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                {order.status === "Menunggu Pembayaran" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDuitkuModal(true)}
                      className="w-full h-12 bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 rounded-xl hover:from-emerald-800 hover:to-teal-900 transition-all shadow-sm"
                      id="btn-duitku-details"
                    >
                      <CreditCard size={16} />
                      <span>Bayar via Duitku Gateway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="w-full h-10 border border-[#1E1916] text-[#1E1916] text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 rounded-xl hover:bg-neutral-50 transition-all"
                      id="btn-pay-details"
                    >
                      <Upload size={14} />
                      <span>{order.buktiPembayaran ? "Ubah Bukti Transfer" : "Upload Bukti Manual"}</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="w-full h-10 border border-[#EAE6DF] hover:border-[#1E1916] bg-white text-[#7C634F] hover:text-[#1E1916] text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 rounded-xl transition-all"
                  id="btn-contact-admin"
                >
                  <MessageSquare size={14} />
                  <span>Bantuan / Hubungi Admin</span>
                </button>
              </div>

              <div className="text-center text-[9px] text-[#B3A69C] uppercase tracking-widest font-mono">
                Order Reference: {order.id}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* DUITKU PAYMENT GATEWAY MODAL */}
      <DuitkuPaymentModal
        order={order}
        isOpen={showDuitkuModal}
        onClose={() => setShowDuitkuModal(false)}
      />

      {/* UPLOAD MODAL */}
      <UploadBuktiModal
        order={order}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* RECEIPT LIGHTBOX */}
      <ReceiptLightboxModal
        order={order}
        isOpen={showLightboxModal}
        onClose={() => setShowLightboxModal(false)}
      />

      {/* CONTACT DIALOG */}
      {showContactModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactModal(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full border border-[#EAE6DF] p-6 space-y-6 shadow-2xl animate-in scale-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="bg-[#FAF9F6] text-[#B39274] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-lg font-bold text-[#1E1916]">Hubungi Admin via WhatsApp</h4>
              <p className="text-xs text-[#7C634F] font-normal">
                Sistem akan membuat tautan pesan otomatis berisi referensi pesanan <strong>{order.id}</strong> Anda.
              </p>
            </div>

            <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-4 rounded-xl text-xs text-[#7C634F] font-mono text-left break-words">
              {waMessage}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2.5 border border-[#EAE6DF] hover:border-[#1E1916] text-xs uppercase font-bold rounded-lg"
              >
                Batal
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-bold rounded-lg text-center flex items-center justify-center gap-1.5"
              >
                <span>Kirim Chat</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </ResellerLayout>
  );
}

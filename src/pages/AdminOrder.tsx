import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import AdminLayout from "../components/AdminLayout";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  RefreshCw, 
  X, 
  Check, 
  Edit3, 
  User as UserIcon, 
  Eye, 
  ShieldCheck, 
  PackageCheck, 
  ClipboardList, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Copy, 
  ExternalLink,
  Package,
  AlertCircle,
  Zap
} from "lucide-react";
import { Order, OrderStatus } from "../types";
import ReceiptLightboxModal from "../components/ReceiptLightboxModal";

export default function AdminOrder() {
  const { orders, updateOrderStatus, verifyPaymentProof } = useApp();

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "perlu_verifikasi" | "lunas_siap_kirim" | "Dikirim" | "Selesai">("all");

  // Quick Resi & Fulfillment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusInput, setStatusInput] = useState<OrderStatus>("Diproses");
  const [resiInput, setResiInput] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("JNE Express");

  // Receipt Lightbox modal state for admin manual proof inspection
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard ESC for Update Modal
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleOpenFulfillment = (order: Order, defaultNextStatus?: OrderStatus) => {
    setSelectedOrder(order);
    
    // Auto-detect courier from order.jenisPengiriman or default to JNE
    if (order.jenisPengiriman?.toLowerCase().includes("sicepat")) {
      setSelectedCourier("SiCepat Ekspres");
    } else if (order.jenisPengiriman?.toLowerCase().includes("j&t") || order.jenisPengiriman?.toLowerCase().includes("jnt")) {
      setSelectedCourier("J&T Express");
    } else if (order.jenisPengiriman?.toLowerCase().includes("gosend") || order.jenisPengiriman?.toLowerCase().includes("grab")) {
      setSelectedCourier("GoSend Instant");
    } else {
      setSelectedCourier("JNE Express");
    }

    if (defaultNextStatus) {
      setStatusInput(defaultNextStatus);
    } else if (order.status === "Dibayar") {
      setStatusInput("Diproses");
    } else if (order.status === "Diproses") {
      setStatusInput("Dikirim");
    } else {
      setStatusInput(order.status);
    }

    setResiInput(order.nomorResi || "");
    setShowModal(true);
  };

  const handleOpenReceipt = (order: Order) => {
    setReceiptOrder(order);
    setShowReceiptModal(true);
  };

  const handleAdminVerifyProof = (approved: boolean) => {
    if (!receiptOrder) return;
    verifyPaymentProof(receiptOrder.id, approved);
    setShowReceiptModal(false);
    triggerToast(
      approved
        ? `Bukti transfer order ${receiptOrder.id} berhasil DIVERIFIKASI! Status kini Diproses.`
        : `Bukti transfer order ${receiptOrder.id} DITOLAK.`
    );
    setReceiptOrder(null);
  };

  const handleQuickAdvanceToDiproses = (order: Order) => {
    updateOrderStatus(order.id, "Diproses", order.nomorResi);
    triggerToast(`Order ${order.id} dipindahkan ke status DIPROSES (Packing & QC).`);
  };

  const handleQuickAdvanceToSelesai = (order: Order) => {
    updateOrderStatus(order.id, "Selesai", order.nomorResi);
    triggerToast(`Order ${order.id} ditandai SELESAI (Paket Diterima).`);
  };

  const handleGenerateDemoResi = () => {
    const courierCode = selectedCourier.includes("JNE") 
      ? "JNE" 
      : selectedCourier.includes("SiCepat") 
      ? "SICEPAT" 
      : selectedCourier.includes("J&T") 
      ? "JNT" 
      : "EXP";
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    setResiInput(`${courierCode}-${randomDigits}`);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (statusInput === "Dikirim" && !resiInput.trim()) {
      triggerToast("Mohon masukkan nomor resi pengiriman asli sebelum menandai Dikirim.");
      return;
    }

    updateOrderStatus(selectedOrder.id, statusInput, resiInput.trim() || undefined);
    triggerToast(`Status order ${selectedOrder.id} berhasil diperbarui menjadi ${statusInput}.`);
    setShowModal(false);
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "Menunggu Pembayaran":
        if (order.buktiPembayaran && order.statusVerifikasiBukti !== "Diverifikasi (Duitku Gateway)") {
          return (
            <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max">
              <Clock size={10} className="text-amber-600 animate-pulse" />
              <span>Verifikasi Struk</span>
            </span>
          );
        }
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max">
            <Clock size={10} />
            <span>Belum Bayar</span>
          </span>
        );
      case "Dibayar":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max shadow-2xs">
            <Zap size={10} className="text-emerald-600 fill-emerald-600" />
            <span>Lunas (Duitku)</span>
          </span>
        );
      case "Diproses":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max">
            <RefreshCw size={10} className="animate-spin text-blue-600" />
            <span>Packing &amp; QC</span>
          </span>
        );
      case "Dikirim":
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max">
            <Truck size={10} className="text-purple-600" />
            <span>Dikirim</span>
          </span>
        );
      case "Selesai":
        return (
          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 w-max">
            <CheckCircle2 size={10} className="text-green-600" />
            <span>Selesai</span>
          </span>
        );
    }
  };

  // Tab counts
  const counts = useMemo(() => {
    const total = orders.length;
    // Manual slips strictly need review: uploaded proof, status "Menunggu Pembayaran", and NOT auto-verified by Duitku
    const pendingManual = orders.filter(
      o => o.buktiPembayaran && 
           o.status === "Menunggu Pembayaran" && 
           o.statusVerifikasiBukti !== "Diverifikasi (Duitku Gateway)"
    ).length;
    // Orders paid via Duitku Gateway or verified manual, ready for packing & QC
    const siapKirim = orders.filter(o => o.status === "Dibayar" || o.status === "Diproses").length;
    const dikirim = orders.filter(o => o.status === "Dikirim").length;
    const selesai = orders.filter(o => o.status === "Selesai").length;
    return { total, pendingManual, siapKirim, dikirim, selesai };
  }, [orders]);

  // Filter logic based on tab and search query
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status tab filter
    if (activeTab === "perlu_verifikasi") {
      result = result.filter(
        o => o.buktiPembayaran && 
             o.status === "Menunggu Pembayaran" && 
             o.statusVerifikasiBukti !== "Diverifikasi (Duitku Gateway)"
      );
    } else if (activeTab === "lunas_siap_kirim") {
      result = result.filter(o => o.status === "Dibayar" || o.status === "Diproses");
    } else if (activeTab === "Dikirim") {
      result = result.filter(o => o.status === "Dikirim");
    } else if (activeTab === "Selesai") {
      result = result.filter(o => o.status === "Selesai");
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        o => 
          o.id.toLowerCase().includes(q) ||
          o.namaUser.toLowerCase().includes(q) ||
          o.emailUser.toLowerCase().includes(q) ||
          (o.duitkuReference && o.duitkuReference.toLowerCase().includes(q)) ||
          (o.alamatPengiriman?.kotaKabupaten && o.alamatPengiriman.kotaKabupaten.toLowerCase().includes(q)) ||
          (o.alamatPengiriman?.provinsi && o.alamatPengiriman.provinsi.toLowerCase().includes(q)) ||
          (o.nomorResi && o.nomorResi.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  return (
    <AdminLayout pageTitle="Manajemen Order &amp; Resi">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12100E] text-[#FAF9F6] border border-[#B39274]/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">
                Order Fulfillment Ledger
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Zap size={10} className="fill-emerald-600 text-emerald-600" />
                Duitku Auto-Verify Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1916]">
              Manajemen Order &amp; Ekspedisi
            </h1>
            <p className="text-xs text-[#7C634F] font-normal max-w-2xl">
              Alur pemrosesan terintegrasi: Pembayaran Duitku diverifikasi otomatis (admin tidak perlu cek mutasi). Admin fokus pada Quality Control, Packing, dan input nomor resi kurir asli.
            </p>
          </div>

          <div className="bg-[#FAF9F6] border border-[#EAE6DF] px-4 py-3 rounded-2xl flex items-center gap-3 text-xs self-start md:self-auto shadow-2xs">
            <PackageCheck size={18} className="text-[#B39274]" />
            <div>
              <p className="text-[10px] text-[#7C634F] uppercase font-bold">Alur Pengiriman</p>
              <p className="text-xs font-bold text-[#1E1916]">Otomatis Lunas &rarr; Packing &rarr; Resi</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS & TABLE SECTION */}
      <section className="p-4 sm:p-6 lg:p-8 flex-grow bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Quick Filters and Search Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EAE6DF] shadow-xs">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setActiveTab("all")}
                className={`text-xs tracking-wider font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "all" ? "bg-[#12100E] text-white shadow-xs font-bold" : "bg-[#FAF9F6] text-[#7C634F] hover:bg-gray-100"
                }`}
                id="admin-tab-all"
              >
                Semua ({counts.total})
              </button>

              {/* Siap Dikirim / Lunas Duitku Tab */}
              <button
                onClick={() => setActiveTab("lunas_siap_kirim")}
                className={`text-xs tracking-wider font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === "lunas_siap_kirim" 
                    ? "bg-emerald-700 text-white shadow-xs" 
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
                id="admin-tab-siap-kirim"
              >
                <Zap size={13} className={activeTab === "lunas_siap_kirim" ? "fill-white text-white" : "fill-emerald-600 text-emerald-600"} />
                <span>Siap Packing &amp; Kirim</span>
                {counts.siapKirim > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeTab === "lunas_siap_kirim" ? "bg-emerald-950 text-white" : "bg-emerald-700 text-white"
                  }`}>
                    {counts.siapKirim}
                  </span>
                )}
              </button>

              {/* Manual Transfer Verification Tab (only if manual slip uploaded) */}
              <button
                onClick={() => setActiveTab("perlu_verifikasi")}
                className={`text-xs tracking-wider font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === "perlu_verifikasi" ? "bg-amber-600 text-white shadow-xs" : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                }`}
                id="admin-tab-verifikasi"
              >
                <ShieldCheck size={13} />
                <span>Verifikasi Transfer Manual</span>
                {counts.pendingManual > 0 && (
                  <span className="bg-amber-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {counts.pendingManual}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("Dikirim")}
                className={`text-xs tracking-wider font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "Dikirim" ? "bg-[#12100E] text-white shadow-xs font-bold" : "bg-[#FAF9F6] text-[#7C634F] hover:bg-gray-100"
                }`}
                id="admin-tab-dikirim"
              >
                Sedang Dikirim ({counts.dikirim})
              </button>

              <button
                onClick={() => setActiveTab("Selesai")}
                className={`text-xs tracking-wider font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "Selesai" ? "bg-[#12100E] text-white shadow-xs font-bold" : "bg-[#FAF9F6] text-[#7C634F] hover:bg-gray-100"
                }`}
                id="admin-tab-selesai"
              >
                Selesai ({counts.selesai})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C634F]" />
              <input
                type="text"
                placeholder="Cari ID, reseller, kota, resi, Duitku ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:border-[#1E1916] rounded-xl font-medium"
                id="admin-search-orders"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C634F] hover:text-[#1E1916]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] text-[10px] tracking-widest uppercase text-[#7C634F] border-b border-[#EAE6DF] font-bold">
                    <th className="py-3.5 px-5">ID Order &amp; Waktu</th>
                    <th className="py-3.5 px-5">Reseller Dropship</th>
                    <th className="py-3.5 px-5">Status Pembayaran</th>
                    <th className="py-3.5 px-5">Tujuan &amp; Ekspedisi</th>
                    <th className="py-3.5 px-5">Resi Pengiriman</th>
                    <th className="py-3.5 px-5 text-right">Total Tagihan</th>
                    <th className="py-3.5 px-5 text-center">Status Alur</th>
                    <th className="py-3.5 px-5 text-center">Aksi Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6DF] text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-[#7C634F]">
                        <ClipboardList size={36} className="mx-auto text-[#B3A69C] mb-2 opacity-50" />
                        <p className="font-semibold text-sm text-[#1E1916]">Tidak ada transaksi ditemukan</p>
                        <p className="text-xs text-[#7C634F] mt-0.5">Coba sesuaikan kata kunci pencarian atau tab filter di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const isDuitkuPaid = o.status === "Dibayar" || o.statusVerifikasiBukti === "Diverifikasi (Duitku Gateway)";
                      const hasManualProof = o.buktiPembayaran && o.statusVerifikasiBukti !== "Diverifikasi (Duitku Gateway)";

                      return (
                        <tr key={o.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          
                          {/* 1. Order ID & Date */}
                          <td className="py-3.5 px-5">
                            <p className="font-mono font-bold text-[#1E1916] text-xs">{o.id}</p>
                            <p className="text-[10px] text-[#7C634F] mt-0.5">
                              {new Date(o.tanggal).toLocaleDateString("id-ID", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            {o.duitkuReference && (
                              <span className="inline-block mt-1 text-[9px] font-mono text-[#B39274] bg-[#FAF9F6] border border-[#EAE6DF] px-1.5 py-0.2 rounded">
                                Ref: {o.duitkuReference.slice(0, 16)}
                              </span>
                            )}
                          </td>

                          {/* 2. Customer details */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] text-[#7C634F] border border-[#EAE6DF] flex items-center justify-center shrink-0">
                                <UserIcon size={14} />
                              </div>
                              <div className="min-w-0 max-w-[140px]">
                                <p className="font-bold text-[#1E1916] truncate text-xs">{o.namaUser}</p>
                                <p className="text-[10px] text-[#7C634F] truncate">{o.emailUser}</p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Status Pembayaran (Auto Duitku vs Manual) */}
                          <td className="py-3.5 px-5">
                            {isDuitkuPaid ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                                  <Zap size={10} className="fill-emerald-600 text-emerald-600" />
                                  <span>Lunas (Duitku)</span>
                                </span>
                                <p className="text-[9px] text-emerald-700 font-medium">
                                  Metode: {o.duitkuPaymentMethod || "QRIS / VA"}
                                </p>
                                <p className="text-[9px] text-[#7C634F] italic">
                                  *Otomatis diverifikasi gateway
                                </p>
                              </div>
                            ) : hasManualProof ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenReceipt(o)}
                                  className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-[#EAE6DF] shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative group shadow-2xs"
                                  title="Klik untuk melihat bukti transfer manual"
                                >
                                  <img
                                    src={o.buktiPembayaran}
                                    alt="Bukti Transfer"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Eye size={12} />
                                  </div>
                                </button>
                                <div className="space-y-1">
                                  {o.statusVerifikasiBukti === "Terverifikasi" ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                      <Check size={10} className="stroke-[3]" />
                                      <span>Terverifikasi</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReceipt(o)}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 cursor-pointer transition-colors"
                                    >
                                      <ShieldCheck size={11} className="text-amber-600" />
                                      <span>Verifikasi Struk</span>
                                    </button>
                                  )}
                                  <p className="text-[10px] text-[#7C634F] truncate max-w-[100px]">
                                    {o.namaPengirimTransfer || o.namaUser}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                                <Clock size={11} />
                                <span>Belum Dibayar</span>
                              </span>
                            )}
                          </td>

                          {/* 4. Real Destination Address & Courier */}
                          <td className="py-3.5 px-5">
                            <div className="max-w-[210px] space-y-1">
                              <p className="text-xs font-semibold text-[#1E1916] line-clamp-1">
                                {o.alamatPengiriman?.kotaKabupaten || "Tujuan"}, {o.alamatPengiriman?.provinsi || ""}
                              </p>
                              <p className="text-[10px] text-[#7C634F] truncate">
                                Kec. {o.alamatPengiriman?.kecamatan || "-"}, {o.alamatPengiriman?.alamat}
                              </p>
                              <div className="flex items-center justify-between text-[10px] pt-0.5">
                                <span className="font-bold text-[#B39274] bg-[#FAF9F6] border border-[#EAE6DF] px-1.5 py-0.2 rounded truncate max-w-[120px]">
                                  {o.jenisPengiriman || "JNE Express"}
                                </span>
                                <span className="font-mono text-gray-500">
                                  {formatIDR(o.ongkosKirim || 0)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 5. Tracking Resi Column */}
                          <td className="py-3.5 px-5">
                            {o.nomorResi ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-[#1E1916] bg-[#FAF9F6] border border-[#EAE6DF] px-2 py-0.5 rounded-md inline-block">
                                    {o.nomorResi}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyResi(o.nomorResi!)}
                                    className="p-1 text-[#7C634F] hover:text-[#1E1916] cursor-pointer"
                                    title="Salin No Resi"
                                  >
                                    {copiedResi === o.nomorResi ? (
                                      <Check size={12} className="text-green-600" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                </div>
                                <span className="text-[9px] text-[#7C634F] block">
                                  {o.jenisPengiriman?.split("-")[0]?.trim() || "Ekspedisi Logistik"}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenFulfillment(o, "Dikirim")}
                                disabled={o.status === "Menunggu Pembayaran"}
                                className="text-[10px] font-bold text-[#B39274] hover:text-[#1E1916] disabled:text-neutral-400 disabled:cursor-not-allowed border border-dashed border-[#B39274]/50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                              >
                                + Input Resi
                              </button>
                            )}
                          </td>

                          {/* 6. Total Tagihan */}
                          <td className="py-3.5 px-5 text-right font-bold text-[#1E1916] font-mono">
                            {formatIDR(o.totalTagihan)}
                          </td>

                          {/* 7. Status Alur */}
                          <td className="py-3.5 px-5">
                            <div className="flex justify-center">
                              {getStatusBadge(o)}
                            </div>
                          </td>

                          {/* 8. Action Workflow Buttons */}
                          <td className="py-3.5 px-5 text-center">
                            {o.status === "Dibayar" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdvanceToDiproses(o)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Mulai Packing & QC barang"
                                >
                                  <Package size={11} />
                                  <span>Packing</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenFulfillment(o, "Dikirim")}
                                  className="bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Input Resi & Langsung Kirim"
                                >
                                  <Truck size={11} />
                                  <span>Kirim</span>
                                </button>
                              </div>
                            ) : o.status === "Diproses" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenFulfillment(o, "Dikirim")}
                                className="bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-2xs mx-auto"
                              >
                                <Truck size={12} />
                                <span>Input Resi Logistik</span>
                              </button>
                            ) : o.status === "Dikirim" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdvanceToSelesai(o)}
                                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Tandai paket telah diterima reseller/pelanggan"
                                >
                                  <Check size={11} />
                                  <span>Selesai</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenFulfillment(o)}
                                  className="bg-neutral-100 hover:bg-neutral-200 text-[#1E1916] text-[10px] font-bold px-2 py-1.5 rounded-lg cursor-pointer"
                                  title="Edit Resi atau Status"
                                >
                                  <Edit3 size={11} />
                                </button>
                              </div>
                            ) : o.status === "Selesai" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenFulfillment(o)}
                                className="bg-neutral-100 hover:bg-neutral-200 text-[#7C634F] text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer mx-auto flex items-center gap-1"
                              >
                                <CheckCircle2 size={11} className="text-green-600" />
                                <span>Detail</span>
                              </button>
                            ) : (
                              // Menunggu Pembayaran
                              hasManualProof ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReceipt(o)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-2xs mx-auto"
                                >
                                  <ShieldCheck size={11} />
                                  <span>Verifikasi</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-neutral-400 italic">
                                  Menunggu Bayar
                                </span>
                              )
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK RESI & FULFILLMENT MODAL */}
      {showModal && selectedOrder && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Floating Close Button */}
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] bg-black/80 hover:bg-black text-white p-2.5 sm:p-3 rounded-full shadow-2xl border border-white/20 transition-all cursor-pointer"
            title="Tutup (ESC)"
          >
            <X size={20} className="stroke-[2.5]" />
          </button>

          <div 
            className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden max-w-lg w-full max-h-[min(92vh,800px)] flex flex-col border border-[#EAE6DF] shadow-2xl animate-in scale-in-95 duration-200 my-auto relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#12100E] text-white px-5 py-4 sm:px-6 sm:py-4.5 flex justify-between items-center shrink-0 border-b border-white/10">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#B39274] font-bold block mb-0.5">
                  Order Logistics Fulfillment
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">Alur Ekspedisi &amp; Input Resi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#B3A69C] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveStatus} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain min-h-0">
              
              {/* Order Target & Duitku Payment Status Notice */}
              <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#7C634F] font-mono text-[10px] uppercase font-bold">Invoice Ref:</span>
                  <span className="font-mono font-bold text-[#1E1916]">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#7C634F]">Reseller:</span>
                  <span className="font-bold text-[#1E1916]">{selectedOrder.namaUser} ({selectedOrder.emailUser})</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#7C634F]">Total Tagihan:</span>
                  <span className="font-mono font-extrabold text-[#1E1916]">{formatIDR(selectedOrder.totalTagihan)}</span>
                </div>
              </div>

              {/* Duitku Notice: Admin doesn't need to verify payment */}
              {(selectedOrder.status === "Dibayar" || selectedOrder.statusVerifikasiBukti === "Diverifikasi (Duitku Gateway)") && (
                <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
                  <Zap size={16} className="text-emerald-600 fill-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-900">Pembayaran Terverifikasi Otomatis (Duitku Gateway)</p>
                    <p className="text-[10px] text-emerald-800 leading-relaxed">
                      Sistem payment gateway telah menerima pelunasan. <strong>Admin tidak perlu mengupdate status pembayaran secara manual</strong>. Silakan langsung lanjutkan ke alur packing atau serahkan paket ke kurir logistik.
                    </p>
                  </div>
                </div>
              )}

              {/* Real Destination Address Details Box */}
              <div className="bg-white border border-[#EAE6DF] p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#B39274]">
                  <MapPin size={13} />
                  <span>Detail Alamat Pengiriman Pelanggan</span>
                </div>
                <p className="font-bold text-[#1E1916]">
                  {selectedOrder.alamatPengiriman?.alamat}
                </p>
                <p className="text-[11px] text-[#7C634F]">
                  Kel. {selectedOrder.alamatPengiriman?.kelurahan}, Kec. {selectedOrder.alamatPengiriman?.kecamatan}
                </p>
                <p className="text-[11px] text-[#7C634F]">
                  {selectedOrder.alamatPengiriman?.kotaKabupaten}, {selectedOrder.alamatPengiriman?.provinsi} - Kode Pos: {selectedOrder.alamatPengiriman?.kodePos}
                </p>
                <div className="pt-2 border-t border-[#EAE6DF] flex justify-between items-center text-[11px]">
                  <span className="text-[#7C634F]">Ekspedisi Terpilih Reseller:</span>
                  <span className="font-bold text-[#1E1916] bg-[#FAF9F6] border border-[#EAE6DF] px-2 py-0.5 rounded">
                    {selectedOrder.jenisPengiriman} ({formatIDR(selectedOrder.ongkosKirim || 0)})
                  </span>
                </div>
              </div>

              {/* Status Alur Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                  Update Tahapan Alur Pesanan
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl font-bold cursor-pointer"
                  id="select-modal-order-status"
                >
                  <option value="Dibayar">Lunas (Menunggu Antrian Packing QC)</option>
                  <option value="Diproses">Diproses (Sedang Packing &amp; Quality Check Tas Mewah)</option>
                  <option value="Dikirim">Dikirim (Barang Diserahkan ke Kurir Logistik &amp; Input Resi)</option>
                  <option value="Selesai">Selesai (Pesanan Tiba di Reseller/Pelanggan)</option>
                </select>
              </div>

              {/* Courier Provider Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                  Kurir Ekspedisi
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl font-semibold cursor-pointer"
                >
                  <option value="JNE Express">JNE Express (REG / YES)</option>
                  <option value="SiCepat Ekspres">SiCepat Ekspres (REG / HALU)</option>
                  <option value="J&T Express">J&amp;T Express (EZ)</option>
                  <option value="GoSend Instant">GoSend / GrabExpress Instant</option>
                  <option value="POS Indonesia">POS Indonesia (Kilat Khusus)</option>
                </select>
              </div>

              {/* Input Nomor Resi Pengiriman Asli */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Nomor Resi Logistik {statusInput === "Dikirim" && <span className="text-red-600">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDemoResi}
                    className="text-[9px] text-[#B39274] hover:text-[#1E1916] font-bold border border-[#B39274]/30 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Generate Resi Contoh
                  </button>
                </div>
                
                <input
                  type="text"
                  value={resiInput}
                  onChange={(e) => setResiInput(e.target.value)}
                  placeholder="Ketik nomor resi asli (Cth: JNE-8829104812, SICEPAT-009218201)"
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl font-mono font-bold"
                  id="input-modal-resi"
                />
                <p className="text-[10px] text-[#7C634F] leading-tight">
                  Nomor resi ini akan langsung dapat dilacak dan disalin oleh reseller di portal &quot;Pesanan Saya&quot;.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2.5 border-t border-[#EAE6DF]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#EAE6DF] hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-xs uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  id="btn-save-order-fulfillment"
                >
                  <Check size={14} />
                  <span>Simpan Alur Pesanan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RECEIPT INSPECTION LIGHTBOX MODAL */}
      {receiptOrder && (
        <ReceiptLightboxModal
          order={receiptOrder}
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptOrder(null);
          }}
          isAdmin={true}
          onVerify={handleAdminVerifyProof}
        />
      )}

    </AdminLayout>
  );
}

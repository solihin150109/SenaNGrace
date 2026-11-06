import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import {
  Award,
  TrendingUp,
  Check,
  Shield,
  Send,
  Briefcase,
  Store,
  Calendar,
  Layers,
  Sparkles,
  FileCheck
} from "lucide-react";

export default function LevelReseller() {
  const { currentUser, orders, updateUserProfile } = useApp();

  // Local Form states for manual level claim
  const [targetLevel, setTargetLevel] = useState("Silver");
  const [boutiqueName, setBoutiqueName] = useState("");
  const [offlineSales, setOfflineSales] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [claimStatus, setClaimStatus] = useState<"idle" | "success">("idle");

  // 1. Calculate active reseller statistics based on their processed orders
  const stats = useMemo(() => {
    if (!currentUser) return { count: 0, bags: 0, omzet: 0 };

    const resellerOrders = orders.filter(
      (o) => o.userId === currentUser.id && o.status !== "Menunggu Pembayaran"
    );

    const totalBags = resellerOrders.reduce((sum, o) => {
      return sum + o.details.reduce((sub, d) => sub + d.jumlah, 0);
    }, 0);

    const totalOmzet = resellerOrders.reduce((sum, o) => sum + o.totalTagihan, 0);

    return {
      count: resellerOrders.length,
      bags: totalBags,
      omzet: totalOmzet
    };
  }, [currentUser, orders]);

  // 2. Identify Tier based on completed/processed orders count (50: Silver, 100: Gold, 200: Premium)
  const currentTier = useMemo(() => {
    if (!currentUser) return "Bronze";
    
    // Check if admin has assigned a custom tier override
    if ((currentUser as any).customTier) {
      return (currentUser as any).customTier;
    }

    if (stats.count >= 200) {
      return "Premium";
    } else if (stats.count >= 100) {
      return "Gold";
    } else if (stats.count >= 50) {
      return "Silver";
    }
    return "Bronze";
  }, [currentUser, stats]);

  // Calculate milestone progress toward next tier
  const milestone = useMemo(() => {
    const isTier = (t: string) => currentTier.toLowerCase().includes(t.toLowerCase());

    if (isTier("bronze") || (stats.count < 50 && !isTier("silver") && !isTier("gold") && !isTier("premium"))) {
      const ordersNeeded = Math.max(0, 50 - stats.count);
      const progressPercent = Math.min(100, Math.round((stats.count / 50) * 100));
      return {
        next: "Silver",
        targetCount: 50,
        ordersNeeded,
        progressPercent,
        benefits: ["Margin diskon kemitraan Silver", "Prioritas alokasi ketersediaan stok gudang", "Sertifikat resmi Silver Reseller"]
      };
    } else if (isTier("silver") || (stats.count >= 50 && stats.count < 100 && !isTier("gold") && !isTier("premium"))) {
      const ordersNeeded = Math.max(0, 100 - stats.count);
      const progressPercent = Math.min(100, Math.round((stats.count / 100) * 100));
      return {
        next: "Gold",
        targetCount: 100,
        ordersNeeded,
        progressPercent,
        benefits: ["Margin diskon Gold yang lebih tinggi", "Prioritas penjemputan kurir ekspedisi", "Dukungan Customer Support Prioritas"]
      };
    } else if (isTier("gold") || (stats.count >= 100 && stats.count < 200 && !isTier("premium"))) {
      const ordersNeeded = Math.max(0, 200 - stats.count);
      const progressPercent = Math.min(100, Math.round((stats.count / 200) * 100));
      return {
        next: "Premium",
        targetCount: 200,
        ordersNeeded,
        progressPercent,
        benefits: ["Diskon kemitraan tertinggi (Wholesale VIP)", "Private concierge direct line 24/7", "Akses pre-order koleksi tas langka eksklusif"]
      };
    }
    // Premium
    return {
      next: "Maksimal",
      targetCount: 200,
      ordersNeeded: 0,
      progressPercent: 100,
      benefits: []
    };
  }, [currentTier, stats]);

  // 3. Concierge evaluation advice generator
  const conciergeAdvice = useMemo(() => {
    const isTier = (t: string) => currentTier.toLowerCase().includes(t.toLowerCase());

    if (isTier("bronze")) {
      return {
        status: "Tahap Awal",
        color: "text-[#7C634F] bg-[#FAF9F6] border-[#EAE6DF]",
        message: `Anda telah mencatatkan ${stats.count} pemesanan. Lakukan ${milestone.ordersNeeded} pemesanan lagi untuk mencapai tingkat kemitraan Silver (50 Pemesanan)!`
      };
    } else if (isTier("silver")) {
      return {
        status: "Performa Aktif (Silver)",
        color: "text-slate-700 bg-slate-100 border-slate-300",
        message: `Hebat! Anda berada di level Silver dengan total ${stats.count} pemesanan. Selesaikan ${milestone.ordersNeeded} pemesanan lagi untuk naik ke level Gold (100 Pemesanan).`
      };
    } else if (isTier("gold")) {
      return {
        status: "Performa Unggul (Gold)",
        color: "text-amber-800 bg-amber-50 border-amber-300",
        message: `Luar biasa! Anda berada di level Gold dengan ${stats.count} pemesanan. Hanya tersisa ${milestone.ordersNeeded} pemesanan untuk meraih level tertinggi: Premium (200 Pemesanan)!`
      };
    }
    return {
      status: "Tingkat Tertinggi (Premium)",
      color: "text-[#B39274] bg-[#12100E] border-[#B39274]",
      message: `Selamat! Anda adalah mitra Premium (${stats.count} pemesanan). Nikmati hak istimewa terlengkap, alokasi stok VIP langsung, dan margin diskon maksimal di Senna & Grace.`
    };
  }, [currentTier, stats, milestone]);

  // Handle Level Upgrade Request Submission
  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boutiqueName || !offlineSales || !reasonText) return;

    // Simulate save by updating user metadata in state
    updateUserProfile({
      levelClaimRequest: {
        targetLevel,
        boutiqueName,
        offlineSales,
        reasonText,
        submittedAt: new Date().toISOString()
      }
    } as any);

    setClaimStatus("success");
    setTimeout(() => {
      // Clear forms
      setBoutiqueName("");
      setOfflineSales("");
      setReasonText("");
    }, 1500);
  };

  const getTierBadgeStyle = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes("premium")) return "bg-[#12100E] text-[#B39274] border-[#B39274]";
    if (t.includes("gold")) return "bg-amber-50 text-amber-800 border-amber-300";
    if (t.includes("silver")) return "bg-slate-100 text-slate-800 border-slate-300";
    return "bg-[#FAF9F6] text-[#7C634F] border-[#EAE6DF]";
  };

  return (
    <ResellerLayout pageTitle="Level Kemitraan Saya">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* HEADER SECTION */}
        <section className="bg-white border border-[#EAE6DF] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#B39274] font-bold">Reseller Milestone</span>
            <h2 className="text-2xl font-bold tracking-tight text-[#1E1916]">Evaluasi &amp; Kualifikasi Level Anda</h2>
            <p className="text-xs text-[#7C634F] font-normal">
              Tingkatkan jumlah transaksi pemesanan Anda untuk membuka tingkatan kemitraan yang lebih eksklusif.
            </p>
          </div>
          
          <div className="bg-[#FAF9F6] border border-[#EAE6DF] px-4.5 py-3 rounded-xl flex items-center gap-3">
            <Award className="text-[#B39274]" size={28} />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#7C634F] font-bold block">LEVEL AKTIF</span>
              <p className="text-sm font-bold text-[#1E1916]">{currentTier}</p>
            </div>
          </div>
        </section>

        {/* METRICS & PROGRESS TRACKER */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* PROGRESS MILESTONE CARD */}
          <div className="md:col-span-7 bg-white border border-[#EAE6DF] rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C634F]">Progres Milestone Kemitraan</h3>
                {milestone.next !== "Maksimal" && (
                  <span className="text-[10px] bg-[#FAF9F6] text-[#B39274] border border-[#B39274]/40 font-bold px-2 py-0.5 rounded">
                    Menuju Level {milestone.next}
                  </span>
                )}
              </div>

              {milestone.next !== "Maksimal" ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-900">{stats.count} dari {milestone.targetCount} Pemesanan</span>
                    <span className="text-[#B39274] font-mono">{milestone.progressPercent}% Selesai</span>
                  </div>
                  {/* Custom progress bar */}
                  <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#12100E] rounded-full transition-all duration-500"
                      style={{ width: `${milestone.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Target tersisa: Selesaikan <span className="font-bold text-gray-900">{milestone.ordersNeeded} pemesanan</span> lagi untuk naik ke level <strong className="text-[#B39274]">{milestone.next}</strong>!
                  </p>
                </div>
              ) : (
                <div className="bg-[#FAF9F6] border border-[#B39274]/40 p-4 rounded-xl text-center space-y-2">
                  <Award className="text-[#B39274] mx-auto" size={32} />
                  <p className="text-xs font-bold text-[#1E1916]">Level Tertinggi Tercapai: Premium!</p>
                  <p className="text-[11px] text-[#7C634F] leading-normal">
                    Anda sudah berada pada tingkat Premium yang merupakan kasta kemitraan tertinggi di ekosistem Senna &amp; Grace.
                  </p>
                </div>
              )}
            </div>

            {milestone.benefits.length > 0 && (
              <div className="pt-4 border-t border-[#EAE6DF] space-y-2.5">
                <span className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">Keuntungan Level {milestone.next}:</span>
                <div className="grid grid-cols-1 gap-2">
                  {milestone.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <div className="bg-[#FAF9F6] text-[#B39274] border border-[#B39274]/30 p-0.5 rounded-full">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INSTANT CONCIERGE ASSESSMENT */}
          <div className="md:col-span-5 bg-white border border-[#EAE6DF] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="text-[#B39274]" size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C634F]">Status Kemitraan</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Total Pemesanan:</span>
                  <span className="text-xs text-gray-900 font-bold">{stats.count} Pemesanan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Total Tas Terjual:</span>
                  <span className="text-xs text-gray-900 font-bold">{stats.bags} Unit</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400 font-medium">Status Akun:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadgeStyle(currentTier)}`}>
                    {currentTier}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3.5 rounded-xl text-[11px] text-[#7C634F] leading-relaxed">
                "{conciergeAdvice.message}"
              </div>
            </div>

            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Calendar size={11} />
              <span>Pembaruan otomatis real-time berdasarkan riwayat pesanan</span>
            </div>
          </div>

        </section>

        {/* TIER STRUCTURE REFERENCE GRID */}
        <section className="bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#B39274]" />
              <h3 className="text-sm font-bold text-[#1E1916]">Struktur &amp; Kualifikasi Level Kemitraan</h3>
            </div>
            <p className="text-xs text-[#7C634F]">Tingkat level kemitraan ditentukan secara otomatis berdasarkan akumulasi pemesanan yang telah diproses.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            
            {/* Silver Tier */}
            <div className={`p-4 rounded-xl border transition-all ${currentTier.toLowerCase().includes("silver") ? "bg-[#FAF9F6] border-[#B39274]" : "border-[#EAE6DF] bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E1916]">Level Silver</span>
                <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded-full">
                  50 Pemesanan
                </span>
              </div>
              <p className="text-[11px] text-[#7C634F] leading-relaxed">
                Dicapai setelah menyelesaikan minimal <strong>50 pemesanan</strong>. Mendapatkan harga kemitraan Silver dan prioritas stok reguler.
              </p>
            </div>

            {/* Gold Tier */}
            <div className={`p-4 rounded-xl border transition-all ${currentTier.toLowerCase().includes("gold") ? "bg-[#FAF9F6] border-[#B39274]" : "border-[#EAE6DF] bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E1916]">Level Gold</span>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                  100 Pemesanan
                </span>
              </div>
              <p className="text-[11px] text-[#7C634F] leading-relaxed">
                Dicapai setelah menyelesaikan minimal <strong>100 pemesanan</strong>. Mendapatkan diskon khusus Gold dan prioritas penjemputan ekspedisi.
              </p>
            </div>

            {/* Premium Tier */}
            <div className={`p-4 rounded-xl border transition-all ${currentTier.toLowerCase().includes("premium") ? "bg-[#FAF9F6] border-[#B39274]" : "border-[#EAE6DF] bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E1916]">Level Premium</span>
                <span className="text-[10px] bg-[#12100E] text-[#B39274] border border-[#B39274] font-bold px-2 py-0.5 rounded-full">
                  200 Pemesanan
                </span>
              </div>
              <p className="text-[11px] text-[#7C634F] leading-relaxed">
                Kasta kemitraan tertinggi dengan <strong>200 pemesanan</strong>. Akses diskon grosir maksimal, layanan private concierge, dan alokasi produk terbatas.
              </p>
            </div>

          </div>
        </section>

        {/* LEVEL ASSESSMENT REQUEST FORM */}
        <section className="bg-[#12100E] border border-[#231E1A] text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#B39274] font-bold block">EXECUTIVE ASSESSMENT OVERRIDE</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase size={18} className="text-[#B39274]" />
              <span>Ajukan Penilaian Level Khusus (Offline Boutique)</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Apakah Anda memiliki butik fisik (offline store), atau mencatatkan omzet retail tinggi di luar ekosistem ini? Isi formulir ini agar tim auditor Senna &amp; Grace menaikkan tingkat kemitraan Anda secara manual.
            </p>
          </div>

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            
            {claimStatus === "success" && (
              <div className="bg-green-950 border border-green-800 text-green-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in duration-300">
                <FileCheck size={16} className="text-green-400" />
                <span className="font-semibold">Pengajuan berhasil dikirim! Tim konsultan kami akan meninjau dokumen dalam 1x24 jam kerja.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Target Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-wider uppercase font-bold text-neutral-300">Level Yang Diajukan</label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#201C18] border border-[#342E29] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#B39274] rounded-xl cursor-pointer"
                  required
                >
                  <option value="Silver">Silver (50 Pemesanan)</option>
                  <option value="Gold">Gold (100 Pemesanan)</option>
                  <option value="Premium">Premium (200 Pemesanan)</option>
                </select>
              </div>

              {/* Boutique Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-wider uppercase font-bold text-neutral-300">Nama Toko / Butik Fisik</label>
                <input
                  type="text"
                  required
                  value={boutiqueName}
                  onChange={(e) => setBoutiqueName(e.target.value)}
                  placeholder="Contoh: Grace Boutique Plaza"
                  className="w-full px-4 py-2.5 bg-[#201C18] border border-[#342E29] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#B39274] rounded-xl"
                />
              </div>

              {/* Offline Volume */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-wider uppercase font-bold text-neutral-300">Estimasi Penjualan Bulanan (Rp)</label>
                <input
                  type="text"
                  required
                  value={offlineSales}
                  onChange={(e) => setOfflineSales(e.target.value)}
                  placeholder="Contoh: Rp 20.000.000 / Bulan"
                  className="w-full px-4 py-2.5 bg-[#201C18] border border-[#342E29] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#B39274] rounded-xl"
                />
              </div>

            </div>

            {/* Description reason */}
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-wider uppercase font-bold text-neutral-300">Alasan &amp; Bukti Penunjang (Tautan Portofolio / Instagram Toko)</label>
              <textarea
                rows={3}
                required
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Deskripsikan alamat butik, tautan profil Instagram bisnis Anda, atau lampirkan rekam penjualan di e-commerce eksternal untuk mempercepat persetujuan audit."
                className="w-full px-4 py-2.5 bg-[#201C18] border border-[#342E29] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#B39274] rounded-xl resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#B39274] text-[#12100E] hover:bg-white hover:text-[#12100E] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <Send size={13} />
                <span>Kirim Pengajuan Kualifikasi</span>
              </button>
            </div>

          </form>
        </section>

      </div>
    </ResellerLayout>
  );
}
